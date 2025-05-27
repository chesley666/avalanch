require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.17",
  networks: {
    // localhost: {
    //   url: "http://127.0.0.1:9650/ext/bc/C/rpc",
    //   chainId: 43112,
    //   accounts: {
    //     mnemonic: "test test test test test test test test test test test junk"
    //   }
    // },
    myavaL1: {
      url: process.env.MYAVA_L1_RPC_URL,
      chainId: parseInt(process.env.DEFAULT_CHAIN_ID),
      accounts: [
        // 使用部署账户的私钥
        process.env.DEPLOYER_PRIVATE_KEY
      ]
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};