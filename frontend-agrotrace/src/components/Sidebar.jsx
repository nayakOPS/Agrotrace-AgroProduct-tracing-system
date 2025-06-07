import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaPlusCircle, 
  FaBox, 
  FaUser, 
  FaQrcode,
  FaLeaf,
  FaCheckCircle,
  FaHourglassHalf,
  FaChartLine,
  FaBoxOpen,
  FaList,
  FaClipboardList
} from 'react-icons/fa';
import { ConnectButton, lightTheme } from 'thirdweb/react';
import { client } from '../client';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

// Define a custom theme for the ConnectButton
const customTheme = lightTheme({
  colors: {
    accentButtonBg: "linear-gradient(to right, #059669, #0d9488)",
    accentButtonText: "#ffffff",
  },
});

const Sidebar = () => {
  const location = useLocation();
  const { isFarmer, isTrader } = useAuth();

  const farmerNavItems = [
    {
      path: '/farmer/dashboard',
      label: 'Dashboard',
      icon: <FaHome className="w-5 h-5" />,
      description: 'View your farming analytics and statistics'
    },
    {
      path: '/farmer/add-crop',
      label: 'Add Crop',
      icon: <FaPlusCircle className="w-5 h-5" />,
      description: 'Register new crop batches'
    },
    {
      path: '/farmer/processing-requests',
      label: 'Processing Requests',
      icon: <FaCheckCircle className="w-5 h-5" />,
      description: 'Manage processing requests from traders'
    },
    {
      path: '/farmer/products',
      label: 'My Products',
      icon: <FaBox className="w-5 h-5" />,
      description: 'View your crop batches'
    },
    {
      path: '/farmer/profile',
      label: 'Profile',
      icon: <FaUser className="w-5 h-5" />,
      description: 'View your profile'
    }
  ];

  const traderMenuItems = [
    {
      path: '/trader/dashboard',
      label: 'Trader Dashboard',
      icon: <FaChartLine className="w-5 h-5" />,
      description: 'View your trading analytics'
    },
    {
      path: '/trader/add-product',
      label: 'Process Product',
      icon: <FaBoxOpen className="w-5 h-5" />,
      description: 'Process agricultural products'
    },
    {
      path: '/trader/products',
      label: 'Products',
      icon: <FaList className="w-5 h-5" />,
      description: 'View your processed products'
    },
    {
      path: '/trader/processing-requests',
      label: 'Processing Requests',
      icon: <FaClipboardList className="w-5 h-5" />,
      description: 'View your processing requests from farmers'
    },
    {
      path: '/trader/profile',
      label: 'Profile',
      icon: <FaUser className="w-5 h-5" />,
      description: 'View your profile'
    }
  ];

  const commonNavItems = [
    {
      path: '/scan-qr',
      label: 'Scan QR Code',
      icon: <FaQrcode className="w-5 h-5" />,
      description: 'Scan product QR codes'
    }
  ];

  const navItems = [...(isFarmer ? farmerNavItems : traderMenuItems), ...commonNavItems];

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-screen w-64 bg-white backdrop-blur-sm shadow-xl border-r border-gray-100"
    >
      {/* Logo and Title */}
      <div className="h-16 flex items-center justify-center border-b border-gray-100">
        <Link 
          to={isFarmer ? "/farmer/dashboard" : "/trader/dashboard"} 
          className="flex items-center space-x-2 group"
        >
          <motion.img 
            whileHover={{ scale: 1.1, rotate: 5 }}
            src="/agrotracelogo.png" 
            alt="AgroTrace" 
            className="w-8 h-8 transition-transform duration-200" 
          />
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            AgroTrace
          </span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="mt-6 px-4 space-y-2">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                className={`group flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <div className={`${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors duration-200`}>
                  {item.icon}
                </div>
                <div>
                  <p className={`font-medium ${isActive ? 'text-emerald-700' : 'text-gray-700'} transition-colors duration-200`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-4 w-1.5 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Wallet Connection */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl p-2 shadow-sm"
        >
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
            theme={customTheme}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar; 