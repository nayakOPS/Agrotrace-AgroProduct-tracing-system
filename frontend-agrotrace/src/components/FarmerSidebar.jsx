import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaPlusCircle, 
  FaBox, 
  FaUser, 
  FaChartLine,
  FaSignOutAlt,
  FaLeaf,
  FaCheckCircle
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const FarmerSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
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
      path: '/farmer/pending-bids',
      label: 'Pending Bids',
      icon: <FaLeaf className="w-5 h-5" />,
      description: 'Manage trader bids'
    },
    {
      path: '/farmer/processing-requests',
      label: 'Processing Requests',
      icon: <FaCheckCircle className="w-5 h-5" />,
      description: 'Manage processing requests'
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

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg">
      {/* Logo and Title */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <Link to="/farmer/dashboard" className="flex items-center space-x-2">
          <FaChartLine className="w-8 h-8 text-emerald-600" />
          <span className="text-xl font-bold text-gray-800">AgroChain</span>
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

      {/* Logout Button */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <FaSignOutAlt className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default FarmerSidebar; 