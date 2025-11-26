// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ZetaChain Gateway Interface
interface IGateway {
    function call(
        bytes memory receiver,
        address zrc20,
        bytes calldata message,
        CallOptions memory callOptions,
        RevertOptions memory revertOptions
    ) external;

    function deposit(
        address receiver,
        uint256 amount,
        address asset,
        RevertOptions memory revertOptions
    ) external;

    function depositAndCall(
        bytes memory receiver,
        uint256 amount,
        address asset,
        bytes calldata message,
        CallOptions memory callOptions,
        RevertOptions memory revertOptions
    ) external;
}

// ZetaChain Standard Structs
struct RevertOptions {
    address revertAddress;
    bool callOnRevert;
    address abortAddress;
    bytes revertMessage;
    uint256 onRevertGasLimit;
}

struct CallOptions {
    uint256 gasLimit;
    bool isArbitraryCall;
}

struct MessageContext {
    bytes origin;
    address sender;
    uint256 chainID;
}

struct RevertContext {
    address sender;
    address asset;
    uint256 amount;
    bytes revertMessage;
}

contract UniversalAINFT is ERC721URIStorage, Ownable {
    IGateway public gateway;
    address public gasZRC20; // ZRC20 token for gas payments
    uint256 private _tokenIdCounter;
    
    // Mapping to track NFT ownership across chains
    mapping(uint256 => address) public nftOwners;
    mapping(uint256 => string) public nftMetadata;
    
    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event NFTSentCrossChain(uint256 indexed tokenId, address indexed from, bytes indexed to, uint256 chainId);
    event NFTReceivedCrossChain(uint256 indexed tokenId, address indexed to, uint256 fromChainId);
    event CallReverted(string revertMessage, uint256 tokenId);
    event CallAborted();
    event GasZRC20Updated(address indexed newGasZRC20);

    constructor(
        address payable gatewayAddress,
        address gasZRC20Address
    ) ERC721("Universal AI NFT", "UAINFT") Ownable(msg.sender) {
        gateway = IGateway(gatewayAddress);
        gasZRC20 = gasZRC20Address;
    }

    /**
     * @dev Mint a new AI NFT with metadata
     * @param to Address to mint the NFT to
     * @param tokenURI Metadata URI for the NFT
     */
    function mintAINFT(address to, string memory tokenURI) public returns (uint256) {
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        nftOwners[newTokenId] = to;
        nftMetadata[newTokenId] = tokenURI;
        
        emit NFTMinted(newTokenId, to, tokenURI);
        
        return newTokenId;
    }

    /**
     * @dev Send NFT cross-chain using ZetaChain Gateway
     * @param tokenId Token ID to send
     * @param receiver Receiver address on destination chain (as bytes)
     * @param destinationChainId Destination chain ID (for event logging)
     */
    function sendNFTCrossChain(
        uint256 tokenId,
        bytes memory receiver,
        uint256 destinationChainId
    ) external payable {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        
        // Store original owner and metadata before burning
        address originalOwner = msg.sender;
        string memory metadata = nftMetadata[tokenId];
        
        // Burn NFT on source chain
        _burn(tokenId);
        
        // Prepare message for cross-chain call
        // Encode: tokenId, metadata
        bytes memory message = abi.encode(tokenId, metadata);
        
        // Set up revert options - store tokenId and original owner for revert handling
        RevertOptions memory revertOptions = RevertOptions({
            revertAddress: address(this),
            callOnRevert: true,
            abortAddress: address(0),
            revertMessage: abi.encode(tokenId, originalOwner, metadata),
            onRevertGasLimit: 1000000
        });
        
        // Set up call options
        CallOptions memory callOptions = CallOptions({
            gasLimit: 1000000,
            isArbitraryCall: false
        });
        
        // Make cross-chain call with proper gas token
        // Use gasZRC20 if set, otherwise address(0) for native gas
        gateway.call(
            receiver,
            gasZRC20,
            message,
            callOptions,
            revertOptions
        );
        
        emit NFTSentCrossChain(tokenId, originalOwner, receiver, destinationChainId);
    }

    /**
     * @dev Universal App onCall function - handles incoming cross-chain messages
     * @param context Message context containing origin chain info and sender
     * @param message Encoded message data
     */
    function onCall(
        MessageContext calldata context,
        address, /* zrc20 */
        uint256, /* amount */
        bytes calldata message
    ) external returns (bytes4) {
        require(msg.sender == address(gateway), "Caller is not the gateway");
        
        // Decode the message: tokenId and metadata
        (uint256 tokenId, string memory tokenURI) = abi.decode(
            message,
            (uint256, string)
        );
        
        // The receiver is the contract that initiated the call (context.sender)
        // For cross-chain NFT transfers, we mint to the address encoded in context.origin
        address receiver = bytesToAddress(context.origin);
        
        // Mint NFT on destination chain
        _safeMint(receiver, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        nftOwners[tokenId] = receiver;
        nftMetadata[tokenId] = tokenURI;
        
        emit NFTReceivedCrossChain(tokenId, receiver, context.chainID);
        
        // Return the function selector to indicate success
        return this.onCall.selector;
    }

    /**
     * @dev Universal App onRevert function - handles failed cross-chain calls
     * @param revertContext Revert context containing revert message and details
     */
    function onRevert(RevertContext calldata revertContext) external {
        require(msg.sender == address(gateway), "Caller is not the gateway");
        
        // Decode revert message: tokenId, originalOwner, metadata
        (uint256 tokenId, address originalOwner, string memory metadata) = abi.decode(
            revertContext.revertMessage,
            (uint256, address, string)
        );
        
        // Re-mint NFT to original owner on source chain
        _safeMint(originalOwner, tokenId);
        _setTokenURI(tokenId, metadata);
        
        nftOwners[tokenId] = originalOwner;
        nftMetadata[tokenId] = metadata;
        
        emit CallReverted("NFT transfer reverted, re-minted to original owner", tokenId);
    }

    /**
     * @dev Universal App onAbort function - handles aborted transactions
     */
    function onAbort() external {
        require(msg.sender == address(gateway), "Caller is not the gateway");
        emit CallAborted();
    }

    /**
     * @dev Helper function to convert bytes to address
     */
    function bytesToAddress(bytes memory bys) private pure returns (address addr) {
        assembly {
            addr := mload(add(bys, 20))
        }
    }

    /**
     * @dev Get total minted NFTs
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Update gateway address (only owner)
     */
    function updateGateway(address payable newGateway) external onlyOwner {
        gateway = IGateway(newGateway);
    }

    /**
     * @dev Update gas ZRC20 token address (only owner)
     */
    function updateGasZRC20(address newGasZRC20) external onlyOwner {
        gasZRC20 = newGasZRC20;
        emit GasZRC20Updated(newGasZRC20);
    }
}
