const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  console.log("开始部署NFT墓碑纪念dApp合约到Avalanche L1网络...");
  console.log("网络信息:", network.name);

  // 获取部署账户及余额信息
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("账户余额:", ethers.utils.formatEther(balance), "MYAVA");

  // 从环境变量中获取gas价格，如果未设置则使用默认值
  const gasPrice = process.env.GAS_PRICE_GWEI 
    ? ethers.utils.parseUnits(process.env.GAS_PRICE_GWEI, "gwei")
    : ethers.utils.parseUnits("25", "gwei");

  // 部署Memorial NFT合约
  console.log("\n正在部署MemorialNFT合约...");
  const MemorialNFT = await ethers.getContractFactory("MemorialNFT");
  const memorialNFT = await MemorialNFT.deploy({
    gasPrice: gasPrice,
  });
  await memorialNFT.deployed();
  console.log("MemorialNFT合约已部署至:", memorialNFT.address);

  // 部署NFTBurner合约
  console.log("\n正在部署NFTBurner合约...");
  const NFTBurner = await ethers.getContractFactory("NFTBurner");
  const nftBurner = await NFTBurner.deploy({
    gasPrice: gasPrice,
  });
  await nftBurner.deployed();
  console.log("NFTBurner合约已部署至:", nftBurner.address);

  // ** 设置Memorial NFT地址到NFTBurner合约
  console.log("\n正在设置MemorialNFT地址到NFTBurner合约...");
  const setTx = await nftBurner.setMemorialNFT(memorialNFT.address, {
    gasPrice: gasPrice,
  });
  await setTx.wait();
  console.log("MemorialNFT地址已设置至NFTBurner合约");

  // 打印完整配置信息供前端使用
  console.log("\n========== 部署完成 ==========");
  console.log(`
  {
    "contracts": {
      "MemorialNFT": "${memorialNFT.address}",
      "NFTBurner": "${nftBurner.address}"
    },
    "network": {
      "name": "${network.name}",
      "chainId": ${network.config.chainId}
    },
    "deployer": "${deployer.address}"
  }
  `);
  console.log("===============================");

  // 自动更新.env文件
  await updateEnvFiles(memorialNFT.address, nftBurner.address, network.config.chainId);

  // 复制 ABI 到前端项目
  await copyABIToFrontend();
}

// 更新主项目和前端的.env文件
async function updateEnvFiles(memorialAddress, burnerAddress, chainId) {
  try {
    console.log("\n正在更新环境配置文件...");
    
    // 更新主项目.env文件
    const mainEnvPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(mainEnvPath)) {
      let envContent = fs.readFileSync(mainEnvPath, 'utf8');
      envContent = updateEnvValue(envContent, 'MEMORIAL_NFT_ADDRESS', memorialAddress);
      envContent = updateEnvValue(envContent, 'NFT_BURNER_ADDRESS', burnerAddress);
      envContent = updateEnvValue(envContent, 'DEFAULT_CHAIN_ID', chainId.toString());
      fs.writeFileSync(mainEnvPath, envContent);
      console.log("已更新主项目.env文件");
    }
    
    // 更新前端.env文件
    const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env');
    if (fs.existsSync(frontendEnvPath)) {
      let envContent = fs.readFileSync(frontendEnvPath, 'utf8');
      envContent = updateEnvValue(envContent, 'REACT_APP_MEMORIAL_NFT_ADDRESS', memorialAddress);
      envContent = updateEnvValue(envContent, 'REACT_APP_NFT_BURNER_ADDRESS', burnerAddress);
      envContent = updateEnvValue(envContent, 'REACT_APP_DEFAULT_CHAIN_ID', chainId.toString());
      fs.writeFileSync(frontendEnvPath, envContent);
      console.log("已更新前端项目.env文件");
    }
    
    console.log("环境配置文件更新完成！");
  } catch (error) {
    console.error("更新环境配置文件时出错:", error);
  }
}

// 复制 ABI 到前端项目
async function copyABIToFrontend() {
  try {
    console.log("\n正在复制合约 ABI 到前端项目...");
    
    // 确保前端合约目录存在
    const frontendContractsDir = path.join(__dirname, '..', 'frontend', 'src', 'contracts');
    if (!fs.existsSync(frontendContractsDir)) {
      fs.mkdirSync(frontendContractsDir, { recursive: true });
    }
    
    // 复制 MemorialNFT ABI
    const memorialNFTPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'MemorialNFT.sol', 'MemorialNFT.json');
    if (fs.existsSync(memorialNFTPath)) {
      const memorialNFTArtifact = require(memorialNFTPath);
      const memorialNFTABI = {
        abi: memorialNFTArtifact.abi
      };
      fs.writeFileSync(
        path.join(frontendContractsDir, 'MemorialNFT.json'),
        JSON.stringify(memorialNFTABI, null, 2)
      );
      console.log("已复制 MemorialNFT ABI 到前端项目");
    } else {
      console.warn("警告：找不到 MemorialNFT 合约 ABI 文件");
    }
    
    // 复制 NFTBurner ABI
    const nftBurnerPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'NFTBurner.sol', 'NFTBurner.json');
    if (fs.existsSync(nftBurnerPath)) {
      const nftBurnerArtifact = require(nftBurnerPath);
      const nftBurnerABI = {
        abi: nftBurnerArtifact.abi
      };
      fs.writeFileSync(
        path.join(frontendContractsDir, 'NFTBurner.json'),
        JSON.stringify(nftBurnerABI, null, 2)
      );
      console.log("已复制 NFTBurner ABI 到前端项目");
    } else {
      console.warn("警告：找不到 NFTBurner 合约 ABI 文件");
    }
    
    console.log("ABI 文件复制完成！");
  } catch (error) {
    console.error("复制 ABI 文件时出错:", error);
  }
}

// 辅助函数：更新.env文件中的特定值
function updateEnvValue(content, key, value) {
  const regex = new RegExp(`^${key}=.*`, 'm');
  if (content.match(regex)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return `${content}\n${key}=${value}`;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });