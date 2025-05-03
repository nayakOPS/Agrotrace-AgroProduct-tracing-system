import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ConnectButton } from 'thirdweb/react';
import { client } from '../client';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isFarmer, isTrader } = useAuth();
  const location = useLocation();
  
  // Check if current page is home
  const isHomePage = location.pathname === '/';

  // Role-specific navigation items
  const farmerNavItems = [
    { path: '/farmer/dashboard', label: 'Dashboard' },
    { path: '/farmer/add-crop', label: 'Add Crop' },
    { path: '/farmer/products', label: 'My Products' },
    { path: '/farmer/profile', label: 'Profile' },
    { path: '/chatbot', label:'Assistant'}
  ];

  const traderNavItems = [
    { path: '/trader/dashboard', label: 'Dashboard' },
    { path: '/trader/add-product', label: 'Add Product' },
    { path: '/trader/products', label: 'My Products' },
    { path: '/trader/profile', label: 'Profile' },
    { path: '/chatbot', label:'Assistant'}
  ];

  return (
    <nav className={`${isHomePage ? 'bg-transparent absolute w-full' : 'bg-gradient-to-r from-emerald-600 to-teal-500 shadow-lg'} z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className={`text-xl font-bold ${isHomePage ? 'text-white drop-shadow-md' : 'text-white'}`}>AgroChain</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            {!isFarmer && !isTrader && (
              <>
                <Link 
                  to="/" 
                  className={`${isHomePage ? 'text-white hover:bg-white/10' : 'text-white hover:bg-emerald-700'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  Home
                </Link>
                <Link 
                  to="/register-farmer" 
                  className={`${isHomePage ? 'text-white hover:bg-white/10' : 'text-white hover:bg-emerald-700'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  Register Farmer
                </Link>
                <Link 
                  to="/register-trader" 
                  className={`${isHomePage ? 'text-white hover:bg-white/10' : 'text-white hover:bg-emerald-700'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  Register AgroTrader
                </Link>
                <Link 
                  to="/chatbot" 
                  className={`${isHomePage ? 'text-white hover:bg-white/10' : 'text-white hover:bg-emerald-700'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  Assistant
                </Link>
              </>
            )}

            {/* Farmer Navigation */}
            {isFarmer && farmerNavItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`${isHomePage ? 'text-white hover:bg-white/10' : 'text-white hover:bg-emerald-700'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                {item.label}
              </Link>
              
            ))}

            {/* Trader Navigation */}
            {isTrader && traderNavItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`${isHomePage ? 'text-white hover:bg-white/10' : 'text-white hover:bg-emerald-700'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                {item.label}
              </Link>
            ))}

            <Link 
              to="/scan-qr" 
              className={`${isHomePage ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-teal-700 hover:bg-teal-600 text-white'} px-4 py-2 rounded-md text-sm font-medium transition-colors`}
            >
              Scan QR Code
            </Link>
            <div className="ml-4">
              <ConnectButton client={client} />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden ${isHomePage ? 'text-white' : 'text-white'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden flex flex-col space-y-2 mt-2 px-2 pb-3 ${isHomePage ? 'bg-white/10 backdrop-blur-sm' : 'bg-emerald-600 shadow-lg'}`}>
            {!isFarmer && !isTrader && (
              <>
                <Link 
                  to="/" 
                  className={`${isHomePage ? 'text-white hover:bg-white/20' : 'text-white hover:bg-emerald-700'} px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Home
                </Link>
                <Link 
                  to="/register-farmer" 
                  className={`${isHomePage ? 'text-white hover:bg-white/20' : 'text-white hover:bg-emerald-700'} px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Register Farmer
                </Link>
                <Link 
                  to="/register-trader" 
                  className={`${isHomePage ? 'text-white hover:bg-white/20' : 'text-white hover:bg-emerald-700'} px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Register AgroTrader
                </Link>
              </>
            )}

            {/* Farmer Mobile Navigation */}
            {isFarmer && farmerNavItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`${isHomePage ? 'text-white hover:bg-white/20' : 'text-white hover:bg-emerald-700'} px-3 py-2 rounded-md text-sm font-medium`}
              >
                {item.label}
              </Link>
            ))}

            {/* Trader Mobile Navigation */}
            {isTrader && traderNavItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`${isHomePage ? 'text-white hover:bg-white/20' : 'text-white hover:bg-emerald-700'} px-3 py-2 rounded-md text-sm font-medium`}
              >
                {item.label}
              </Link>
            ))}

            <Link 
              to="/scan-qr" 
              className={`${isHomePage ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-teal-700 hover:bg-teal-600 text-white'} px-4 py-2 rounded-md text-sm font-medium`}
            >
              Scan QR Code
            </Link>
            <div className="mt-2">
              <ConnectButton client={client} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;