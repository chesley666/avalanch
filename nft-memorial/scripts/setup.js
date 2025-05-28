/**
 * NFT Memorial 项目设置向导
 * 
 * 该脚本将帮助用户：
 * 1. 创建必要的 .env 文件
 * 2. 收集所需的配置信息
 * 3. 自动设置项目环境
 * 4. 复制 ABI 文件到前端项目
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 创建命令行交互接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 项目根目录
const rootDir = path.join(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const artifactsDir = path.join(rootDir, 'artifacts/contracts');
const frontendContractsDir = path.join(frontendDir, 'src/contracts');

// .env文件路径
const rootEnvPath = path.join(rootDir, '.env');
const frontendEnvPath = path.join(frontendDir, '.env');

// .env.example文件路径
const rootEnvExamplePath = path.join(rootDir, '.env.example');
const frontendEnvExamplePath = path.join(frontendDir, '.env.example');

// 设置默认值
const defaults = {
  DEPLOYER_PRIVATE_KEY: '',
  DEFAULT_CHAIN_ID: '20250527',
  MEMORIAL_NFT_ADDRESS: '0x4Ac1d98D9cEF99EC6546dEd4Bd550b0b287aaD6D',
  NFT_BURNER_ADDRESS: '0xA4cD3b0Eb6E5Ab5d8CE4065BcCD70040ADAB1F00',
  WEB3_STORAGE_API_KEY: '',
  MYAVA_L1_RPC_URL: 'http://127.0.0.1:60849/ext/bc/2p5BM86NU2JnCkn8W1KhsB6XG71ubaYDcbgWB5enJTqQ8Yy7Tc/rpc',
  GAS_PRICE_GWEI: '25'
};

// 主函数
async function setup() {
  console.log('========================================');
  console.log('NFT Memorial 项目设置向导');
  console.log('========================================');
  console.log('该向导将帮助您设置项目环境变量。');
  console.log('按Ctrl+C可随时退出。');
  console.log('');

  // 检查是否存在.env.example文件
  if (!fs.existsSync(rootEnvExamplePath) || !fs.existsSync(frontendEnvExamplePath)) {
    console.error('错误：找不到.env.example模板文件！');
    process.exit(1);
  }

  // 获取用户输入
  const config = await collectUserInput();

  // 创建.env文件
  await createEnvFiles(config);
  
  // 复制 ABI 文件到前端项目
  await copyABIToFrontend();

  console.log('');
  console.log('========================================');
  console.log('环境设置已完成！');
  console.log('现在您可以运行以下命令编译和部署合约：');
  console.log('npm run compile');
  console.log('npm run deploy');
  console.log('');
  console.log('然后启动前端应用：');
  console.log('cd frontend && npm start');
  console.log('========================================');

  rl.close();
}

// 收集用户输入
async function collectUserInput() {
  const config = { ...defaults };

  console.log('请提供以下信息（直接按Enter使用默认值）：');
  console.log('');

  // 部署私钥是必须的
  config.DEPLOYER_PRIVATE_KEY = await question('部署者私钥 (必填): ', '', true);

  // 网络配置
  config.DEFAULT_CHAIN_ID = await question('默认链ID [20250527]: ', defaults.DEFAULT_CHAIN_ID);
  config.MYAVA_L1_RPC_URL = await question('myava L1 RPC URL: ', defaults.MYAVA_L1_RPC_URL);
  config.GAS_PRICE_GWEI = await question('Gas价格 (Gwei) [25]: ', defaults.GAS_PRICE_GWEI);

  // 如果用户已经有合约地址，可以直接提供
  console.log('\n如果您已经部署了合约，请提供地址，否则可以留空，稍后通过部署脚本更新：');
  config.MEMORIAL_NFT_ADDRESS = await question('Memorial NFT 合约地址: ', defaults.MEMORIAL_NFT_ADDRESS);
  config.NFT_BURNER_ADDRESS = await question('NFT Burner 合约地址: ', defaults.NFT_BURNER_ADDRESS);

  // Web3.Storage API密钥（可选）
  console.log('\n可选设置：');
  config.WEB3_STORAGE_API_KEY = await question('Web3.Storage API 密钥（用于IPFS上传，可选）: ', '');

  return config;
}

// 提问函数
function question(query, defaultValue, isRequired = false) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      if (answer.trim() === '') {
        if (isRequired) {
          console.log('这是必填项，请提供有效值！');
          resolve(question(query, defaultValue, isRequired));
        } else {
          resolve(defaultValue);
        }
      } else {
        resolve(answer);
      }
    });
  });
}

// 创建.env文件
async function createEnvFiles(config) {
  try {
    // 读取示例文件
    const rootEnvExample = fs.readFileSync(rootEnvExamplePath, 'utf8');
    const frontendEnvExample = fs.readFileSync(frontendEnvExamplePath, 'utf8');

    // 替换根项目.env内容
    let rootEnvContent = rootEnvExample;
    rootEnvContent = rootEnvContent.replace(/DEPLOYER_PRIVATE_KEY=.*/, `DEPLOYER_PRIVATE_KEY=${config.DEPLOYER_PRIVATE_KEY}`);
    rootEnvContent = rootEnvContent.replace(/DEFAULT_CHAIN_ID=.*/, `DEFAULT_CHAIN_ID=${config.DEFAULT_CHAIN_ID}`);
    rootEnvContent = rootEnvContent.replace(/MEMORIAL_NFT_ADDRESS=.*/, `MEMORIAL_NFT_ADDRESS=${config.MEMORIAL_NFT_ADDRESS}`);
    rootEnvContent = rootEnvContent.replace(/NFT_BURNER_ADDRESS=.*/, `NFT_BURNER_ADDRESS=${config.NFT_BURNER_ADDRESS}`);
    rootEnvContent = rootEnvContent.replace(/MYAVA_L1_RPC_URL=.*/, `MYAVA_L1_RPC_URL=${config.MYAVA_L1_RPC_URL}`);
    rootEnvContent += `\nGAS_PRICE_GWEI=${config.GAS_PRICE_GWEI}\n`;

    // 替换前端项目.env内容
    let frontendEnvContent = frontendEnvExample;
    frontendEnvContent = frontendEnvContent.replace(/REACT_APP_DEFAULT_CHAIN_ID=.*/, `REACT_APP_DEFAULT_CHAIN_ID=${config.DEFAULT_CHAIN_ID}`);
    frontendEnvContent = frontendEnvContent.replace(/REACT_APP_MEMORIAL_NFT_ADDRESS=.*/, `REACT_APP_MEMORIAL_NFT_ADDRESS=${config.MEMORIAL_NFT_ADDRESS}`);
    frontendEnvContent = frontendEnvContent.replace(/REACT_APP_NFT_BURNER_ADDRESS=.*/, `REACT_APP_NFT_BURNER_ADDRESS=${config.NFT_BURNER_ADDRESS}`);
    frontendEnvContent = frontendEnvContent.replace(/REACT_APP_MYAVA_L1_RPC_URL=.*/, `REACT_APP_MYAVA_L1_RPC_URL=${config.MYAVA_L1_RPC_URL}`);
    
    // 添加Web3.Storage API密钥
    frontendEnvContent = frontendEnvContent.replace(/REACT_APP_WEB3_STORAGE_API_KEY=.*/, `REACT_APP_WEB3_STORAGE_API_KEY=${config.WEB3_STORAGE_API_KEY}`);

    // 写入文件
    fs.writeFileSync(rootEnvPath, rootEnvContent);
    console.log(`已创建 ${rootEnvPath} 文件`);

    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log(`已创建 ${frontendEnvPath} 文件`);
  } catch (error) {
    console.error('创建环境文件时出错:', error);
    process.exit(1);
  }
}

// 复制 ABI 文件到前端项目
async function copyABIToFrontend() {
  try {
    const contracts = fs.readdirSync(artifactsDir);
    contracts.forEach(contract => {
      const contractPath = path.join(artifactsDir, contract, `${contract}.json`);
      const destPath = path.join(frontendContractsDir, `${contract}.json`);
      fs.copyFileSync(contractPath, destPath);
      console.log(`已复制 ${contract}.json 到前端项目`);
    });
  } catch (error) {
    console.error('复制 ABI 文件时出错:', error);
    process.exit(1);
  }
}

// 执行设置
setup();