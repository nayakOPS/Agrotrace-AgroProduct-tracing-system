import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ConnectButton } from 'thirdweb/react';
import { client } from '../client';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-emerald-600 to-teal-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-white text-xl font-bold">AgroChain</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            <Link
              to="/"
              className="text-white hover:bg-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/register-farmer"
              className="text-white hover:bg-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Register Farmer
            </Link>
            <Link
              to="/register-agrotrader"
              className="text-white hover:bg-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Register AgroTrader
            </Link>
            <Link
              to="/scan-qr"
              className="bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-600 transition-colors"
            >
              Scan QR Code
            </Link>
            {/* Connect Wallet Button */}
            <div className="ml-4">
              <ConnectButton client={client} />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden flex flex-col space-y-2 mt-2 px-2 pb-3">
            <Link to="/" className="text-white hover:bg-emerald-700 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link to="/register-farmer" className="text-white hover:bg-emerald-700 px-3 py-2 rounded-md text-sm font-medium">
              Register Farmer
            </Link>
            <Link to="/register-agrotrader" className="text-white hover:bg-emerald-700 px-3 py-2 rounded-md text-sm font-medium">
              Register AgroTrader
            </Link>
            <Link to="/scan-qr" className="bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-600 transition-colors">
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