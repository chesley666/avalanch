// 从环境变量中读取配置或使用硬编码的默认值

// 这里使用用于测试的合约地址
// 在生产环境中应替换为实际部署的合约地址
const DEFAULT_MEMORIAL_NFT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';  // 示例合约地址
const DEFAULT_NFT_BURNER_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';   // 示例合约地址

// 从环境变量中读取配置
const config = {
  // 合约地址，从环境变量中获取或使用默认值
  contracts: {
    MemorialNFT: process.env.REACT_APP_MEMORIAL_NFT_ADDRESS || DEFAULT_MEMORIAL_NFT_ADDRESS,
    NFTBurner: process.env.REACT_APP_NFT_BURNER_ADDRESS || DEFAULT_NFT_BURNER_ADDRESS
  },
  networks: {
    // Avalanche本地网络 (C-Chain)
    43112: {
      name: "Avalanche Local",
      rpcUrl: process.env.REACT_APP_AVALANCHE_LOCAL_RPC_URL,
      currency: process.env.REACT_APP_AVALANCHE_LOCAL_CURRENCY,
      explorerUrl: process.env.REACT_APP_AVALANCHE_LOCAL_EXPLORER_URL
    },
    // Avalanche主网 (C-Chain)
    43114: {
      name: "Avalanche Mainnet",
      rpcUrl: process.env.REACT_APP_AVALANCHE_MAINNET_RPC_URL,
      currency: process.env.REACT_APP_AVALANCHE_MAINNET_CURRENCY ,
      explorerUrl: process.env.REACT_APP_AVALANCHE_MAINNET_EXPLORER_URL
    },
    // 自定义myava L1网络
    20250527: {
      name: "myava L1",
      rpcUrl: process.env.REACT_APP_MYAVA_L1_RPC_URL,
      currency: process.env.REACT_APP_MYAVA_L1_CURRENCY,
      explorerUrl: process.env.REACT_APP_MYAVA_L1_EXPLORER_URL
    }
  },
  // 默认使用的网络ID
  defaultChainId: parseInt(process.env.REACT_APP_DEFAULT_CHAIN_ID)
};

export default config;