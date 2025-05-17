import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ConnectButton } from 'thirdweb/react';
import { client } from '../client';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const location = useLocation();
  const { isFarmer, isTrader, isAuthenticated, isLoading } = useAuth();
  const isHomePage = location.pathname === '/';

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated as farmer or trader, show sidebar
  if (isAuthenticated && (isFarmer || isTrader)) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50">
        <Sidebar />
        <div className="ml-64 p-8">
          <main className="max-w-full">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // For homepage and unauthenticated users or authenticated but not registered users
  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50">
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img src="/agrotracelogo.png" alt="AgroTrace" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-800">AgroTrace</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              {/* Show registration links only if not registered as either farmer or trader */}
              {isAuthenticated && !isFarmer && !isTrader && (
                <>
                  <Link
                    to="/register-farmer"
                    className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Register as Farmer
                  </Link>
                  <Link
                    to="/register-trader"
                    className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Register as Trader
                  </Link>
                </>
              )}
              <Link
                to="/scan-qr"
                className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Scan QR Code
              </Link>
              <div className="ml-4">
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
        </div>
      </div>
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
};

export default Layout; 