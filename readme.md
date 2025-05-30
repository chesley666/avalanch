# NFT纪念墓碑 - 数字资产纪念馆  
- 随着 Web3 的快速发展，任何人都可以轻松的铸造NFT。
- 导致：
  - 有些不负责任的项目无法持续运营，NFT和token大幅贬值
  - 用户钱包里堆满不再有价值、归“灵”的NFT
  - 用户缺乏一种有仪式感的方式来“告别”这些遗产
- 为了"安葬"这些“归灵NFT”，这个项目提供一种象征性的仪式。用户可以通过这个平台选择性地"火化"自己的NFT，悼念曾经踩过的坑，并创建一个纪念墓碑来永久保存这段记忆。

## 功能特点

- **火化归“灵”NFT**：选择并安全烧毁不再需要的NFT 
- **墓志铭创作**：为每一次“火化”撰写个性化悼念文
- **铸造纪念墓碑**：打造独特的纪念墓碑NFT，永久记录被火化资产的历史与情感
- **操作简单**：便捷选择钱包里的NFT，支持MetaMask等钱包的无缝连接

## 演示视频  

<video width="100%" controls>
  <source src="https://youtu.be/End9hZLugjs" type="video/mp4">
  您的浏览器不支持视频标签。您可以<a href="https://youtu.be/End9hZLugjs">在YouTube上观看我们的演示视频</a>。
</video>

[下载演示视频](./demoshow/demoshow.mp4)来了解 **NFT纪念墓碑** 的完整使用流程。

## 项目流程和结构  
 - 链接钱包和L1网络
 - 读取NFT列表：1.在配置中指定的NFT合约，2.扫描部分区块的交互历史，(3.通过第三方api查询)
 - 火化NFT：用户授权后，transfer到0xdead，（因为不一定所有合约都暴露burn方法）
 - 铸造墓碑：前端监听transfer或burn事件获取到被火化的NFT信息，mint新墓碑，墓碑信息上传到Web3.Storage（IPFS）

```
nft-memorial/
├── contracts/         # 智能合约源代码
│   ├── MemorialNFT.sol    # 铸造墓碑合约
│   └── NFTBurner.sol      # 火化归"灵"NFT
├── frontend/          # 前端（ React + Ether.js ）
│   ├── public/        # 静态资源
│   └── src/           # 
│       ├── components/    # UI组件：操作流程提示、NFT选择列表、定制个性化墓志铭、墓碑NFT展示
│       ├── contracts/     # 合约部署后的ABI
│       └── utils/         # 工具函数，元数据、IPFS交互
├── scripts/           # 部署脚本
└── test/              # 测试用例
```
## 未来计划

- **支持多链**：自动扫描、归集多条链上不活跃的归灵NFT 
- **AI链上分析**：通过AI分析NFT在链上一生的行为记录，为每个NFT生成专属墓志铭
- **社交**：加入墓碑升级功能，支持社交分享勋章

## 本地部署指南

### 前置要求

- Node.js (v14+)
- MetaMask 浏览器扩展
- Avalanche L1 网络连接  
  感谢 [@martin yeung](https://medium.com/@martinyeunghk) 的教程：[本地部署avalanche L1网络](https://medium.com/@martinyeunghk/avalanche-l1%E5%8D%80%E5%A1%8A%E9%8F%88%E6%A5%B5%E9%80%9F%E9%96%8B%E7%99%BC%E6%95%99%E5%AD%B8-3c622f82c3a6)

### 快速启动

这个项目使用环境变量 (.env) 文件来存储敏感信息和配置参数。我们提供了一个设置向导来简化配置过程 (可以用cnpm替换下边命令行中的npm)：

```bash
# 克隆项目
git clone https://github.com/your-username/nft-memorial.git
cd nft-memorial

# 安装依赖
npm install
cd frontend && npm install && cd ..

# 运行设置向导（会自动配置环境变量）
npm run setup
```

设置向导将引导您:
1. 输入部署私钥
2. 配置网络参数
3. 设置合约地址(如果已部署)
4. 配置其他可选参数

设置完成后，您可以编译智能合约并部署：

```bash
# 编译智能合约
npm run compile

# 部署智能合约到指定网络
npm run deploy
```

部署脚本将自动执行以下操作：
1. 部署 MemorialNFT 和 NFTBurner 合约
2. 更新项目和前端的环境文件中的合约地址
3. 自动复制合约 ABI 到前端项目

### 手动配置

如果您更喜欢手动配置，可以按照以下步骤操作：

1. 在主项目目录和前端目录中复制环境变量模板文件：

```bash
cp .env.example .env
cd frontend && cp .env.example .env && cd ..
```

2. 根据您的需求编辑两个 `.env` 文件，填写必要的配置信息。

#### 主项目 `.env` 配置：

```bash
# 部署私钥 - 请保证安全！
DEPLOYER_PRIVATE_KEY=your_private_key_here

# 网络配置
DEFAULT_CHAIN_ID=20250527

# 合约地址（部署后更新）
MEMORIAL_NFT_ADDRESS=0x4Ac1d98D9cEF99EC6546dEd4Bd550b0b287aaD6D
NFT_BURNER_ADDRESS=0xA4cD3b0Eb6E5Ab5d8CE4065BcCD70040ADAB1F00

# Gas价格设置
GAS_PRICE_GWEI=25
```

#### 前端项目 `.env` 配置：

```bash
# 网络配置
REACT_APP_DEFAULT_CHAIN_ID=20250527

# 合约地址
REACT_APP_MEMORIAL_NFT_ADDRESS=0x4Ac1d98D9cEF99EC6546dEd4Bd550b0b287aaD6D
REACT_APP_NFT_BURNER_ADDRESS=0xA4cD3b0Eb6E5Ab5d8CE4065BcCD70040ADAB1F00

# IPFS配置（如需使用IPFS上传功能）
REACT_APP_WEB3_STORAGE_API_KEY=your_web3_storage_api_key
```

### 部署合约

1. 编译智能合约：

```bash
npm run compile
```

2. 部署智能合约到指定网络：

```bash
npm run deploy
```

部署脚本将自动更新您的环境文件中的合约地址。

### 启动前端应用

```bash
cd frontend
npm start
```

应用将在 http://localhost:3000 启动运行。

## 使用指南

1. 连接您的 MetaMask 钱包
2. 浏览您的 NFT 资产列表
3. 选择您想要纪念的 NFT
4. 撰写一段墓志铭
5. 确认操作，等待链上确认
   - 第一次确认：授权NFT操作权限
   - 第二次确认：NFT烧毁操作
   - 第三次确认：创建墓碑NFT
6. 查看您的纪念墓碑 NFT

## 注意事项

- NFT 烧毁操作是**不可逆的**，请谨慎确认
- 墓碑 NFT 会永久保存在区块链上
- 所有交易都需要支付网络手续费

## 技术栈

- Solidity (智能合约)
- React (前端框架)
- Ethers.js (区块链交互)
- Hardhat (开发环境)
- Tailwind CSS (样式)
- Web3.Storage (IPFS存储，可选)

## 配置参数说明

### 智能合约参数

- `DEPLOYER_PRIVATE_KEY`: 合约部署者的私钥
- `DEFAULT_CHAIN_ID`: 目标区块链网络ID
- `MEMORIAL_NFT_ADDRESS`: 已部署的墓碑NFT合约地址 
- `NFT_BURNER_ADDRESS`: 已部署的NFT烧毁合约地址
- `REACT_APP_KNOWN_NFT_CONTRACTS`: 指定要销毁的NFT所在合约地址（前端env配置）
- `GAS_PRICE_GWEI`: 部署时使用的Gas价格(Gwei)

### 前端参数

- `REACT_APP_DEFAULT_CHAIN_ID`: 默认连接的网络ID
- `REACT_APP_MEMORIAL_NFT_ADDRESS`: 墓碑NFT合约地址
- `REACT_APP_NFT_BURNER_ADDRESS`: NFT烧毁合约地址
- `REACT_APP_KNOWN_NFT_CONTRACTS`: 已知的NFT合约地址列表(逗号分隔)
- `REACT_APP_WEB3_STORAGE_API_KEY`: Web3.Storage API密钥
- `REACT_APP_BLOCK_SCAN_LIMIT`: 区块扫描限制

## 授权许可

本项目采用 MIT 许可证。