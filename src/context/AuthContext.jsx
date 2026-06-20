import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // CHECK CURRENT LOGIN USER
  // ============================================================
  // Cookie-based auth:
  // Browser sends HttpOnly cookie automatically.
  // Backend reads cookie using get_current_user.

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setUser(null);
          setIsAuthenticated(false);
        }
        return Promise.reject(error);
      }
    );
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get("/auth/me");

      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOGIN
  // ============================================================

  const login = async (email, password) => {
    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const userData = response.data.user;

      setUser(userData);
      setIsAuthenticated(true);

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);

      return {
        success: false,
        error:
          error.response?.data?.detail ||
          "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // REGISTER USER
  // ============================================================
  // Backend /api/auth/register returns UserResponse directly.
  // It does not return { user: ... }.

  const register = async (payload) => {
    // NOTE:
    // /api/auth/register is a super_admin-only endpoint.
    // It creates a new user but does NOT log them in.
    // The current logged-in session (super admin cookie) remains unchanged.
    // We do NOT update user/isAuthenticated state here.
    try {
      const response = await api.post(
        "/auth/register",
        payload
      );

      const userData = response.data;

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.detail ||
          "Registration failed",
      };
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // ============================================================
  // UPDATE USER IN CONTEXT
  // ============================================================

  const updateUser = (updatedData) => {
    setUser((prev) => ({
      ...prev,
      ...updatedData,
    }));

    return {
      success: true,
    };
  };

  // ============================================================
  // REFRESH TOKEN
  // ============================================================
  // Backend refresh should reset HttpOnly cookie.

  const refreshToken = async () => {
    try {
      const response = await api.post("/auth/refresh", {});

      if (response.data?.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }

      return true;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);

      return false;
    }
  };

  // ============================================================
  // RESET PASSWORD
  // ============================================================
  // Backend identifies user from HttpOnly cookie.
  // Frontend sends only new_password.

  const resetPassword = async (newPassword) => {
    try {
      const response = await api.post(
        "/auth/reset-password",
        {
          new_password: newPassword,
        }
      );

      const updatedUser = response.data.user;

      if (updatedUser) {
        setUser(updatedUser);
        setIsAuthenticated(true);
      }

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      console.error("Reset password failed:", error);

      return {
        success: false,
        error:
          error.response?.data?.detail ||
          "Password reset failed.",
      };
    }
  };

  // ============================================================
  // RBAC HELPER FUNCTIONS
  // ============================================================

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles = []) => {
    return roles.includes(user?.role);
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const isAgent = () => {
    return user?.role === "agent";
  };

  const isSuperAdmin = () => {
    return user?.role === "super_admin";
  };

  const value = {
    user,
    loading,
    isAuthenticated,

    login,
    register,
    logout,
    updateUser,
    checkAuth,
    refreshToken,
    resetPassword,

    hasRole,
    hasAnyRole,
    isAdmin,
    isAgent,
    isSuperAdmin,
  };

  // Do not render app until initial auth check is complete.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};