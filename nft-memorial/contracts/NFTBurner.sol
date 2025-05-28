// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC721Burnable {
    function burn(uint256 tokenId) external;
}
//销毁旧NFT合约
contract NFTBurner is Ownable {
    address public memorialNFT;
    
    event NFTBurned(address indexed nftContract, uint256 indexed tokenId, address indexed owner);
    
    constructor() {}
    //设置墓碑合约地址，在部署的时候deploy.js脚本会设置
    function setMemorialNFT(address _memorialNFT) external onlyOwner {
        memorialNFT = _memorialNFT;
    }
    
    //如有burn function的NFT合约，直接调用其burn方法
    function burnNFTWithBurnFunction(address nftContract, uint256 tokenId) external {
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        IERC721Burnable(nftContract).burn(tokenId);
        emit NFTBurned(nftContract, tokenId, msg.sender);
    }
    
    //如果没有burn function的NFT合约，使用transferFrom方法将NFT转移到0xdead地址
    function burnNFTWithTransfer(address nftContract, uint256 tokenId) external {
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        IERC721(nftContract).transferFrom(msg.sender, address(0xdead), tokenId);
        emit NFTBurned(nftContract, tokenId, msg.sender);
    }
    
    //批量销毁多个NFT
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
                //transfer method
                require(IERC721(nftContracts[i]).ownerOf(tokenIds[i]) == msg.sender, "Not the owner of this NFT");
                IERC721(nftContracts[i]).transferFrom(msg.sender, address(0xdead), tokenIds[i]);
            } else {
                //burn method
                require(IERC721(nftContracts[i]).ownerOf(tokenIds[i]) == msg.sender, "Not the owner of this NFT");
                IERC721Burnable(nftContracts[i]).burn(tokenIds[i]);
            }
            emit NFTBurned(nftContracts[i], tokenIds[i], msg.sender);
        }
    }
}