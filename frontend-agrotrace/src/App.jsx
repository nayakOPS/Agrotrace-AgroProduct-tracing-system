import { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ROUTES } from './routes.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import Navbar from './components/NavBar.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { AuthProvider } from './context/AuthContext';

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Common Routes */}
            {ROUTES.COMMON.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  route.isProtected ? (
                    <ProtectedRoute>
                      {route.element}
                    </ProtectedRoute>
                  ) : (
                    route.element
                  )
                }
              />
            ))}
            
            {/* Farmer Routes */}
            {ROUTES.FARMER.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  route.isProtected ? (
                    <ProtectedRoute requiredRole={route.requiredRole}>
                      {route.element}
                    </ProtectedRoute>
                  ) : (
                    route.element
                  )
                }
              />
            ))}
            
            {/* Trader Routes */}
            {ROUTES.TRADER.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  route.isProtected ? (
                    <ProtectedRoute requiredRole={route.requiredRole}>
                      {route.element}
                    </ProtectedRoute>
                  ) : (
                    route.element
                  )
                }
              />
            ))}
            
            {/* Fallback Route - Redirect to appropriate dashboard if logged in */}
            <Route path="*" element={
              <ProtectedRoute>
                <Navigate to="/" />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};