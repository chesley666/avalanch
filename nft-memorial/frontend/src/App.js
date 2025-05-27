import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { injected } from './connectors';
import Header from './components/Header';
import NFTList from './components/NFTList';
import BurnProcess from './components/BurnProcess';
import EpitaphForm from './components/EpitaphForm';
import MemorialNFT from './components/MemorialNFT';
import { fetchUserNFTs, generateMetadata, uploadToIPFS } from './utils/nftUtils';
import { ethers } from 'ethers';
import MemorialNFTABI from './contracts/MemorialNFT.json';
import NFTBurnerABI from './contracts/NFTBurner.json';
import config from './config';
import { motion, AnimatePresence } from 'framer-motion';

// 从配置文件获取合约地址
const MEMORIAL_NFT_ADDRESS = config.contracts.MemorialNFT || '0x0000000000000000000000000000000000000000';
const NFT_BURNER_ADDRESS = config.contracts.NFTBurner || '0x0000000000000000000000000000000000000000';

// 检查合约地址是否有效
const isValidAddress = (address) => {
  try {
    return address && ethers.utils.isAddress(address);
  } catch (error) {
    return false;
  }
};

function App() {
  const { active, account, library, activate, deactivate, chainId } = useWeb3React();
  
  const [userNFTs, setUserNFTs] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [epitaph, setEpitaph] = useState("");
  const [memorialNFT, setMemorialNFT] = useState(null);
  const [step, setStep] = useState(1); // 1: Connect wallet, 2: Select NFTs, 3: Enter Epitaph, 4: View Memorial
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [networkError, setNetworkError] = useState("");
  const [contractsLoaded, setContractsLoaded] = useState(false);

  // 检查当前网络是否支持
  useEffect(() => {
    if (active && chainId) {
      const supportedNetwork = Object.keys(config.networks).includes(chainId.toString());
      if (!supportedNetwork) {
        setNetworkError(`不支持的网络。请切换到 ${config.networks[config.defaultChainId].name} 网络 (Chain ID: ${config.defaultChainId})`);
      } else {
        setNetworkError("");
      }
    }
  }, [active, chainId]);

  // 检查合约地址是否有效
  useEffect(() => {
    if (!isValidAddress(MEMORIAL_NFT_ADDRESS)) {
      setError(`墓碑NFT合约地址无效或未设置。请确保环境变量 REACT_APP_MEMORIAL_NFT_ADDRESS 已正确配置。`);
      setContractsLoaded(false);
      return;
    }

    if (!isValidAddress(NFT_BURNER_ADDRESS)) {
      setError(`NFT销毁合约地址无效或未设置。请确保环境变量 REACT_APP_NFT_BURNER_ADDRESS 已正确配置。`);
      setContractsLoaded(false);
      return;
    }

    setContractsLoaded(true);
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("正在连接钱包...");
      if (!window.ethereum) {
        throw new Error("未检测到以太坊钱包。请安装MetaMask或其他兼容的钱包扩展。");
      }
      
      // 确保要连接的网络存在
      const targetChainId = config.defaultChainId;
      console.log("目标链ID:", targetChainId);
      
      // 尝试添加自定义网络（如果需要）
      const networkConfig = config.networks[targetChainId];
      if (networkConfig) {
        try {
          // 尝试添加自定义网络
          await addCustomNetwork(targetChainId, networkConfig);
        } catch (addNetworkError) {
          console.warn("添加网络警告:", addNetworkError);
          // 继续尝试连接，即使添加网络失败
        }
      }
      
      await activate(injected, async (error) => {
        console.error("钱包连接错误:", error);
        if (error.name === 'UnsupportedChainIdError') {
          // 尝试切换到支持的网络
          try {
            const provider = window.ethereum;
            const formattedChainId = `0x${Number(targetChainId).toString(16)}`;
            
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: formattedChainId }],
            });
            console.log("已切换到支持的网络");
            await activate(injected); // 重新尝试连接
          } catch (switchError) {
            console.error("网络切换失败:", switchError);
            // 如果错误代码为 4902，表示网络不存在，尝试添加网络
            if (switchError.code === 4902 && networkConfig) {
              try {
                await addCustomNetwork(targetChainId, networkConfig);
                await activate(injected);
              } catch (addError) {
                setError(`无法添加网络: ${addError.message || '未知错误'}`);
              }
            } else {
              setError(`请手动切换到 ${config.networks[targetChainId]?.name || '支持的网络'}`);
            }
          }
        } else {
          setError(`钱包连接失败: ${error.message || '未知错误'}`);
        }
        setLoading(false);
      }, false);
      
      console.log("钱包连接成功!");
    } catch (error) {
      console.error("钱包连接异常:", error);
      setError(`钱包连接失败: ${error.message || '未知错误'}`);
    }
    setLoading(false);
  };

  // 添加自定义网络到MetaMask
  const addCustomNetwork = async (chainId, networkConfig) => {
    if (!window.ethereum) return;
    
    const provider = window.ethereum;
    const formattedChainId = `0x${Number(chainId).toString(16)}`;
    
    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: formattedChainId,
            chainName: networkConfig.name,
            nativeCurrency: {
              name: networkConfig.currency,
              symbol: networkConfig.currency,
              decimals: 18
            },
            rpcUrls: [networkConfig.rpcUrl],
            blockExplorerUrls: networkConfig.explorerUrl ? [networkConfig.explorerUrl] : []
          },
        ],
      });
      console.log(`已添加自定义网络: ${networkConfig.name}`);
      return true;
    } catch (error) {
      console.error("添加自定义网络失败:", error);
      throw error;
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      deactivate();
      setStep(1);
      setSelectedNFTs([]);
      setEpitaph("");
      setMemorialNFT(null);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  // Load user's NFTs after wallet connection
  useEffect(() => {
    const loadNFTs = async () => {
      if (active && account && library && !networkError) {
        setLoading(true);
        try {
          const nfts = await fetchUserNFTs(account, library);
          setUserNFTs(nfts);
          setLoading(false);
        } catch (error) {
          console.error("Error loading NFTs:", error);
          setError("加载NFT失败，请重试。");
          setLoading(false);
        }
      }
    };

    if (active) {
      loadNFTs();
    }
  }, [active, account, library, networkError]);

  // Handle NFT selection
  const handleSelectNFT = (nft) => {
    if (selectedNFTs.some((selected) => selected.id === nft.id && selected.contract === nft.contract)) {
      setSelectedNFTs(selectedNFTs.filter((selected) => 
        !(selected.id === nft.id && selected.contract === nft.contract)
      ));
    } else {
      setSelectedNFTs([...selectedNFTs, nft]);
    }
  };

  // Handle NFT burning and memorial creation
  const createMemorial = async () => {
    if (selectedNFTs.length === 0) {
      setError("请至少选择一个NFT进行纪念");
      return;
    }

    if (!epitaph.trim()) {
      setError("请为您的纪念墓碑输入墓志铭");
      return;
    }

    if (!isValidAddress(MEMORIAL_NFT_ADDRESS)) {
      setError(`墓碑NFT合约地址无效或未设置: ${MEMORIAL_NFT_ADDRESS}`);
      return;
    }

    if (!isValidAddress(NFT_BURNER_ADDRESS)) {
      setError(`NFT销毁合约地址无效或未设置: ${NFT_BURNER_ADDRESS}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("使用的合约地址:", {
        MEMORIAL_NFT_ADDRESS,
        NFT_BURNER_ADDRESS
      });

      // Get contract instances
      const signer = library.getSigner(account);
      const memorialContract = new ethers.Contract(
        MEMORIAL_NFT_ADDRESS,
        MemorialNFTABI.abi,
        signer
      );

      // 始终使用真实NFT数据，不再检测mock数据
      let nftContracts = [];
      let tokenIds = [];
      let nftNames = [];

      // 使用真实NFT合约
      const burnerContract = new ethers.Contract(
        NFT_BURNER_ADDRESS,
        NFTBurnerABI.abi,
        signer
      );

      // Approve and burn each selected NFT
      const useTransfer = [];

      for (const nft of selectedNFTs) {
        const nftContract = new ethers.Contract(
          nft.contract,
          ['function approve(address to, uint256 tokenId) public', 'function isApprovedForAll(address owner, address operator) public view returns (bool)'],
          signer
        );

        // 1.授权NFTBurner合约 转移NFT
        const isApproved = await nftContract.isApprovedForAll(account, NFT_BURNER_ADDRESS);
        
        if (!isApproved) {
          await nftContract.approve(NFT_BURNER_ADDRESS, nft.id);
        }

        nftContracts.push(nft.contract);
        tokenIds.push(nft.id);
        useTransfer.push(true); // Default to transfer method
        nftNames.push(nft.name || `NFT #${nft.id}`);
      }

      // 2.销毁 NFTs
      const burnTx = await burnerContract.burnMultipleNFTs(
        nftContracts, 
        tokenIds,
        useTransfer,
        {
          gasLimit: 3000000 // 设置较高的gas限制，以确保交易成功
        }
      );
      await burnTx.wait();
      console.log("NFT烧毁成功:", burnTx.hash);

      // Generate and upload metadata for memorial NFT
      const metadata = generateMetadata(
        account,
        epitaph,
        selectedNFTs
      );
      
      const metadataURI = await uploadToIPFS(metadata);
      console.log("元数据已上传:", metadataURI);

      // 3.创建墓碑NFT
      const createTx = await memorialContract.createMemorial(
        account,
        metadataURI,
        epitaph,
        nftContracts,
        tokenIds,
        nftNames,
        {
          gasLimit: 5000000 // 设置较高的gas限制，以确保交易成功
        }
      );
      const receipt = await createTx.wait();
      console.log("墓碑NFT创建成功:", createTx.hash);

      // Get the token ID using multiple fallback methods
      let tokenId;
      
      try {
        // 方法1: 检查MemorialCreated事件
        const memorialEvent = receipt.events?.find(e => e && e.event === 'MemorialCreated');
        
        if (memorialEvent && memorialEvent.args && memorialEvent.args.tokenId) {
          // 如果找到了事件，从事件中获取tokenId
          tokenId = memorialEvent.args.tokenId.toString();
          console.log("从MemorialCreated事件中获取到tokenId:", tokenId);
        } 
        // 方法2: 检查Transfer事件 (ERC721标准)
        else {
          console.log("未找到MemorialCreated事件，尝试从Transfer事件获取tokenId");
          const transferEvent = receipt.events?.find(e => {
            // Transfer事件通常有三个indexed参数：from, to, tokenId
            return e && e.topics && e.topics.length === 4 && 
                  // 第一个topic是事件签名
                  e.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' && 
                  // 第三个topic是接收者地址
                  e.topics[2].indexOf(account.substring(2).toLowerCase()) !== -1;
          });
          
          if (transferEvent && transferEvent.topics && transferEvent.topics[3]) {
            // 从Transfer事件中获取tokenId (第四个topic)
            tokenId = parseInt(transferEvent.topics[3], 16).toString();
            console.log("从Transfer事件中获取到tokenId:", tokenId);
          } else {
            // 方法3: 直接从交易日志中提取最后一个创建的NFT ID
            console.log("没有找到Transfer事件，尝试直接解析交易日志");
            
            // 创建一个简单的墓碑NFT对象，无需tokenId
            setMemorialNFT({
              epitaph: epitaph,
              creationDate: new Date(),
              burnedNFTs: selectedNFTs.map(nft => nft.name || `NFT #${nft.id}`),
              uri: metadataURI,
              network: chainId ? config.networks[chainId] : { name: "测试网络" },
              txHash: createTx.hash // 保存交易哈希以供参考
            });
            
            // 跳过获取详细信息，直接进入下一步
            setStep(4);
            return;
          }
        }
        
        // 如果已获取到tokenId，则获取详细信息
        const [creator, creationDate, epitaphText, burnedNFTContracts, burnedNFTIds, burnedNFTNames] = 
          await memorialContract.getMemorialDetails(tokenId);
        
        setMemorialNFT({
          id: tokenId,
          epitaph: epitaphText,
          creationDate: new Date(creationDate.toNumber() * 1000),
          burnedNFTs: burnedNFTNames,
          uri: metadataURI,
          network: chainId ? config.networks[chainId] : { name: "测试网络" },
          txHash: createTx.hash
        });
        
      } catch (tokenIdError) {
        console.error("获取tokenId错误:", tokenIdError);
        
        // 即使无法获取tokenId，仍然创建基本的墓碑NFT对象
        setMemorialNFT({
          epitaph: epitaph,
          creationDate: new Date(),
          burnedNFTs: selectedNFTs.map(nft => nft.name || `NFT #${nft.id}`),
          uri: metadataURI,
          network: chainId ? config.networks[chainId] : { name: "测试网络" },
          txHash: createTx.hash
        });
      }

      // Move to next step
      setStep(4);
    } catch (error) {
      console.error("Error creating memorial:", error);
      setError(`创建墓碑纪念失败：${error.message || '未知错误'}`);
    }

    setLoading(false);
  };

  // Render different steps
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-8 p-10"
          >
            <h2 className="text-3xl font-memorial text-memorial-dark font-bold">永恒的纪念</h2>
            <p className="text-lg text-memorial-muted max-w-md text-center">
              连接您的钱包，开始创建永恒的NFT墓碑纪念
            </p>
            <motion.button 
              onClick={connectWallet} 
              className="px-8 py-4 bg-memorial-accent text-white font-medium rounded-xl shadow-memorial hover:shadow-memorial-hover transition-all duration-300 flex items-center space-x-2 transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>连接中...</span>
                </>
              ) : (
                <span>连接钱包</span>
              )}
            </motion.button>
          </motion.div>
        );
      case 2:
        return (
          <NFTList 
            nfts={userNFTs} 
            selectedNFTs={selectedNFTs} 
            onSelectNFT={handleSelectNFT}
            loading={loading}
            onNext={() => setStep(3)}
          />
        );
      case 3:
        return (
          <EpitaphForm
            epitaph={epitaph}
            setEpitaph={setEpitaph}
            onSubmit={createMemorial}
            loading={loading}
            selectedNFTs={selectedNFTs}
          />
        );
      case 4:
        return (
          <MemorialNFT 
            memorial={memorialNFT} 
          />
        );
      default:
        return null;
    }
  };

  // Effect to update step when wallet is connected
  useEffect(() => {
    if (active && step === 1 && !networkError) {
      setStep(2);
    }
  }, [active, step, networkError]);

  return (
    <div className="app-container min-h-screen">
      <Header 
        connected={active}
        account={account}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        networkName={active && chainId ? config.networks[chainId]?.name : ""}
      />
      
      <main className="container mx-auto px-4 py-10 mt-20">
        <AnimatePresence mode="wait">
          {networkError && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg mb-6 flex items-start shadow-memorial">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{networkError}</p>
              </div>
            </motion.div>
          )}
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-amber-50 border-l-4 border-amber-400 text-amber-800 p-4 rounded-lg mb-6 flex items-start shadow-memorial">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <BurnProcess step={step} />
        
        <motion.div 
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-memorial-card p-8 max-w-4xl mx-auto"
        >
          {renderStep()}
        </motion.div>
      </main>
      
      {/* 页面底部的背景装饰 */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent z-0 pointer-events-none"></div>
    </div>
  );
}

export default App;