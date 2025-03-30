import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// Common Pages
const Home = lazy(() => import('./pages/common/Home.jsx'));
const AboutUs = lazy(() => import('./pages/common/AboutUs.jsx'));
const ContactUs = lazy(() => import('./pages/common/ContactUs.jsx'));
const ScanQRCode = lazy(() => import('./pages/common/ScanQRCode.jsx'));
// const CommonProfile = lazy(() => import('./pages/common/Profile.jsx'));

// Auth Pages
const RegisterFarmer = lazy(() => import('./pages/auth/RegisterFarmer.jsx'));
const RegisterTrader = lazy(() => import('./pages/auth/RegisterTrader.jsx'));

// Farmer Pages
const FarmerDashboard = lazy(() => import('./pages/farmer/Dashboard.jsx'));
const FarmerAddCrop = lazy(() => import('./pages/farmer/AddCrop.jsx'));
const FarmerProducts = lazy(() => import('./pages/farmer/Products.jsx'));
const FarmerProfile = lazy(() => import('./pages/farmer/Profile.jsx'));

// Trader Pages
const TraderDashboard = lazy(() => import('./pages/trader/Dashboard.jsx'));
const TraderAddProduct = lazy(() => import('./pages/trader/AddProduct.jsx'));
const TraderProducts = lazy(() => import('./pages/trader/Products.jsx'));
const TraderProfile = lazy(() => import('./pages/trader/Profile.jsx'));

export const ROUTES = {
  COMMON: [
    { path: '/', element: <Home />, isProtected: false },
    { path: '/about', element: <AboutUs />, isProtected: false },
    { path: '/contact', element: <ContactUs />, isProtected: false },
    { path: '/scan-qr', element: <ScanQRCode />, isProtected: false },
    // { path: '/profile', element: <CommonProfile />, isProtected: false },
  ],
  FARMER: [
    { path: '/register-farmer', element: <RegisterFarmer />, isProtected: false },
    { path: '/farmer/dashboard', element: <FarmerDashboard />, isProtected: true, requiredRole: 'Farmer' },
    { path: '/farmer/add-crop', element: <FarmerAddCrop />, isProtected: true, requiredRole: 'Farmer' },
    { path: '/farmer/products', element: <FarmerProducts />, isProtected: true, requiredRole: 'Farmer' },
    { path: '/farmer/profile', element: <FarmerProfile />, isProtected: true, requiredRole: 'Farmer' },
  ],
  TRADER: [
    { path: '/register-trader', element: <RegisterTrader />, isProtected: false },
    { path: '/trader/dashboard', element: <TraderDashboard />, isProtected: true, requiredRole: 'AgroTrader' },
    { path: '/trader/add-product', element: <TraderAddProduct />, isProtected: true, requiredRole: 'AgroTrader' },
    { path: '/trader/products', element: <TraderProducts />, isProtected: true, requiredRole: 'AgroTrader' },
    { path: '/trader/profile', element: <TraderProfile />, isProtected: true, requiredRole: 'AgroTrader' },
  ]
};