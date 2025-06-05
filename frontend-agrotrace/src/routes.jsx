import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { RegistrationProtectedRoute } from './components/RegistrationProtectedRoute.jsx';
import ProcessBatch from './pages/trader/ProcessBatch';

// Common Pages
const Home = lazy(() => import('./pages/common/Home.jsx'));
const AboutUs = lazy(() => import('./pages/common/AboutUs.jsx'));
const ContactUs = lazy(() => import('./pages/common/ContactUs.jsx'));
const ScanQRCode = lazy(() => import('./pages/ScanQR.jsx'));

// Auth Pages
const RegisterFarmer = lazy(() => import('./pages/auth/RegisterFarmer.jsx'));
const RegisterTrader = lazy(() => import('./pages/auth/RegisterTrader.jsx'));

// Farmer Pages
const FarmerDashboard = lazy(() => import('./pages/farmer/Dashboard.jsx'));
const FarmerAddCrop = lazy(() => import('./pages/farmer/AddCrop.jsx'));
const FarmerProducts = lazy(() => import('./pages/farmer/Products.jsx'));
const FarmerProfile = lazy(() => import('./pages/farmer/Profile.jsx'));
const FarmerProcessingRequests = lazy(() => import('./pages/farmer/ProcessingRequests.jsx'));

// Trader Pages
const TraderDashboard = lazy(() => import('./pages/trader/Dashboard.jsx'));
const TraderRequestProcessing = lazy(() => import('./pages/trader/RequestProcessing.jsx'));
const TraderProducts = lazy(() => import('./pages/trader/Products.jsx'));
const TraderProfile = lazy(() => import('./pages/trader/Profile.jsx'));
const TraderProcessingRequests = lazy(() => import('./pages/trader/ProcessingRequests.jsx'));

// Wrap pages with Layout
const wrapWithLayout = (Component) => (
  <Layout>
    <Component />
  </Layout>
);

export const ROUTES = {
  COMMON: [
    { path: '/', element: wrapWithLayout(Home), isProtected: false },
    { path: '/about', element: wrapWithLayout(AboutUs), isProtected: false },
    { path: '/contact', element: wrapWithLayout(ContactUs), isProtected: false },
    { path: '/scan-qr', element: wrapWithLayout(ScanQRCode), isProtected: false },
  ],
  FARMER: [
    { 
      path: '/register-farmer', 
      element: (
        <RegistrationProtectedRoute forRole="Farmer">
          {wrapWithLayout(RegisterFarmer)}
        </RegistrationProtectedRoute>
      ), 
      isProtected: false 
    },
    { path: '/farmer/dashboard', element: wrapWithLayout(FarmerDashboard), isProtected: true, requiredRole: 'Farmer' },
    { path: '/farmer/add-crop', element: wrapWithLayout(FarmerAddCrop), isProtected: true, requiredRole: 'Farmer' },
    { path: '/farmer/products', element: wrapWithLayout(FarmerProducts), isProtected: true, requiredRole: 'Farmer' },
    { path: '/farmer/profile', element: wrapWithLayout(FarmerProfile), isProtected: true, requiredRole: 'Farmer' },
    { path: '/farmer/processing-requests', element: wrapWithLayout(FarmerProcessingRequests), isProtected: true, requiredRole: 'Farmer' },
  ],
  TRADER: [
    { 
      path: '/register-trader', 
      element: (
        <RegistrationProtectedRoute forRole="Trader">
          {wrapWithLayout(RegisterTrader)}
        </RegistrationProtectedRoute>
      ), 
      isProtected: false 
    },
    { path: '/trader/dashboard', element: wrapWithLayout(TraderDashboard), isProtected: true, requiredRole: 'AgroTrader' },
    { path: '/trader/add-product', element: wrapWithLayout(TraderRequestProcessing), isProtected: true, requiredRole: 'AgroTrader' },
    { path: '/trader/process-batch/:batchId', element: wrapWithLayout(ProcessBatch), isProtected: true, requiredRole: 'AgroTrader' },
    { path: '/trader/products', element: wrapWithLayout(TraderProducts), isProtected: true, requiredRole: 'AgroTrader' },
    { path: '/trader/profile', element: wrapWithLayout(TraderProfile), isProtected: true, requiredRole: 'AgroTrader' },
    { path: '/trader/processing-requests', element: wrapWithLayout(TraderProcessingRequests), isProtected: true, requiredRole: 'AgroTrader' },
  ]
};