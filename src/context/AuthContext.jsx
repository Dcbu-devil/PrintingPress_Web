import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // API Base URL - Update this to your backend URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

useEffect(() => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  if (token && userData) {
    try {
      const parsedUser = JSON.parse(userData);
      
      if (parsedUser && parsedUser.id && parsedUser.role) {
        setUser(parsedUser);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        // ✅ FIX: Don't call logout, just clear storage directly
        console.warn('Invalid user data in localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      // ✅ FIX: Clear storage directly instead of calling logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    }
  }
  setLoading(false);
}, []);

  const login = async (email, password) => {
    try {
      setLoading(true); // ✅ ADD: Set loading during login
      
      // Replace with actual API call
      // const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      
      // Mock login for demonstration
      const mockUsers = [
        { id: 1, name: 'Super Admin', email: 'super@admin.com', role: 'super_admin', password: 'admin123' },
        { id: 2, name: 'Admin User', email: 'admin@company.com', role: 'admin', password: 'admin123' },
        { id: 3, name: 'Agent User', email: 'agent@company.com', role: 'agent', password: 'agent123' },
      ];

      // ✅ ADD: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }

      // ✅ ADD: Validate user object
      if (!foundUser.id || !foundUser.role || !foundUser.email) {
        throw new Error('Invalid user data received');
      }

      const { password: _, ...userWithoutPassword } = foundUser;
      const mockToken = 'mock-jwt-token-' + Date.now();

      // Store in localStorage
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;

      setUser(userWithoutPassword);
      setIsAuthenticated(true);

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false); // ✅ ADD: Reset loading state
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true); // ✅ ADD: Set loading during registration
      
      // ✅ ADD: Validate input data
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('Missing required fields');
      }

      // Replace with actual API call
      // const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      // ✅ ADD: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock registration
      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role || 'agent', // Default role for new registrations
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;

      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    } finally {
      setLoading(false); // ✅ ADD: Reset loading state
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updatedData) => {
    try {
      // ✅ ADD: Validate that user exists before updating
      if (!user) {
        console.error('Cannot update user: No user logged in');
        return { success: false, error: 'No user logged in' };
      }

      const updatedUser = { ...user, ...updatedData };
      
      // ✅ ADD: Ensure critical fields are not removed
      if (!updatedUser.id || !updatedUser.role || !updatedUser.email) {
        console.error('Cannot update user: Missing critical fields');
        return { success: false, error: 'Invalid user data' };
      }

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ ADD: Token refresh function (for when you connect to real API)
  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      // Uncomment when connecting to real API
      // const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { token });
      // const { token: newToken, user: userData } = response.data;
      // localStorage.setItem('token', newToken);
      // localStorage.setItem('user', JSON.stringify(userData));
      // axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      // setUser(userData);
      // setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshToken, // ✅ ADD: Export refresh function
    API_BASE_URL,
  };

  // ✅ ADD: Don't render children until loading is complete (optional)
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};