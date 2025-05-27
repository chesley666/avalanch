// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MemorialNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Memorial {
        address creator;
        uint256 creationDate;
        string epitaph;
        address[] burnedNFTContracts;
        uint256[] burnedNFTIds;
        string[] burnedNFTNames;
    }

    mapping(uint256 => Memorial) public memorials;

    event MemorialCreated(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 creationDate,
        string epitaph
    );

    constructor() ERC721("Memorial NFT", "MNFT") {}

    function createMemorial(
        address recipient,
        string memory tokenURI,
        string memory epitaph,
        address[] memory burnedNFTContracts,
        uint256[] memory burnedNFTIds,
        string[] memory burnedNFTNames
    ) public returns (uint256) {
        require(burnedNFTContracts.length == burnedNFTIds.length, "Arrays length mismatch");
        require(burnedNFTContracts.length == burnedNFTNames.length, "Arrays length mismatch");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        memorials[newTokenId] = Memorial({
            creator: msg.sender,
            creationDate: block.timestamp,
            epitaph: epitaph,
            burnedNFTContracts: burnedNFTContracts,
            burnedNFTIds: burnedNFTIds,
            burnedNFTNames: burnedNFTNames
        });
        
        emit MemorialCreated(
            newTokenId,
            msg.sender,
            block.timestamp,
            epitaph
        );
        
        return newTokenId;
    }

    function getMemorialDetails(uint256 tokenId) public view returns (
        address creator,
        uint256 creationDate,
        string memory epitaph,
        address[] memory burnedNFTContracts,
        uint256[] memory burnedNFTIds,
        string[] memory burnedNFTNames
    ) {
        require(_exists(tokenId), "Memorial: token does not exist");
        Memorial storage memorial = memorials[tokenId];
        
        return (
            memorial.creator,
            memorial.creationDate,
            memorial.epitaph,
            memorial.burnedNFTContracts,
            memorial.burnedNFTIds,
            memorial.burnedNFTNames
        );
    }
}