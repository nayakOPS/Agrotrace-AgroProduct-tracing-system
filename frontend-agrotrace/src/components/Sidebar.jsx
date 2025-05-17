import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaPlusCircle, 
  FaBox, 
  FaUser, 
  FaQrcode,
  FaLeaf
} from 'react-icons/fa';
import { ConnectButton } from 'thirdweb/react';
import { client } from '../client';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { isFarmer, isTrader } = useAuth();

  const farmerNavItems = [
    {
      path: '/farmer/dashboard',
      label: 'Farmer Dashboard',
      icon: <FaHome className="w-5 h-5" />,
      description: 'View your farming analytics'
    },
    {
      path: '/farmer/add-crop',
      label: 'Add Crop',
      icon: <FaPlusCircle className="w-5 h-5" />,
      description: 'Register new crop batches'
    },
    {
      path: '/farmer/products',
      label: 'My Products',
      icon: <FaBox className="w-5 h-5" />,
      description: 'Manage your crop batches'
    },
    {
      path: '/farmer/profile',
      label: 'Profile',
      icon: <FaUser className="w-5 h-5" />,
      description: 'View and edit your profile'
    }
  ];

  const traderNavItems = [
    {
      path: '/trader/dashboard',
      label: ' Trader Dashboard',
      icon: <FaHome className="w-5 h-5" />,
      description: 'View your trading analytics'
    },
    {
      path: '/trader/add-product',
      label: 'Add Product',
      icon: <FaPlusCircle className="w-5 h-5" />,
      description: 'Add new processed products'
    },
    {
      path: '/trader/products',
      label: 'My Products',
      icon: <FaBox className="w-5 h-5" />,
      description: 'Manage your products'
    },
    {
      path: '/trader/profile',
      label: 'Profile',
      icon: <FaUser className="w-5 h-5" />,
      description: 'View and edit your profile'
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

  const navItems = [...(isFarmer ? farmerNavItems : traderNavItems), ...commonNavItems];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg">
      {/* Logo and Title */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <Link to={isFarmer ? "/farmer/dashboard" : "/trader/dashboard"} className="flex items-center space-x-2">
          <img src="/agrotracelogo.png" alt="AgroTrace" className="w-8 h-8" />
          <span className="text-xl font-bold text-gray-800">AgroTrace</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="mt-6 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className={`${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {item.icon}
              </div>
              <div>
                <p className={`font-medium ${isActive ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {item.label}
                </p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Wallet Connection */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <div className="bg-emerald-50 rounded-lg p-2">
          <ConnectButton 
            client={client}
            theme="light"
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
              backgroundColor: '#059669',
              color: 'white',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: '#047857',
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 