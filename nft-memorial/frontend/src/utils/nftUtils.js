import { ethers } from 'ethers';
import { Web3Storage } from 'web3.storage';
import { create as createIPFSClient } from 'ipfs-http-client';

// NFT接口的最小ABI，用于获取元数据
const ERC721_ABI = [
  'function tokenURI(uint256 tokenId) external view returns (string memory)',
  'function name() external view returns (string memory)',
  'function symbol() external view returns (string memory)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
];

// 从环境变量中获取已知的NFT合约地址，【？如何通过钱包地址读取？】
let KNOWN_NFT_CONTRACTS = [];
if (process.env.REACT_APP_KNOWN_NFT_CONTRACTS) {
  KNOWN_NFT_CONTRACTS = process.env.REACT_APP_KNOWN_NFT_CONTRACTS.split(',');
  console.log('成功从环境变量加载NFT合约列表:', KNOWN_NFT_CONTRACTS);
} else {
  console.error('警告: 环境变量 REACT_APP_KNOWN_NFT_CONTRACTS 未设置或为空');
}

// 用于IPFS上传的API密钥，从环境变量中获取； demo演示是使用mock数据
const IPFS_API_URL = process.env.REACT_APP_IPFS_API_URL || '';  // 本地IPFS节点地址
const WEB3_STORAGE_TOKEN = process.env.REACT_APP_WEB3_STORAGE_API_KEY || '';

// 块扫描限制
const BLOCK_SCAN_LIMIT = process.env.REACT_APP_BLOCK_SCAN_LIMIT ? parseInt(process.env.REACT_APP_BLOCK_SCAN_LIMIT) : 10000;

/**
 * UTF-8 安全的base64编码函数，可以处理中文等非ASCII字符
 * @param {string} str 要编码的字符串
 * @returns {string} base64编码后的字符串
 */
function utf8ToBase64(str) {
  try {
    // 首先将字符串转换为UTF-8编码的字节数组
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    // 将字节数组转换为二进制字符串
    let binaryStr = '';
    for (let i = 0; i < bytes.length; i++) {
      binaryStr += String.fromCharCode(bytes[i]);
    }
    // 使用btoa对二进制字符串进行base64编码
    return btoa(binaryStr);
  } catch (error) {
    console.error("UTF-8 to base64 conversion error:", error);
    // 如果出错，返回一个安全的默认值
    return btoa("Error encoding SVG");
  }
}

/**
 * **step2：扫描钱包中的NFT
 * @param {string} address 用户钱包地址
 * @param {object} library ethers提供的库
 * @returns {Promise<Array>} NFT数组
 */
export const fetchUserNFTs = async (address, library) => {
  const nfts = [];
  const provider = library ? library : new ethers.providers.Web3Provider(window.ethereum);
  try {
    console.log("开始获取钱包地址的NFT:", address);
    // 方法1：配置中读取，knownContracts包括了指定的合约地址
    const knownContracts = KNOWN_NFT_CONTRACTS;
    
    // 方法2：通过provider的内置API获取NFTs：【未实现】
    let userNFTs = [];
    try {
      // 一些提供商如Alchemy:getNftsForOwner、Infura等提供了getNFTs API
      if (provider.connection && provider.connection.url) {
        console.log("尝试使用提供商API获取NFTs");
        // **实现特定于提供商的API调用
      }
    } catch (providerApiError) {
      console.log("提供商API不可用:", providerApiError.message);
    }

    // 方法3：扫描限定的区块
    const blockNumber = await provider.getBlockNumber();
    const startBlock = Math.max(0, blockNumber - BLOCK_SCAN_LIMIT); // 使用环境变量中配置的块扫描限制
    console.log(`扫描区块 ${startBlock} 到 ${blockNumber}`);
    console.log("开始直接查询NFT合约");
    // 创建通用ERC721接口
    const erc721Interface = new ethers.utils.Interface(ERC721_ABI);
    // 遍历用户交易以找到NFT转账事件
    const filter = {
      address: null, // 任何合约
      topics: [
        ethers.utils.id("Transfer(address,address,uint256)"),
        null,
        ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address'], [address]))
      ],
      fromBlock: startBlock,
      toBlock: 'latest'
    };
    const logs = await provider.getLogs(filter);
    console.log(`找到 ${logs.length} 个可能的NFT转账事件`);
    const uniqueContracts = new Set();
    logs.forEach(log => {
      uniqueContracts.add(log.address.toLowerCase());
    });

    // 结果合并：knownContracts指定合约 + 扫描合约 
    knownContracts.forEach(contract => {
      uniqueContracts.add(contract.toLowerCase());
    });
    console.log(`找到 ${uniqueContracts.size} 个唯一的合约地址`);

    // 检查每个合约，看用户是否拥有任何代币
    for (const contractAddress of uniqueContracts) {
      try {
        console.log(`检查合约: ${contractAddress}`);
        const nftContract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
        // 查询用户余额
        const balance = await nftContract.balanceOf(address);
        if (balance.gt(0)) {
          console.log(`在合约 ${contractAddress} 中找到 ${balance.toString()} 个NFT`);
          // 获取合约名称和符号
          let name = "未知NFT";
          let symbol = "NFT";
          try {
            name = await nftContract.name();
            symbol = await nftContract.symbol();
          } catch (nameError) {
            console.log("无法获取NFT名称/符号:", nameError.message);
          }
          
          // 获取用户拥有的每一个NFT
          for (let i = 0; i < balance.toNumber(); i++) {
            try {
              // 获取代币ID - 使用标准ERC721接口的tokenOfOwnerByIndex
              let tokenId;
              try {
                console.log(`尝试获取合约 ${contractAddress} 中的代币ID，索引 ${i}`);
                // 使用tokenOfOwnerByIndex获取特定索引的代币ID
                tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
                console.log(`合约 ${contractAddress} 中索引 ${i} 的代币ID: ${tokenId.toString()}`);
              } catch (indexError) {
                // 如果合约没有实现tokenOfOwnerByIndex，我们可以从转账日志中解析
                const relevantLogs = logs.filter(log => 
                  log.address.toLowerCase() === contractAddress &&
                  log.topics[2] === ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address'], [address]))
                );
                if (relevantLogs[i]) {
                  tokenId = ethers.BigNumber.from(relevantLogs[i].topics[3]);
                } else {
                  console.log("无法获取代币ID，跳过");
                  continue;
                }
              }
              
              // 获取代币URI和元数据
              let tokenURI = "";
              let metadata = {};
              let image = "";
              try {
                tokenURI = await nftContract.tokenURI(tokenId);
                // 处理不同格式的URI
                if (tokenURI.startsWith("ipfs://")) {
                  const ipfsHash = tokenURI.replace("ipfs://", "");
                  tokenURI = `https://ipfs.io/ipfs/${ipfsHash}`;
                }
                // 尝试获取元数据（测试环境无元数据）
                try {
                  const response = await fetch(tokenURI);
                  if (response.ok) {
                    metadata = await response.json();
                    // 处理图像URL
                    if (metadata.image) {
                      image = metadata.image;
                      if (image.startsWith("ipfs://")) {
                        const ipfsHash = image.replace("ipfs://", "");
                        image = `https://ipfs.io/ipfs/${ipfsHash}`;
                      }
                    }
                  }
                } catch (metadataError) {
                  console.log("获取元数据失败:", metadataError.message);
                }
              } catch (uriError) {
                console.log("获取代币URI失败:", uriError.message);
              }
              
              // 添加到拥有的NFT列表
              nfts.push({
                id: tokenId.toString(),
                name: metadata.name || `${name} #${tokenId.toString()}`,
                description: metadata.description || "",
                contract: contractAddress,
                collectionName: name,
                image: image || `https://via.placeholder.com/350x350.png?text=${encodeURIComponent(name+' #'+tokenId.toString())}`,
                attributes: metadata.attributes || []
              });
              console.log(`已添加NFT: ${name} #${tokenId.toString()}`);
            } catch (tokenError) {
              console.log(`处理代币时出错:`, tokenError.message);
            }
          }
        }
      } catch (contractError) {
        console.log(`无法查询合约 ${contractAddress}:`, contractError.message);
      }
    }
    console.log(`总共找到 ${nfts.length} 个NFT`);
    
    // 如果没有找到任何NFT
    if (nfts.length === 0) {
      console.warn("未找到真实NFT，考虑检查钱包地址或网络连接");
    }
    return nfts;
  } catch (error) {
    console.error("获取NFT时出现错误:", error);
    throw error;
  }
};

/**
 * 生成墓碑NFT的元数据
 * @param {string} owner 创建者地址
 * @param {string} epitaph 墓志铭
 * @param {Array} burnedNFTs 已烧毁的NFT
 * @returns {Object} 元数据对象
 */
export const generateMetadata = (owner, epitaph, burnedNFTs) => {
  const timestamp = new Date().toISOString();
  const burnedNFTList = burnedNFTs.map(nft => ({
    name: nft.name || `NFT #${nft.id}`,
    contract: nft.contract,
    id: nft.id,
    collection: nft.collectionName || 'Unknown Collection'
  }));

  // 为墓碑生成SVG图像
  const svgImage = generateTombstoneSVG(epitaph, burnedNFTList);

  // 生成完整的NFT元数据
  return {
    name: `NFT Memorial - ${timestamp}`,
    description: `Memorial NFT created for burned NFTs with the epitaph: "${epitaph}"`,
    image: `data:image/svg+xml;base64,${utf8ToBase64(svgImage)}`, // 使用UTF-8安全的编码函数
    external_url: "https://nft-memorial.example.com",
    attributes: [
      {
        trait_type: "Epitaph",
        value: epitaph
      },
      {
        trait_type: "Creation Date",
        value: timestamp
      },
      {
        trait_type: "Number of Burned NFTs",
        value: burnedNFTs.length
      },
      {
        trait_type: "Creator",
        value: owner
      }
    ],
    burnedNFTs: burnedNFTList
  };
};

/**
 * 生成墓碑SVG图像
 * @param {string} epitaph 墓志铭
 * @param {Array} burnedNFTs 已烧毁的NFT列表
 * @returns {string} SVG字符串
 */
const generateTombstoneSVG = (epitaph, burnedNFTs) => {
  // 简单的SVG墓碑图像生成
  const date = new Date().toLocaleDateString('zh-CN');
  
  // 将墓志铭拆分成多行以适应SVG
  const maxLineLength = 20;
  let formattedEpitaph = '';
  let line = '';
  
  epitaph.split(' ').forEach(word => {
    if ((line + word).length > maxLineLength) {
      formattedEpitaph += line + '\n';
      line = word + ' ';
    } else {
      line += word + ' ';
    }
  });
  
  formattedEpitaph += line;
  
  // 构建墓碑中的烧毁NFT列表
  let burnedNFTsText = '';
  burnedNFTs.forEach((nft, index) => {
    burnedNFTsText += `<tspan x="50%" dy="20">${nft.name}</tspan>`;
  });

  return `
    <svg width="500" height="600" xmlns="http://www.w3.org/2000/svg">
      <style>
        .tombstone { fill: #6B7280; }
        .epitaph { font-family: serif; font-size: 16px; fill: white; text-anchor: middle; }
        .date { font-family: sans-serif; font-size: 12px; fill: #D1D5DB; text-anchor: middle; }
        .burned-nfts { font-family: sans-serif; font-size: 10px; fill: #E5E7EB; text-anchor: middle; }
        .title { font-family: serif; font-size: 20px; fill: white; text-anchor: middle; font-weight: bold; }
      </style>
      
      <!-- 墓碑形状 -->
      <path class="tombstone" d="M50,150 C50,100 100,50 250,50 C400,50 450,100 450,150 L450,550 L50,550 Z" />
      
      <!-- 墓碑顶部装饰 -->
      <circle cx="250" cy="50" r="20" fill="#6B7280" />
      
      <!-- 标题 -->
      <text x="250" y="120" class="title">永远的记忆</text>
      <line x1="100" y1="140" x2="400" y2="140" stroke="white" stroke-opacity="0.3" />
      
      <!-- 墓志铭 -->
      <text x="250" y="200" class="epitaph">
        ${formattedEpitaph.split('\n').map((line, i) => 
          `<tspan x="250" dy="${i === 0 ? 0 : 25}">${line}</tspan>`
        ).join('')}
      </text>
      
      <!-- 日期 -->
      <text x="250" y="350" class="date">创建于 ${date}</text>
      
      <!-- 烧毁的NFT列表 -->
      <text x="250" y="400" class="burned-nfts">
        <tspan x="250" font-weight="bold">纪念以下NFT:</tspan>
        ${burnedNFTsText}
      </text>
    </svg>
  `;
};

/**
 * 将元数据上传到IPFS
 * @param {Object} metadata 元数据对象
 * @returns {Promise<string>} IPFS URI
 */
export const uploadToIPFS = async (metadata) => {
  // 先试本地节点
  if (IPFS_API_URL) {
    try {
      console.log('本地IPFS:', IPFS_API_URL, "\nmetadata:", metadata);
      const ipfs = createIPFSClient({ url: IPFS_API_URL });
      // 不再使用 Buffer，而是直接上传字符串
      const result = await ipfs.add(JSON.stringify(metadata));
      console.log('本地 IPFS 上传成功，CID=', result.cid.toString());
      return `ipfs://${result.cid.toString()}`; 
    } catch (e) {
      console.warn('本地 IPFS 上传失败，回退到 Web3.Storage：', e.message);
    }
  }
  // 检查是否配置了Web3.Storage API密钥
  if (WEB3_STORAGE_TOKEN) {
    try {
      // IPFS上传（测试环境没有配置ipfs）
      const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });
      const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const file = new File([blob], 'metadata.json');
      console.log("开始上传到IPFS...");
      const cid = await client.put([file]);
      console.log("成功上传到IPFS, CID:", cid);
      return `ipfs://${cid}/metadata.json`;
    } catch (error) {
      console.error("IPFS上传失败:", error);
      return generateMockIpfsUri();
    }
  } else {
    console.warn("未配置Web3.Storage API密钥, 使用模拟IPFS URI");
    return generateMockIpfsUri();
  }
};

/**
 * 生成模拟的IPFS URI（当实际上传不可用时）
 * @returns {Promise<string>} 模拟的IPFS URI
 */
const generateMockIpfsUri = async () => {
  // 模拟IPFS URI
  const mockIpfsUri = `ipfs://bafybeihkqvh5zr3fpbhvirlfxinkrnjxxe4z4pvf5bm2ffcxk5i5j7gjay/metadata.json`;
  // 模拟上传延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockIpfsUri;
};