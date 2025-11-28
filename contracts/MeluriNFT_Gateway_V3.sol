// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ERC721BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import {ERC721EnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {IGatewayZEVM, MessageContext, CallOptions, RevertOptions, RevertContext} from "@zetachain/protocol-contracts/contracts/zevm/interfaces/IGatewayZEVM.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/IZRC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

/**
 * @title MeluriNFT_Gateway_V3
 * @notice Universal NFT contract on ZetaChain with automatic gas token swapping
 * @dev Swaps deposited WZETA to destination chain's ZRC20 for gas payment
 */
contract MeluriNFT_Gateway_V3 is
    Initializable,
    ERC721Upgradeable,
    ERC721URIStorageUpgradeable,
    ERC721EnumerableUpgradeable,
    OwnableUpgradeable,
    ERC721BurnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable
{
    uint256 private _nextTokenId;
    
    IGatewayZEVM public gateway;
    
    // Mapping of ZRC20 token to connected contract address
    mapping(address => bytes) public connected;
    
    // Track tokens that are escrowed during cross-chain transfer
    mapping(uint256 => bool) public escrowed;
    
    struct OutgoingTransfer {
        address originalOwner;
        uint256 tokenId;
        address destinationReceiver;
        address destination;
        string uri;
        uint256 timestamp;
        bool completed;
        bool reverted;
    }
    
    mapping(bytes32 => OutgoingTransfer) public outgoingTransfers;
    
    // V3 additions - must be at the end for upgrade compatibility
    IUniswapV2Router02 public uniswapRouter;
    address public wzeta; // Wrapped ZETA token
    
    event TokenTransfer(
        bytes32 indexed transferId,
        address indexed destination,
        address indexed receiver,
        uint256 tokenId,
        string uri,
        uint256 timestamp
    );
    event TokenTransferReceived(address indexed receiver, uint256 indexed tokenId, string uri);
    event TokenTransferCompleted(bytes32 indexed transferId);
    event TokenTransferReverted(bytes32 indexed transferId, address indexed receiver, uint256 tokenId);
    event SetConnected(address indexed zrc20, bytes contractAddress);
    event GasSwapped(address indexed fromToken, address indexed toToken, uint256 amountIn, uint256 amountOut);
    
    error InvalidAddress();
    error TransferFailed();
    error TokenNotEscrowed();
    error Unauthorized();
    error InsufficientGasBalance();
    error SwapFailed();
    
    modifier onlyGateway() {
        if (msg.sender != address(gateway)) revert Unauthorized();
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address initialOwner,
        string memory name,
        string memory symbol,
        address gatewayAddress
    ) public initializer {
        __ERC721_init(name, symbol);
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __Ownable_init(initialOwner);
        __ERC721Burnable_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        if (gatewayAddress == address(0)) revert InvalidAddress();
        
        gateway = IGatewayZEVM(gatewayAddress);
    }
    
    /**
     * @notice Initialize V3 features (called after upgrade)
     */
    function initializeV3(
        address uniswapRouterAddress,
        address wzetaAddress
    ) external onlyOwner {
        require(address(uniswapRouter) == address(0), "Already initialized");
        if (uniswapRouterAddress == address(0)) revert InvalidAddress();
        if (wzetaAddress == address(0)) revert InvalidAddress();
        
        uniswapRouter = IUniswapV2Router02(uniswapRouterAddress);
        wzeta = wzetaAddress;
    }

    function mint(address to, string memory uri) public {
        uint256 hash = uint256(
            keccak256(abi.encodePacked(address(this), block.number, _nextTokenId++))
        );
        uint256 tokenId = hash & 0x00FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function setConnected(address zrc20, bytes calldata contractAddress) external onlyOwner {
        if (zrc20 == address(0)) revert InvalidAddress();
        if (contractAddress.length == 0) revert InvalidAddress();
        connected[zrc20] = contractAddress;
        emit SetConnected(zrc20, contractAddress);
    }

    /**
     * @notice Transfer NFT cross-chain (called from ZetaChain)
     * @dev Swaps user's ZETA for destination ZRC20 gas tokens automatically
     */
    function transferCrossChain(
        uint256 tokenId,
        address receiver,
        address destination
    ) external payable nonReentrant returns (bytes32) {
        if (receiver == address(0)) revert InvalidAddress();
        
        address owner = _requireOwned(tokenId);
        if (!_isAuthorized(owner, _msgSender(), tokenId)) {
            revert Unauthorized();
        }

        string memory uri = tokenURI(tokenId);
        bytes32 transferId = keccak256(
            abi.encodePacked(tokenId, receiver, destination, block.timestamp, msg.sender)
        );
        
        _transfer(owner, address(this), tokenId);
        escrowed[tokenId] = true;
        
        outgoingTransfers[transferId] = OutgoingTransfer({
            originalOwner: owner,
            tokenId: tokenId,
            destinationReceiver: receiver,
            destination: destination,
            uri: uri,
            timestamp: block.timestamp,
            completed: false,
            reverted: false
        });
        
        bytes memory message = abi.encode(transferId, receiver, tokenId, uri, msg.sender);
        
        (, uint256 gasFee) = IZRC20(destination).withdrawGasFeeWithGasLimit(500000);
        
        // Check if user has enough ZRC20 tokens
        uint256 userZRC20Balance = IZRC20(destination).balanceOf(msg.sender);
        
        if (userZRC20Balance >= gasFee) {
            // User has ZRC20 tokens, use them directly
            bool success = IZRC20(destination).transferFrom(msg.sender, address(this), gasFee);
            if (!success) revert TransferFailed();
        } else {
            // User sent native ZETA - need to wrap it to WZETA first
            if (msg.value == 0) revert InsufficientGasBalance();
            
            // Wrap native ZETA to WZETA by depositing into WZETA contract
            // WZETA follows WETH9 standard with deposit() function
            (bool wrapSuccess, ) = wzeta.call{value: msg.value}(abi.encodeWithSignature("deposit()"));
            if (!wrapSuccess) revert SwapFailed();
            
            // Now swap WZETA to destination ZRC20 for gas
            uint256 swappedAmount = _swapForGas(wzeta, destination, msg.value, gasFee);
            
            if (swappedAmount < gasFee) {
                revert InsufficientGasBalance();
            }
        }
        
        CallOptions memory callOptions = CallOptions(500000, false);
        RevertOptions memory revertOptions = RevertOptions(
            address(this),
            true,
            address(0),
            abi.encode(transferId, receiver, tokenId, uri, owner),
            0
        );
        
        IZRC20(destination).approve(address(gateway), gasFee);
        
        gateway.call(
            connected[destination],
            destination,
            message,
            callOptions,
            revertOptions
        );
        
        emit TokenTransfer(transferId, destination, receiver, tokenId, uri, block.timestamp);
        
        return transferId;
    }
    
    function getTransferStatus(bytes32 transferId) external view returns (OutgoingTransfer memory) {
        return outgoingTransfers[transferId];
    }
    
    function isEscrowed(uint256 tokenId) external view returns (bool) {
        return escrowed[tokenId];
    }

    /**
     * @notice Handle incoming cross-chain message with automatic gas swapping
     */
    function onCall(
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external onlyGateway {
        if (keccak256(context.sender) != keccak256(connected[zrc20])) {
            revert Unauthorized();
        }

        (bytes32 transferId, address destination, address receiver, uint256 tokenId, string memory uri, address sender) = abi.decode(
            message,
            (bytes32, address, address, uint256, string, address)
        );

        // Emit event to debug what destination we received
        emit TokenTransfer(transferId, destination, receiver, tokenId, uri, block.timestamp);

        // If destination is address(0), mint on ZetaChain (final destination)
        // Otherwise, route to the destination chain
        if (destination == address(0)) {
            _safeMint(receiver, tokenId);
            _setTokenURI(tokenId, uri);
            
            if (outgoingTransfers[transferId].tokenId == tokenId) {
                outgoingTransfers[transferId].completed = true;
                if (escrowed[tokenId] && ownerOf(tokenId) == address(this)) {
                    escrowed[tokenId] = false;
                    _burn(tokenId);
                }
                emit TokenTransferCompleted(transferId);
            }
            
            emit TokenTransferReceived(receiver, tokenId, uri);
        } else {
            // Route to another chain - swap deposited token to destination gas token
            (, uint256 gasFee) = IZRC20(destination).withdrawGasFeeWithGasLimit(500000);
            
            // Swap zrc20 (deposited token) to destination ZRC20 for gas
            // The deposited tokens are already in this contract from the Gateway
            uint256 swappedAmount = _swapForGas(zrc20, destination, amount, gasFee);
            
            if (swappedAmount < gasFee) {
                revert InsufficientGasBalance();
            }
            
            bytes memory routedMessage = abi.encode(transferId, receiver, tokenId, uri, sender);
            
            CallOptions memory callOptions = CallOptions(500000, false);
            RevertOptions memory revertOptions = RevertOptions(
                address(this),
                true,
                address(0),
                routedMessage,
                0
            );
            
            IZRC20(destination).approve(address(gateway), gasFee);
            
            gateway.call(
                connected[destination],
                destination,
                routedMessage,
                callOptions,
                revertOptions
            );
        }
    }

    /**
     * @notice Swap tokens using Uniswap V2 on ZetaChain
     * @param fromToken Source ZRC20 token
     * @param toToken Destination ZRC20 token
     * @param amountIn Amount of source token to swap
     * @param minAmountOut Minimum amount of destination token required
     * @return Amount of destination token received
     */
    function _swapForGas(
        address fromToken,
        address toToken,
        uint256 amountIn,
        uint256 minAmountOut
    ) internal returns (uint256) {
        // If same token, no swap needed
        if (fromToken == toToken) {
            return amountIn;
        }
        
        // Approve router to spend fromToken
        IZRC20(fromToken).approve(address(uniswapRouter), amountIn);
        
        // Build swap path
        address[] memory path;
        if (fromToken == wzeta || toToken == wzeta) {
            // Direct pair: use 2-hop path
            path = new address[](2);
            path[0] = fromToken;
            path[1] = toToken;
        } else {
            // Need WZETA as intermediary: use 3-hop path
            path = new address[](3);
            path[0] = fromToken;
            path[1] = wzeta;
            path[2] = toToken;
        }
        
        // Execute swap
        uint256[] memory amounts = uniswapRouter.swapExactTokensForTokens(
            amountIn,
            minAmountOut,
            path,
            address(this),
            block.timestamp + 300 // 5 minute deadline
        );
        
        uint256 amountOut = amounts[amounts.length - 1];
        
        emit GasSwapped(fromToken, toToken, amountIn, amountOut);
        
        return amountOut;
    }

    function onRevert(RevertContext calldata context) external onlyGateway {
        (bytes32 transferId, address receiver, uint256 tokenId, string memory uri, address originalOwner) = abi.decode(
            context.revertMessage,
            (bytes32, address, uint256, string, address)
        );
        
        if (outgoingTransfers[transferId].tokenId == tokenId) {
            outgoingTransfers[transferId].reverted = true;
        }
        
        if (escrowed[tokenId] && ownerOf(tokenId) == address(this)) {
            escrowed[tokenId] = false;
            _transfer(address(this), originalOwner, tokenId);
            emit TokenTransferReverted(transferId, originalOwner, tokenId);
        } else {
            _safeMint(originalOwner, tokenId);
            _setTokenURI(tokenId, uri);
            emit TokenTransferReverted(transferId, originalOwner, tokenId);
        }
    }
    
    function rescueEscrowedToken(uint256 tokenId, address to) external onlyOwner {
        if (!escrowed[tokenId]) revert TokenNotEscrowed();
        if (ownerOf(tokenId) != address(this)) revert TokenNotEscrowed();
        
        escrowed[tokenId] = false;
        _transfer(address(this), to, tokenId);
    }

    // Required overrides
    function _update(address to, uint256 tokenId, address auth)
        internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721Upgradeable, ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    receive() external payable {}
}
