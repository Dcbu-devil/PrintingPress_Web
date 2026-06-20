import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

/*
  ============================================================
  AUTH PAGES
  ============================================================
*/

import Login from './Pages/auth/Login';
import Register from './Pages/auth/Register';
import ResetPassword from './Pages/auth/ResetPassword';

/*
  ============================================================
  DASHBOARD PAGES
  ============================================================
*/

import SuperAdminDashboard from './Pages/Dashboards/SuperAdminDashboard';
import AdminDashboard from './Pages/Dashboards/AdminDashboard';
import AgentDashboard from './Pages/Dashboards/AgentDashboard';

/*
  ============================================================
  FEATURE PAGES
  ============================================================
*/

import Customers from './Pages/Customers';
import Orders from './Pages/Orders';
import Agents from './Pages/Agents';
import Payments from './Pages/Payments';
import AddOrder from './Pages/AddOrder';
import Network from './Pages/Network';
import AddMember from './Pages/AddMember';

/*
  ============================================================
  OPTIONAL / FUTURE PAGES
  ============================================================
*/

// import Production from './Pages/Production';
// import Reports from './Pages/Reports';
// import Settings from './Pages/Settings';

/*
  ============================================================
  AUTH CONTEXT
  ============================================================
*/

import { AuthProvider, useAuth } from './context/AuthContext';

/*
  ============================================================
  HELPER: GET ROLE SAFELY
  ============================================================
*/

const getUserRole = (user) => {
  return user?.role_name || user?.role?.name || user?.role || null;
};

/*
  ============================================================
  PROTECTED ROUTE COMPONENT
  ============================================================
*/

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /*
    First-time login rule:
    If backend says must_reset_password = true,
    user must go to reset password page.
  */

  if (user?.must_reset_password) {
    return <Navigate to="/reset-password" replace />;
  }

  const role = getUserRole(user);

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/*
  ============================================================
  RESET PASSWORD PROTECTED ROUTE
  ============================================================
  User must be logged in to reset password.
*/

const ResetPasswordRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /*
    If password already reset, do not show reset page again.
    Send user to correct dashboard.
  */

  if (!user?.must_reset_password) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/*
  ============================================================
  DASHBOARD ROUTER
  ============================================================
*/

const DashboardRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  const role = getUserRole(user);

  if (role === 'super_admin') {
    return <Navigate to="/super-admin/dashboard" replace />;
  }

  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === 'agent') {
    return <Navigate to="/agent/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

/*
  ============================================================
  MAIN APP ROUTING
  ============================================================
*/

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ================================================= */}
          {/* PUBLIC ROUTES */}
          {/* ================================================= */}

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ================================================= */}
          {/* RESET PASSWORD ROUTE */}
          {/* ================================================= */}

          <Route
            path="/reset-password"
            element={
              <ResetPasswordRoute>
                <ResetPassword />
              </ResetPasswordRoute>
            }
          />

          {/* ================================================= */}
          {/* DEFAULT DASHBOARD ROUTES */}
          {/* ================================================= */}

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

          {/* ================================================= */}
          {/* SUPER ADMIN PORTAL ROUTES */}
          {/* ================================================= */}

          <Route
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <Navigate to="/super-admin/dashboard" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ================================================= */}
          {/* ADMIN PORTAL ROUTES */}
          {/* ================================================= */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Navigate to="/admin/dashboard" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['super_admin','admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ================================================= */}
          {/* AGENT / MEMBER PORTAL ROUTES */}
          {/* ================================================= */}

          <Route
            path="/agent"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <Navigate to="/agent/dashboard" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin','agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />

          {/* ================================================= */}
          {/* CUSTOMERS PAGE */}
          {/* ================================================= */}

          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Customers />
              </ProtectedRoute>
            }
          />

          {/* ================================================= */}
          {/* MEMBERS / AGENTS PAGE */}
          {/* ================================================= */}

          <Route
            path="/agents"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Agents />
              </ProtectedRoute>
            }
          />

          {/* ================================================= */}
          {/* NETWORK PAGE */}
          {/* ================================================= */}

          <Route
            path="/network"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Network />
              </ProtectedRoute>
            }
          />

          {/* ================================================= */}
          {/* ORDERS / JOBS PAGE */}
          {/* ================================================= */}

          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'agent']}>
                <Orders />
              </ProtectedRoute>
            }
          />

          {/* ================================================= */}
          {/* ADD JOB PAGE */}
          {/* ================================================= */}

          <Route
            path="/add-order"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'agent']}>
                <AddOrder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-member"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'agent']}>
                <AddMember />
              </ProtectedRoute>
            }
          />

          {/* ================================================= */}
          {/* PAYMENTS / COMMISSIONS PAGE */}
          {/* ================================================= */}

          <Route
            path="/payments"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin','agent']}>
                <Payments />
              </ProtectedRoute>
            }
          />

          {/* ================================================= */}
          {/* PRODUCTION PAGE */}
          {/* ================================================= */}

          {/* <Route
            path="/production"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Production />
              </ProtectedRoute>
            }
          /> */}

          {/* ================================================= */}
          {/* REPORTS PAGE */}
          {/* ================================================= */}

          {/* <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Reports />
              </ProtectedRoute>
            }
          /> */}

          {/* ================================================= */}
          {/* SETTINGS PAGE */}
          {/* ================================================= */}

          {/* <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <Settings />
              </ProtectedRoute>
            }
          /> */}

          {/* ================================================= */}
          {/* CATCH ALL ROUTE */}
          {/* ================================================= */}

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;