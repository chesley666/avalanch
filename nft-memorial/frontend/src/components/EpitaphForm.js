import React, { useState } from 'react';
import { motion } from 'framer-motion';

const EpitaphForm = ({ epitaph, setEpitaph, onSubmit, loading, selectedNFTs }) => {
  const [charCount, setCharCount] = useState(epitaph.length);
  const maxChars = 500;

  const handleEpitaphChange = (e) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setEpitaph(text);
      setCharCount(text.length);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 py-4"
    >
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-memorial text-memorial-dark font-bold">创建墓志铭</h2>
        <p className="text-memorial-muted max-w-xl mx-auto">
          为您即将永久纪念的 {selectedNFTs.length} 个 NFT 创作一段墓志铭。
          这段文字将永远铭刻在区块链上，成为这些数字资产永恒的纪念。
        </p>
      </div>

      <div className="mt-6">
        <div className="rounded-xl border border-memorial-surface overflow-hidden shadow-sm">
          <div className="bg-memorial-light/30 px-4 py-3 flex justify-between items-center border-b border-memorial-surface">
            <span className="font-medium text-sm text-memorial-dark">墓志铭</span>
            <span className="text-xs text-memorial-muted">
              {charCount}/{maxChars} 字符
            </span>
          </div>
          <textarea
            value={epitaph}
            onChange={handleEpitaphChange}
            placeholder="在此输入您的墓志铭..."
            className="w-full p-4 h-64 bg-white focus:ring-memorial-accent focus:border-memorial-accent block w-full border-0 resize-none"
            disabled={loading}
          />
        </div>
        
        <div className="mt-4 text-sm text-memorial-muted">
          <p>墓志铭将作为元数据的一部分，永久存储在区块链上。</p>
        </div>
      </div>

      <div className="bg-memorial-light/30 rounded-xl p-6">
        <h3 className="font-medium text-memorial-dark mb-4">预览</h3>
        <div className="tombstone bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-3xl p-6 text-center relative shadow-memorial-card">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-700 rounded-full"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-700"></div>
          
          <div className="font-memorial text-white opacity-90 text-lg">
            {epitaph || <span className="text-gray-400 italic">请输入墓志铭...</span>}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="text-gray-300 text-sm">纪念</div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {selectedNFTs.map((nft) => (
                <div key={`${nft.contract}-${nft.id}`} className="bg-gray-600 rounded-lg px-2 py-1 text-xs text-white">
                  {nft.name || `NFT #${nft.id}`}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center pt-6">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSubmit}
          disabled={!epitaph.trim() || loading}
          className={`px-8 py-4 rounded-xl transition-all font-medium flex items-center ${
            !epitaph.trim() || loading
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-memorial-accent text-white shadow-memorial hover:shadow-memorial-hover'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              创建纪念中...
            </>
          ) : (
            '创建纪念墓碑'
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EpitaphForm;