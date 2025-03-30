import { Navigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { role, isLoading, isAuthenticated, isFarmer, isTrader } = useRole();

  if (isLoading) {
    return <div>Loading...</div>;
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