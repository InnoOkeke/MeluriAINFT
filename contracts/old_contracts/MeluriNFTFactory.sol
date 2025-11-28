// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./MeluriNFT.sol";

/**
 * @title MeluriNFTFactory
 * @dev Factory contract to deploy MeluriNFT with deterministic addresses using CREATE2
 */
contract MeluriNFTFactory {
    event NFTDeployed(address indexed proxy, address indexed implementation, bytes32 salt);
    
    // Mapping to track deployed proxies
    mapping(bytes32 => address) public deployedProxies;
    
    /**
     * @dev Deploy a new MeluriNFT proxy with CREATE2 for deterministic address
     * @param salt Unique salt for CREATE2 deployment
     * @param implementation Address of the MeluriNFT implementation
     * @param initialOwner Owner of the NFT contract
     * @param name NFT collection name
     * @param symbol NFT collection symbol
     * @param gasLimit Gas limit for cross-chain transfers
     * @param gatewayAddress Gateway address for the chain
     * @return proxy Address of the deployed proxy
     */
    function deployNFT(
        bytes32 salt,
        address implementation,
        address initialOwner,
        string memory name,
        string memory symbol,
        uint256 gasLimit,
        address payable gatewayAddress
    ) external returns (address proxy) {
        // Check if already deployed with this salt
        require(deployedProxies[salt] == address(0), "Already deployed with this salt");
        
        // Encode the initialize call
        bytes memory initData = abi.encodeWithSelector(
            MeluriNFT.initialize.selector,
            initialOwner,
            name,
            symbol,
            gasLimit,
            gatewayAddress
        );
        
        // Deploy proxy with CREATE2
        bytes memory bytecode = abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            abi.encode(implementation, initData)
        );
        
        assembly {
            proxy := create2(0, add(bytecode, 32), mload(bytecode), salt)
            if iszero(extcodesize(proxy)) {
                revert(0, 0)
            }
        }
        
        deployedProxies[salt] = proxy;
        
        emit NFTDeployed(proxy, implementation, salt);
        
        return proxy;
    }
    
    /**
     * @dev Predict the address of a proxy before deployment
     * @param salt Unique salt for CREATE2 deployment
     * @param implementation Address of the MeluriNFT implementation
     * @param initialOwner Owner of the NFT contract
     * @param name NFT collection name
     * @param symbol NFT collection symbol
     * @param gasLimit Gas limit for cross-chain transfers
     * @param gatewayAddress Gateway address for the chain
     * @return predicted The predicted proxy address
     */
    function predictAddress(
        bytes32 salt,
        address implementation,
        address initialOwner,
        string memory name,
        string memory symbol,
        uint256 gasLimit,
        address payable gatewayAddress
    ) external view returns (address predicted) {
        bytes memory initData = abi.encodeWithSelector(
            MeluriNFT.initialize.selector,
            initialOwner,
            name,
            symbol,
            gasLimit,
            gatewayAddress
        );
        
        bytes memory bytecode = abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            abi.encode(implementation, initData)
        );
        
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            )
        );
        
        return address(uint160(uint256(hash)));
    }
}
