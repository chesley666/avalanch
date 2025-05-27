const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Memorial", function () {
  let MemorialNFT, memorialNFT;
  let NFTBurner, nftBurner;
  let owner, addr1, addr2;

  beforeEach(async function () {
    // Get contract factories
    MemorialNFT = await ethers.getContractFactory("MemorialNFT");
    NFTBurner = await ethers.getContractFactory("NFTBurner");

    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contracts
    memorialNFT = await MemorialNFT.deploy();
    await memorialNFT.deployed();

    nftBurner = await NFTBurner.deploy();
    await nftBurner.deployed();

    // Set Memorial NFT address in NFTBurner
    await nftBurner.setMemorialNFT(memorialNFT.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner for NFTBurner", async function () {
      expect(await nftBurner.owner()).to.equal(owner.address);
    });

    it("Should set the right Memorial NFT address", async function () {
      expect(await nftBurner.memorialNFT()).to.equal(memorialNFT.address);
    });
  });

  describe("Creating Memorial NFT", function () {
    it("Should create a new memorial NFT with the right metadata", async function () {
      const recipient = addr1.address;
      const tokenURI = "ipfs://memorial/1";
      const epitaph = "In loving memory of my digital assets";
      const burnedNFTContracts = ["0x1234567890123456789012345678901234567890"];
      const burnedNFTIds = [1];
      const burnedNFTNames = ["My First NFT"];

      // Create memorial
      await memorialNFT.createMemorial(
        recipient,
        tokenURI,
        epitaph,
        burnedNFTContracts,
        burnedNFTIds,
        burnedNFTNames
      );

      // Check token owner
      expect(await memorialNFT.ownerOf(1)).to.equal(recipient);

      // Check token URI
      expect(await memorialNFT.tokenURI(1)).to.equal(tokenURI);

      // Check memorial details
      const memorial = await memorialNFT.getMemorialDetails(1);
      expect(memorial.epitaph).to.equal(epitaph);
      expect(memorial.burnedNFTContracts[0]).to.equal(burnedNFTContracts[0]);
      expect(memorial.burnedNFTIds[0]).to.equal(burnedNFTIds[0]);
      expect(memorial.burnedNFTNames[0]).to.equal(burnedNFTNames[0]);
    });
  });
});