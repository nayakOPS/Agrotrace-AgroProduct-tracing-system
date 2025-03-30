import { createContext, useContext } from 'react';
import { useRole } from '../hooks/useRole';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const roleData = useRole();
  return <AuthContext.Provider value={roleData}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};