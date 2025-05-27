import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiUserLine, RiArrowDownSLine, RiLogoutBoxRLine, RiWallet3Line } from 'react-icons/ri';

const Header = ({ connected, account, onConnect, onDisconnect, networkName }) => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // 监听滚动事件，为Header添加滚动效果
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // 格式化地址显示
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className={`fixed w-full top-0 z-30 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md text-memorial-dark shadow-memorial py-2' 
          : 'bg-gradient-to-r from-memorial-accent/90 to-primary-700/90 backdrop-blur-md text-white py-3'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-6">
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="mr-2"
            whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
          >
            <svg 
              width="36" 
              height="36" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className={scrolled ? 'text-memorial-accent' : 'text-white'}
            >
              <path d="M12 7V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 5L16 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M17 21H7C5.89543 21 5 20.1046 5 19V10C5 8.89543 5.89543 8 7 8H17C18.1046 8 19 8.89543 19 10V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 13H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 17H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.div>
          <div>
            <motion.h1 
              className="text-2xl font-memorial font-bold tracking-tight"
              animate={{ y: [0, -2, 0], transition: { repeat: Infinity, repeatDelay: 5, duration: 0.5 } }}
            >
              NFT Memorial
            </motion.h1>
            <span className={`text-xs ${scrolled ? 'bg-memorial-accent/10 text-memorial-accent' : 'bg-white/20'} px-2 py-0.5 rounded-md`}>
              墓碑纪念
            </span>
          </div>
        </motion.div>
        
        <div>
          <AnimatePresence mode="wait">
            {connected ? (
              <motion.div 
                className="flex items-center space-x-3"
                key="connected"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <span className={`text-xs ${scrolled ? 'bg-memorial-surface text-memorial-muted' : 'bg-white/10 text-white'} px-2 py-1 rounded-md`}>
                  {networkName || "未知网络"}
                </span>
                
                <div className="relative">
                  <motion.button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`text-sm px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
                      scrolled
                        ? 'bg-memorial-light hover:bg-memorial-surface text-memorial-dark'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <RiUserLine className="opacity-70" />
                    <span>{formatAddress(account)}</span>
                    <RiArrowDownSLine className={`transition-transform ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div 
                        className="absolute right-0 mt-2 w-48 rounded-lg shadow-memorial-card bg-white overflow-hidden z-10"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-3">
                          <div className="text-xs text-memorial-muted mb-1">已连接钱包</div>
                          <div className="text-sm font-medium text-memorial-dark break-all">{account}</div>
                        </div>
                        <div className="border-t border-memorial-surface">
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              onDisconnect();
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-left text-memorial-dark hover:bg-memorial-light transition-colors"
                          >
                            <RiLogoutBoxRLine className="mr-2" /> 断开连接
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="disconnected"
                onClick={onConnect}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 font-medium ${
                  scrolled
                    ? 'bg-memorial-accent text-white shadow-memorial hover:shadow-memorial-hover'
                    : 'bg-white text-memorial-accent shadow-lg hover:bg-opacity-90'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <RiWallet3Line />
                <span>连接钱包</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;