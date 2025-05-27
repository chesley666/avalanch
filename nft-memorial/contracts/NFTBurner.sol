// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC721Burnable {
    function burn(uint256 tokenId) external;
}

contract NFTBurner is Ownable {
    address public memorialNFT;
    
    event NFTBurned(address indexed nftContract, uint256 indexed tokenId, address indexed owner);
    
    constructor() {}
    
    function setMemorialNFT(address _memorialNFT) external onlyOwner {
        memorialNFT = _memorialNFT;
    }
    
    // For NFTs that implement a burn function
    function burnNFTWithBurnFunction(address nftContract, uint256 tokenId) external {
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        
        // Try to burn the NFT if it supports the burn function
        IERC721Burnable(nftContract).burn(tokenId);
        
        emit NFTBurned(nftContract, tokenId, msg.sender);
    }
    
    // For NFTs that don't implement a burn function, we can transfer them to address(0xdead)
    function burnNFTWithTransfer(address nftContract, uint256 tokenId) external {
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        
        // First approve this contract to transfer the NFT
        IERC721(nftContract).transferFrom(msg.sender, address(0xdead), tokenId);
        
        emit NFTBurned(nftContract, tokenId, msg.sender);
    }
    
    // Function to burn multiple NFTs at once
    function burnMultipleNFTs(
        address[] calldata nftContracts,
        uint256[] calldata tokenIds,
        bool[] calldata useTransfer
    ) external {
        require(
            nftContracts.length == tokenIds.length && 
            tokenIds.length == useTransfer.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < nftContracts.length; i++) {
            if (useTransfer[i]) {
                // Use transfer method
                require(IERC721(nftContracts[i]).ownerOf(tokenIds[i]) == msg.sender, "Not the owner of this NFT");
                IERC721(nftContracts[i]).transferFrom(msg.sender, address(0xdead), tokenIds[i]);
            } else {
                // Use burn method
                require(IERC721(nftContracts[i]).ownerOf(tokenIds[i]) == msg.sender, "Not the owner of this NFT");
                IERC721Burnable(nftContracts[i]).burn(tokenIds[i]);
            }
            
            emit NFTBurned(nftContracts[i], tokenIds[i], msg.sender);
        }
    }
}