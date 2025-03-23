import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/NavBar";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import RegisterFarmer from "./pages/RegisterFarmer";
import RegisterAgroTrader from "./pages/RegisterAgroTrader";
import FarmerAddCrop from "./pages/FarmerAddCrop";
import AgroTraderAddProduct from "./pages/AgroTraderAddProduct";
import ScanQRCode from "./pages/ScanQRCode";
import FarmerDashboard from "./pages/FarmerDashboard";
import TraderDashboard from "./pages/TraderDashboard";
import { useActiveAccount } from "thirdweb/react";
import { useReadContract } from "thirdweb/react";
import { contract } from "./client";

export const App = () => {
  const account = useActiveAccount();
  const { data: role, isLoading: isRoleLoading } = useReadContract({
    contract,
    method: "function getRole(address _wallet) view returns (string)",
    params: [account?.address || ""],
  });

  if (isRoleLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/scan-qr" element={<ScanQRCode />} />

        {/* Farmer Routes */}
        <Route
          path="/register-farmer"
          element={
            role === "Farmer" ? (
              <Navigate to="/farmer-dashboard" />
            ) : (
              <RegisterFarmer />
            )
          }
        />
        <Route
          path="/farmer-dashboard"
          element={
            role === "Farmer" ? (
              <FarmerDashboard />
            ) : (
              <Navigate to="/register-farmer" />
            )
          }
        />
        <Route
          path="/add-crop"
          element={
            role === "Farmer" ? (
              <FarmerAddCrop />
            ) : (
              <Navigate to="/register-farmer" />
            )
          }
        />

        {/* Trader Routes */}
        <Route
          path="/register-agrotrader"
          element={
            role === "AgroTrader" ? (
              <Navigate to="/trader-dashboard" />
            ) : (
              <RegisterAgroTrader />
            )
          }
        />
        <Route
          path="/trader-dashboard"
          element={
            role === "AgroTrader" ? (
              <TraderDashboard />
            ) : (
              <Navigate to="/register-agrotrader" />
            )
          }
        />
        <Route
          path="/add-agro-product"
          element={
            role === "AgroTrader" ? (
              <AgroTraderAddProduct />
            ) : (
              <Navigate to="/register-agrotrader" />
            )
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};