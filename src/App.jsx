import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Auth Pages
import Login from './Pages/auth/Login';
import Register from './Pages/auth/Register';

// Dashboard Pages
import SuperAdminDashboard from './Pages/Dashboards/SuperAdminDashboard';
import AdminDashboard from './Pages/Dashboards/AdminDashboard';
import AgentDashboard from './Pages/Dashboards/AgentDashboard';

// Feature Pages
import Customers from './Pages/Customers';
import Orders from './Pages/Orders';
import Agents from './Pages/Agents';
import Payments from './Pages/Payments';
import Production from './Pages/Production';
import Reports from './Pages/Reports';
import Settings from './Pages/Settings';
import AddOrder from './Pages/AddOrder';
import Network from './Pages/Network';  
// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Dashboard Router based on role
const DashboardRouter = () => {
  const { user } = useAuth();

  if (user?.role === 'super_admin') {
    return <SuperAdminDashboard />;
  } else if (user?.role === 'admin') {
    return <AdminDashboard />;
  } else if (user?.role === 'agent') {
    return <AgentDashboard />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          {/* Super Admin Only Routes */}
          <Route
            path="/super-admin/*"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Agent Routes */}
          <Route
            path="/agent/*"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Common Protected Routes */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Customers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-order"
            element={
              <ProtectedRoute>
                <AddOrder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/agents"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Agents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/network"
            element={
              <ProtectedRoute>
                <Network />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/production"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Production />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
