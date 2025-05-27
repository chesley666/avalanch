import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

// 步骤指南页面
const BurnProcess = ({ step }) => {
  const steps = [
    { id: 1, name: '连接钱包', description: '连接您的钱包以开始NFT烧毁' },
    { id: 2, name: '选择NFT', description: '选择您想要烧毁的NFT' },
    { id: 3, name: '输入墓志铭', description: '为您的NFT墓碑创建纪念文字' },
    { id: 4, name: '查看墓碑', description: '获取您的墓碑NFT' },
  ];

  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-memorial rounded-l-xl p-5 z-10 w-72 border-l border-t border-b border-memorial-surface"
    >
      <h3 className="text-center font-medium text-memorial-dark border-b border-memorial-surface pb-3 mb-4">创建步骤</h3>
      <div className="flex flex-col space-y-5">
        {steps.map((processStep, index) => (
          <motion.div 
            key={processStep.id} 
            className="flex items-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
          >
            <motion.div 
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-all duration-300 ${
                step > processStep.id 
                  ? 'bg-green-100 text-green-600' 
                  : step === processStep.id
                    ? 'bg-memorial-accent/10 text-memorial-accent ring-2 ring-memorial-accent/30'
                    : 'bg-memorial-light text-memorial-muted'
              }`}
              animate={{
                scale: step === processStep.id ? [1, 1.1, 1] : 1
              }}
              transition={{ duration: 0.5, repeat: step === processStep.id ? Infinity : 0, repeatDelay: 2 }}
            >
              {step > processStep.id ? (
                <FiCheck size={16} />
              ) : (
                <span className="text-sm font-medium">{processStep.id}</span>
              )}
            </motion.div>
            <div className="flex flex-col">
              <span className={`text-sm font-medium ${
                step >= processStep.id ? 'text-memorial-dark' : 'text-memorial-muted'
              }`}>
                {processStep.name}
                {step === processStep.id && (
                  <motion.span 
                    className="ml-2 text-memorial-accent inline-block"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
                  >
                    →
                  </motion.span>
                )}
              </span>
              <span className="text-xs text-memorial-muted mt-1">
                {processStep.description}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default BurnProcess;