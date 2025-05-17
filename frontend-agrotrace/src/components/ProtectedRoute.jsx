import { Navigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { role, isLoading, isAuthenticated, isFarmer, isTrader } = useRole();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Verifying your access...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we check your credentials</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // If no specific role required but user has a role, redirect to their dashboard
  if (!requiredRole && role) {
    return <Navigate to={isFarmer ? '/farmer/dashboard' : '/trader/dashboard'} />;
  }

  // If specific role is required but doesn't match
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={requiredRole === 'Farmer' ? '/register-farmer' : '/register-trader'} />;
  }

  return children;
};