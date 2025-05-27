import React from 'react';
import { motion } from 'framer-motion';

const NFTList = ({ nfts, selectedNFTs, onSelectNFT, loading, onNext }) => {
  const isSelected = (nft) => {
    return selectedNFTs.some(
      (selected) => selected.id === nft.id && selected.contract === nft.contract
    );
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-memorial text-memorial-dark font-bold">选择要纪念的NFT</h2>
        <p className="text-memorial-muted">选择您想要永久纪念的NFT。这些NFT将被送到区块链的彼岸，并创建一个永恒的纪念墓碑。</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-memorial-accent"></div>
        </div>
      ) : nfts.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="inline-flex rounded-full bg-amber-100 p-4">
            <div className="rounded-full stroke-amber-600 bg-amber-200 p-4">
              <svg className="h-8 w-8" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.0002 9.33337V14M14.0002 18.6667H14.0118M25.6668 14C25.6668 20.4434 20.4435 25.6667 14.0002 25.6667C7.55684 25.6667 2.3335 20.4434 2.3335 14C2.3335 7.55672 7.55684 2.33337 14.0002 2.33337C20.4435 2.33337 25.6668 7.55672 25.6668 14Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-medium text-memorial-dark">未找到NFT</h3>
          <p className="text-memorial-muted max-w-md mx-auto">
            您的钱包中没有任何NFT。请确保您已连接正确的钱包并且在支持的区块链网络上。
          </p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
        >
          {nfts.map((nft) => (
            <motion.div
              key={`${nft.contract}-${nft.id}`}
              variants={item}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`nft-card group cursor-pointer ${
                isSelected(nft)
                  ? 'ring-4 ring-memorial-accent'
                  : 'hover:shadow-memorial-hover'
              } bg-white rounded-xl overflow-hidden shadow-memorial flex flex-col`}
              onClick={() => onSelectNFT(nft)}
            >
              <div className="aspect-square w-full relative">
                {nft.image ? (
                  <img
                    src={nft.image}
                    alt={nft.name || `NFT #${nft.id}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-memorial-surface to-memorial-accent/20 flex items-center justify-center">
                    <div className="text-4xl font-bold text-memorial-muted opacity-40">#</div>
                    <div className="text-4xl font-bold text-memorial-muted opacity-40">{nft.id}</div>
                  </div>
                )}
                
                {isSelected(nft) && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-3 right-3 bg-memorial-accent text-white p-1 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
                
                <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white transition-opacity ${isSelected(nft) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <div className="text-sm font-medium truncate">{nft.name || `NFT #${nft.id}`}</div>
                  <div className="text-xs truncate opacity-80">{nft.collection || '未命名收藏'}</div>
                </div>
              </div>
              
              <div className="p-4 flex-1">
                <h3 className="font-semibold text-memorial-dark truncate">
                  {nft.name || `NFT #${nft.id}`}
                </h3>
                <div className="text-sm text-memorial-muted mt-1 line-clamp-2">
                  {nft.description || '这个NFT没有描述...'}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-memorial-light/30 flex justify-between items-center">
                <span className="text-xs text-memorial-muted font-medium">Token ID: {nft.id}</span>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className={`text-xs px-3 py-1 rounded-full ${
                    isSelected(nft)
                      ? 'bg-memorial-accent text-white'
                      : 'bg-memorial-surface text-memorial-muted hover:bg-memorial-accent/10'
                  }`}
                >
                  {isSelected(nft) ? '已选择' : '选择'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="pt-6 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          disabled={selectedNFTs.length === 0}
          className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
            selectedNFTs.length === 0
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-memorial-accent text-white shadow-memorial hover:shadow-memorial-hover'
          }`}
        >
          {selectedNFTs.length > 0 ? `下一步：为${selectedNFTs.length}个NFT创建墓志铭` : '请选择至少一个NFT'}
        </motion.button>
      </div>
    </div>
  );
};

export default NFTList;