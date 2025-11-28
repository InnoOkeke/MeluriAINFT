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
import "@zetachain/protocol-contracts/contracts/evm/interfaces/IGatewayEVM.sol";

/**
 * @title MeluriNFT_EVM_Gateway
 * @notice Connected NFT contract on EVM chains using Gateway directly
 * @dev Simplified cross-chain NFT transfers
 */
contract MeluriNFT_EVM_Gateway is
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
    address public gateway;
    address public universal; // Universal contract on ZetaChain
    
    // Track tokens that are escrowed during cross-chain transfer
    mapping(uint256 => bool) public escrowed;
    
    // Track outgoing transfers for revert handling
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
    
    // Map transfer ID to transfer details
    mapping(bytes32 => OutgoingTransfer) public outgoingTransfers;
    
    // Events
    event TokenTransfer(
        bytes32 indexed transferId,
        address indexed receiver,
        uint256 indexed tokenId,
        string uri,
        uint256 timestamp
    );
    event TokenTransferReceived(address indexed receiver, uint256 indexed tokenId, string uri);
    event TokenTransferCompleted(bytes32 indexed transferId);
    event TokenTransferReverted(bytes32 indexed transferId, address indexed receiver, uint256 tokenId);
    
    error InvalidAddress();
    error Unauthorized();
    error OnlyGateway();
    error TokenNotEscrowed();

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
        gateway = gatewayAddress;
    }

    /**
     * @notice Set universal contract address on ZetaChain
     */
    function setUniversal(address universalAddress) external onlyOwner {
        if (universalAddress == address(0)) revert InvalidAddress();
        universal = universalAddress;
    }

    /**
     * @notice Mint a new NFT
     */
    function mint(address to, string memory uri) public {
        uint256 hash = uint256(
            keccak256(abi.encodePacked(address(this), block.number, _nextTokenId++))
        );
        uint256 tokenId = hash & 0x00FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    /**
     * @notice Transfer NFT cross-chain with escrow and tracking
     * @param tokenId The NFT to transfer
     * @param receiver Receiver address on destination chain
     * @param destination Destination chain identifier (use address(0) for ZetaChain)
     * @return transferId Unique identifier for tracking this transfer
     */
    function transferCrossChain(
        uint256 tokenId,
        address receiver,
        address destination
    ) external payable nonReentrant returns (bytes32) {
        if (receiver == address(0)) revert InvalidAddress();
        if (universal == address(0)) revert InvalidAddress();
        
        address owner = _requireOwned(tokenId);
        if (!_isAuthorized(owner, _msgSender(), tokenId)) {
            revert Unauthorized();
        }

        string memory uri = tokenURI(tokenId);
        
        // Generate unique transfer ID
        bytes32 transferId = keccak256(
            abi.encodePacked(tokenId, receiver, destination, block.timestamp, msg.sender)
        );
        
        // Escrow the token instead of burning (safer for revert handling)
        _transfer(owner, address(this), tokenId);
        escrowed[tokenId] = true;
        
        // Store transfer details for tracking and revert handling
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
        
        // Prepare message payload (include transferId for tracking)
        // If destination is address(0), going to ZetaChain
        // Otherwise, encode destination for routing through ZetaChain
        bytes memory message = abi.encode(transferId, destination, receiver, tokenId, uri, msg.sender);
        
        // Use depositAndCall to send ETH and message to ZetaChain
        // This deposits the ETH and calls the universal contract
        IGatewayEVM(gateway).depositAndCall{value: msg.value}(
            universal,
            message,
            RevertOptions(address(this), true, address(0), abi.encode(transferId, receiver, tokenId, uri, owner), 0)
        );
        
        emit TokenTransfer(transferId, receiver, tokenId, uri, block.timestamp);
        
        return transferId;
    }
    
    /**
     * @notice Query transfer status
     * @param transferId The transfer ID to query
     * @return Transfer details
     */
    function getTransferStatus(bytes32 transferId) external view returns (OutgoingTransfer memory) {
        return outgoingTransfers[transferId];
    }
    
    /**
     * @notice Check if a token is currently escrowed
     * @param tokenId The token to check
     * @return Whether the token is escrowed
     */
    function isEscrowed(uint256 tokenId) external view returns (bool) {
        return escrowed[tokenId];
    }

    /**
     * @notice Handle incoming cross-chain message from ZetaChain
     */
    function onCall(
        MessageContext calldata context,
        bytes calldata message
    ) external returns (bytes4) {
        if (msg.sender != gateway) revert OnlyGateway();
        
        // Verify sender is the universal contract
        if (context.sender != universal) revert Unauthorized();

        // Decode message (from ZetaChain routing, now includes transferId)
        (bytes32 transferId, address receiver, uint256 tokenId, string memory uri, ) = abi.decode(
            message,
            (bytes32, address, uint256, string, address)
        );

        // Mint NFT to receiver
        _safeMint(receiver, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Mark original transfer as completed if it exists
        if (outgoingTransfers[transferId].tokenId == tokenId) {
            outgoingTransfers[transferId].completed = true;
            // Burn the escrowed token on origin
            if (escrowed[tokenId] && ownerOf(tokenId) == address(this)) {
                escrowed[tokenId] = false;
                _burn(tokenId);
            }
            emit TokenTransferCompleted(transferId);
        }
        
        emit TokenTransferReceived(receiver, tokenId, uri);
        
        return this.onCall.selector;
    }

    /**
     * @notice Handle revert - restore escrowed token to original owner
     */
    function onRevert(RevertContext calldata context) external {
        if (msg.sender != gateway) revert OnlyGateway();
        
        (bytes32 transferId, address receiver, uint256 tokenId, string memory uri, address originalOwner) = abi.decode(
            context.revertMessage,
            (bytes32, address, uint256, string, address)
        );
        
        // Mark transfer as reverted
        if (outgoingTransfers[transferId].tokenId == tokenId) {
            outgoingTransfers[transferId].reverted = true;
        }
        
        // Return escrowed token to original owner
        if (escrowed[tokenId] && ownerOf(tokenId) == address(this)) {
            escrowed[tokenId] = false;
            _transfer(address(this), originalOwner, tokenId);
            emit TokenTransferReverted(transferId, originalOwner, tokenId);
        } else {
            // If token was already burned or not escrowed, re-mint it
            _safeMint(originalOwner, tokenId);
            _setTokenURI(tokenId, uri);
            emit TokenTransferReverted(transferId, originalOwner, tokenId);
        }
    }
    
    /**
     * @notice Emergency function to rescue stuck escrowed tokens (owner only)
     * @param tokenId The token to rescue
     * @param to Address to send the token to
     */
    function rescueEscrowedToken(uint256 tokenId, address to) external onlyOwner {
        if (!escrowed[tokenId]) revert TokenNotEscrowed();
        if (ownerOf(tokenId) != address(this)) revert TokenNotEscrowed();
        
        escrowed[tokenId] = false;
        _transfer(address(this), to, tokenId);
    }

    // Required overrides
    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
