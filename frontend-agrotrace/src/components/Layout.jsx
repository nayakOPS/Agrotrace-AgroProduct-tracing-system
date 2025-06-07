import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ConnectButton } from 'thirdweb/react';
import { client } from '../client';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const Layout = ({ children }) => {
  const location = useLocation();
  const { isFarmer, isTrader, isAuthenticated, isLoading } = useAuth();
  const isHomePage = location.pathname === '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If authenticated as farmer or trader, show sidebar
  if (isAuthenticated && (isFarmer || isTrader)) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar />
        <div className="ml-64 p-8 bg-white">
          <motion.main 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-full"
          >
            {children}
          </motion.main>
        </div>
      </div>
    );
  }

  // For homepage and unauthenticated users or authenticated but not registered users
  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 bg-white backdrop-blur-sm shadow-lg z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.img 
                whileHover={{ scale: 1.1 }}
                src="/agrotracelogo.png" 
                alt="AgroTrace" 
                className="w-8 h-8 transition-transform duration-200" 
              />
              <span className="text-xl font-bold bg-primary-text-gradient dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                AgroTrace
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Show registration links only if not registered as either farmer or trader */}
              {isAuthenticated && !isFarmer && !isTrader && (
                <>
                  <Link
                    to="/register-farmer"
                    className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    Register as Farmer
                  </Link>
                  <Link
                    to="/register-trader"
                    className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    Register as Trader
                  </Link>
                </>
              )}
              <div className="w-[140px]">
                <Link
                  to="/scan-qr"
                  className="block w-full bg-emerald-500 text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-center shadow-md hover:shadow-lg"
                >
                  Scan QR Code
                </Link>
              </div>
              <div className="w-[140px]">
                <ConnectButton 
                  client={client}
                  btnTitle="Connect Wallet"
                  modalTitle="Connect your wallet"
                  modalSize="wide"
                  welcomeScreen={{
                    title: "Welcome to AgroTrace",
                    subtitle: "Connect your wallet to get started"
                  }}
                  termsOfServiceUrl="https://agrotrace.com/terms"
                  privacyPolicyUrl="https://agrotrace.com/privacy"
                  style={{
                    background: 'linear-gradient(to right, #059669, #0d9488)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: '100%',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      background: 'linear-gradient(to right, #047857, #0f766e)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-2">
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-800 focus:outline-none transition-colors duration-200"
              >
                {isMenuOpen ? (
                  <FaTimes className="h-6 w-6" />
                ) : (
                  <FaBars className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden overflow-hidden"
              >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  {isAuthenticated && !isFarmer && !isTrader && (
                    <>
                      <Link
                        to="/register-farmer"
                        className="block text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-lg text-base font-medium hover:bg-emerald-50 dark:hover:bg-gray-800 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Register as Farmer
                      </Link>
                      <Link
                        to="/register-trader"
                        className="block text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-lg text-base font-medium hover:bg-emerald-50 dark:hover:bg-gray-800 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Register as Trader
                      </Link>
                    </>
                  )}
                  <div className="px-3 py-2 w-full space-y-2">
                    <div className="w-full">
                      <Link
                        to="/scan-qr"
                        className="block w-full bg-red-500 text-yellow-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-center shadow-md hover:shadow-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Scan QR Code
                      </Link>
                    </div>
                    <div className="w-full">
                      <ConnectButton 
                        client={client}
                        btnTitle="Connect Wallet"
                        modalTitle="Connect your wallet"
                        modalSize="wide"
                        welcomeScreen={{
                          title: "Welcome to AgroTrace",
                          subtitle: "Connect your wallet to get started"
                        }}
                        termsOfServiceUrl="https://agrotrace.com/terms"
                        privacyPolicyUrl="https://agrotrace.com/privacy"
                        style={{
                          background: 'linear-gradient(to right, #059669, #0d9488)',
                          color: 'white',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          width: '100%',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          '&:hover': {
                            background: 'linear-gradient(to right, #047857, #0f766e)',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main content area for homepage and unauthenticated users */}
      {isHomePage && (
         <motion.main 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-16"
         >
           {children}
         </motion.main>
      )}

      {/* Main content area for authenticated but not registered users */}
      {isAuthenticated && !isFarmer && !isTrader && (
         <motion.main 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-16"
         >
           {children}
         </motion.main>
      )}

      {/* Main content area for unauthenticated users */} {/* This seems redundant with isHomePage, keeping for now */}
      {!isAuthenticated && !isHomePage && (
         <motion.main 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-16"
         >
           {children}
         </motion.main>
      )}

    </div>
  );
};

export default Layout; 