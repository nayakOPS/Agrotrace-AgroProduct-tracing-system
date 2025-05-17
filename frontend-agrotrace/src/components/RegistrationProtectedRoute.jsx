import { Navigate } from "react-router-dom";
import { useRole } from "../hooks/useRole";

export const RegistrationProtectedRoute = ({ children, forRole }) => {
  const { isLoading, isFarmer, isTrader, isAuthenticated } = useRole();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // If already registered as Farmer, block trader registration
  if (forRole === "Trader" && isFarmer) {
    return <Navigate to="/farmer/dashboard" />;
  }

  // If already registered as Trader, block farmer registration
  if (forRole === "Farmer" && isTrader) {
    return <Navigate to="/trader/dashboard" />;
  }

  // If already registered as both (shouldn't happen), redirect to home
  if ((isFarmer || isTrader) && !forRole) {
    return <Navigate to="/" />;
  }

  return children;
};