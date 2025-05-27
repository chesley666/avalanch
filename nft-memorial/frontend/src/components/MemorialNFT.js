import React from 'react';
import { motion } from 'framer-motion';
import { RiCheckLine, RiExternalLinkLine, RiHome4Line } from 'react-icons/ri';

const MemorialNFT = ({ memorial }) => {
  if (!memorial) {
    return null;
  }

  // 格式化日期显示
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // 动画配置
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10 py-6"
    >
      <motion.div variants={item} className="text-center space-y-4">
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <RiCheckLine className="w-10 h-10 text-green-600" />
        </motion.div>
        
        <motion.h2 
          className="text-3xl font-memorial font-bold text-memorial-dark"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          纪念墓碑已创建
        </motion.h2>
        
        <motion.p 
          className="text-memorial-muted max-w-lg mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          您的NFT墓碑已成功创建并铸造到您的钱包中。以下是您的永恒纪念：
        </motion.p>
      </motion.div>
      
      <motion.div 
        variants={item}
        className="max-w-3xl mx-auto"
      >
        {/* 墓碑样式 */}
        <div className="relative">
          {/* 墓碑顶部装饰 */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 w-12 h-12 bg-gray-700 rounded-full z-10 border-4 border-gray-800"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-8 h-8 bg-gray-600 rounded-full z-20"></div>
          
          <motion.div 
            className="tombstone bg-gradient-to-b from-gray-700 to-gray-800 text-white p-8 pt-10 rounded-t-3xl shadow-memorial-card border-b border-gray-600 relative overflow-hidden"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.5 }}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gray-600/20 via-gray-400/40 to-gray-600/20"></div>
            
            <div className="text-center">
              <h3 className="text-xl font-memorial border-b border-gray-500/50 pb-3 mb-6 inline-block px-6">永恒的纪念</h3>
              
              <motion.div 
                className="text-2xl font-memorial my-8 px-6 leading-relaxed italic opacity-90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                "{memorial.epitaph}"
              </motion.div>
              
              <motion.div 
                className="mt-10 text-sm text-gray-300 font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                创建于 {formatDate(memorial.creationDate)}
              </motion.div>
              
              <motion.div 
                className="mt-2 text-xs text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                Token ID: <span className="font-mono">{memorial.id}</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* 纪念列表 */}
        <motion.div 
          className="bg-white rounded-b-xl shadow-memorial p-8 border border-memorial-surface relative z-10"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h4 className="text-lg font-medium text-memorial-dark mb-4 flex items-center">
            <span className="w-1.5 h-8 bg-memorial-accent rounded-full mr-3 opacity-70"></span>
            纪念的NFT
          </h4>
          
          <div className="bg-memorial-light/30 rounded-xl p-4 border border-memorial-surface">
            <motion.ul className="divide-y divide-memorial-surface">
              {memorial.burnedNFTs.map((nftName, index) => (
                <motion.li 
                  key={index} 
                  className="py-3 flex items-center"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <span className="w-2 h-2 bg-memorial-accent rounded-full mr-3 opacity-70"></span>
                  <span className="text-memorial-dark">{nftName}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
          
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-sm text-memorial-muted mb-4">
              您可以在区块链浏览器中查看您的墓碑NFT
            </p>
            
            <a 
              href={`${memorial.network?.explorerUrl || 'https://testnet.snowtrace.io'}/token/${memorial.uri}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 border border-memorial-surface rounded-lg shadow-memorial text-sm font-medium text-memorial-dark bg-white hover:bg-memorial-light/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-memorial-accent/50 transition-all hover:shadow-memorial-hover"
            >
              在区块浏览器中查看
              <RiExternalLinkLine className="ml-2" />
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        variants={item}
        className="max-w-3xl mx-auto mt-10 text-center"
      >
        <motion.button 
          onClick={() => window.location.reload()}
          className="text-memorial-accent hover:text-memorial-accent/80 font-medium flex items-center justify-center transition-colors mx-auto space-x-2 py-2 px-4 rounded-lg hover:bg-memorial-accent/5"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <RiHome4Line className="mr-1.5" />
          <span>返回首页，创建新的墓碑纪念</span>
        </motion.button>
      </motion.div>
      
      <motion.div
        variants={item}
        className="text-center text-xs text-memorial-muted mt-12 opacity-60"
      >
        <p>NFT Memorial - 永恒的区块链纪念</p>
        <p className="mt-1">©{new Date().getFullYear()} - 您的数字资产的长眠之地</p>
      </motion.div>
    </motion.div>
  );
};

export default MemorialNFT;