import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

/*
  ============================================================
  AUTH CONTEXT FILE
  ============================================================

  Purpose:
  This file manages authentication globally in the frontend.

  It stores:
  1. Logged-in user data
  2. JWT token
  3. Authentication status
  4. Login function
  5. Logout function
  6. User update function

  Earlier:
  Login was using mock frontend users.

  Now:
  Login calls real FastAPI backend:

      POST /api/auth/login

  Backend returns:

      {
        access_token: "jwt_token",
        token_type: "bearer",
        user: {
          id: 1,
          name: "Super Admin",
          email: "super@admin.com",
          role: "super_admin",
          agent_id: null,
          status: "Active"
        }
      }
*/

const AuthContext = createContext(null);

/*
  ============================================================
  useAuth CUSTOM HOOK
  ============================================================

  Purpose:
  This hook allows any component to access auth data.

  Example usage:

      const { user, login, logout, isAuthenticated } = useAuth();

  Important:
  useAuth must be used inside <AuthProvider>.
*/

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

/*
  ============================================================
  AUTH PROVIDER COMPONENT
  ============================================================

  Purpose:
  This component wraps your full app and provides auth data globally.

  Usually used in app.jsx like:

      <AuthProvider>
        <Router>
          ...
        </Router>
      </AuthProvider>
*/

export const AuthProvider = ({ children }) => {
  /*
    user:
    Stores currently logged-in user.

    Example:
    {
      id: 1,
      name: "Super Admin",
      email: "super@admin.com",
      role: "super_admin",
      agent_id: null,
      status: "Active"
    }
  */
  const [user, setUser] = useState(null);

  /*
    isAuthenticated:
    true  -> user is logged in
    false -> user is not logged in
  */
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /*
    loading:
    Used while checking localStorage or during login/logout actions.
  */
  const [loading, setLoading] = useState(true);

  /*
    API_BASE_URL:
    This is only kept for display/debug use.

    Real API calls are handled by:
        ppweb/src/api/api.js

    api.js already contains:
        baseURL = http://127.0.0.1:8000/api
  */
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  /*
    ============================================================
    INITIAL AUTH CHECK
    ============================================================

    This runs once when app starts.

    It checks localStorage:
    - token
    - user

    If both exist:
    - restore user state
    - set isAuthenticated true

    Why:
    So user remains logged in after page refresh.
  */

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        const parsedUser = JSON.parse(userData);

        /*
          Validate important user fields.

          Required:
          - id
          - email
          - role
        */
        if (!parsedUser?.id || !parsedUser?.email || !parsedUser?.role) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        /*
          Optional backend verification:
          We call /auth/me to confirm token is still valid.

          If token is valid:
          backend returns current user.

          If token expired/invalid:
          api.js response interceptor removes token/user.
        */
        try {
          const response = await api.get('/auth/me');

          setUser(response.data);
          setIsAuthenticated(true);

          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Token verification failed:', error);

          localStorage.removeItem('token');
          localStorage.removeItem('user');

          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth restore error:', error);

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  /*
    ============================================================
    LOGIN FUNCTION
    ============================================================

    Purpose:
    Calls backend login API.

    Backend route:
        POST /api/auth/login

    Request body:
        {
          email: "super@admin.com",
          password: "admin123"
        }

    Success response:
        {
          access_token: "...",
          token_type: "bearer",
          user: {...}
        }

    Then we store:
    - token in localStorage
    - user in localStorage
    - user in React state
  */

  const login = async (email, password) => {
    try {
      setLoading(true);

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const accessToken = response.data?.access_token;
      const loggedInUser = response.data?.user;

      if (!accessToken) {
        throw new Error('Access token missing from backend response');
      }

      if (
        !loggedInUser ||
        !loggedInUser.id ||
        !loggedInUser.email ||
        !loggedInUser.role
      ) {
        throw new Error('Invalid user data received from backend');
      }

      /*
        Store JWT token.

        api.js interceptor will automatically add this token
        to every future API request:

            Authorization: Bearer token
      */
      localStorage.setItem('token', accessToken);

      /*
        Store user data for page refresh restore.
      */
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      /*
        Update React state.
      */
      setUser(loggedInUser);
      setIsAuthenticated(true);

      return {
        success: true,
        user: loggedInUser,
      };
    } catch (error) {
      console.error('Login error:', error);

      /*
        Clear old invalid login data.
      */
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      setUser(null);
      setIsAuthenticated(false);

      return {
        success: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          'Login failed',
      };
    } finally {
      setLoading(false);
    }
  };

  /*
    ============================================================
    REGISTER FUNCTION
    ============================================================

    Current status:
    Backend register API is not created yet.

    For business safety:
    Do not allow public registration.

    Later:
    Only Super Admin should create Admin/Agent users.
  */

  const register = async () => {
    return {
      success: false,
      error:
        'Registration is disabled. Super Admin will create users from backend/admin panel later.',
    };
  };

  /*
    ============================================================
    LOGOUT FUNCTION
    ============================================================

    Purpose:
    Logs out current user.

    It removes:
    - token from localStorage
    - user from localStorage
    - user from React state
  */

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);

      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /*
    ============================================================
    UPDATE USER FUNCTION
    ============================================================

    Purpose:
    Updates frontend user state.

    Example:
        updateUser({ name: "Updated Name" })

    It also updates localStorage user.
  */

  const updateUser = (updatedData) => {
    try {
      if (!user) {
        return {
          success: false,
          error: 'No user logged in',
        };
      }

      const updatedUser = {
        ...user,
        ...updatedData,
      };

      if (!updatedUser.id || !updatedUser.email || !updatedUser.role) {
        return {
          success: false,
          error: 'Invalid user data',
        };
      }

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      console.error('Update user error:', error);

      return {
        success: false,
        error: error.message || 'Failed to update user',
      };
    }
  };

  /*
    ============================================================
    REFRESH TOKEN FUNCTION
    ============================================================

    Current status:
    Refresh token API is not created yet.

    For now:
    It checks the current token by calling:

        GET /api/auth/me

    If valid:
    returns true

    If invalid:
    logout user and return false
  */

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        logout();
        return false;
      }

      const response = await api.get('/auth/me');

      setUser(response.data);
      setIsAuthenticated(true);

      localStorage.setItem('user', JSON.stringify(response.data));

      return true;
    } catch (error) {
      console.error('Token refresh/check error:', error);

      logout();

      return false;
    }
  };

  /*
    ============================================================
    CONTEXT VALUE
    ============================================================

    These values and functions are available in all components.

    Example:
        const { user, login, logout } = useAuth();
  */

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    API_BASE_URL,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;