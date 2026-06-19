import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Printer, LogIn, AlertCircle } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

/*
  ============================================================
  LOGIN PAGE
  ============================================================

  Purpose:
  This page allows all users to login:

  1. Super Admin
  2. Admin
  3. Agent / Member

  After successful login:

  If must_reset_password = true:
  -> /reset-password

  Otherwise role based redirect:

  super_admin -> /super-admin/dashboard
  admin       -> /admin/dashboard
  agent       -> /agent/dashboard

  Backend API used:
  POST /api/auth/login

  Auth style:
  Cookie-based auth using HttpOnly cookie.
  No localStorage token is used.
*/

const Login = () => {
  const navigate = useNavigate();

  const {
    login,
    user,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /*
    ============================================================
    GET USER ROLE SAFELY
    ============================================================
  */

  const getUserRole = (loggedInUser) => {
    return (
      loggedInUser?.role_name ||
      loggedInUser?.role?.name ||
      loggedInUser?.role ||
      null
    );
  };

  /*
    ============================================================
    ROLE BASED REDIRECT HELPER
    ============================================================
  */

  const redirectUserByRole = (loggedInUser) => {
    if (!loggedInUser) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // First-time password reset condition.
    if (loggedInUser?.must_reset_password) {
      navigate("/reset-password", { replace: true });
      return;
    }

    const role = getUserRole(loggedInUser);

    if (role === "super_admin") {
      navigate("/super-admin/dashboard", { replace: true });
      return;
    }

    if (role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    if (role === "agent") {
      navigate("/agent/dashboard", { replace: true });
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  /*
    ============================================================
    REDIRECT IF ALREADY AUTHENTICATED
    ============================================================
  */

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      redirectUserByRole(user);
    }
  }, [isAuthenticated, authLoading, user]);

  /*
    ============================================================
    HANDLE INPUT CHANGE
    ============================================================
  */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  /*
    ============================================================
    HANDLE LOGIN SUBMIT
    ============================================================
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await login(
        formData.email,
        formData.password
      );

      if (result.success) {
        const loggedInUser = result.user || user;

        redirectUserByRole(loggedInUser);
      } else {
        setError(
          result.error ||
          "Login failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Login page error:", error);
      setError("Something went wrong during login.");
    } finally {
      setLoading(false);
    }
  };

  /*
    ============================================================
    DEMO CREDENTIALS HELPER
    ============================================================
  */

  const fillDemoCredentials = (role) => {
    const credentials = {
      super_admin: {
        email: "super@admin.com",
        password: "admin123",
      },
      admin: {
        email: "admin@company.com",
        password: "admin123",
      },
      agent: {
        email: "agent@company.com",
        password: "agent123",
      },
    };

    setFormData(credentials[role]);
    setError("");
  };

  /*
    ============================================================
    UI
    ============================================================
  */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* LOGO AND TITLE */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
              <Printer className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PrintPress Pro
          </h1>

          <p className="text-gray-600">
            Enterprise Printing Management System
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>

            <p className="text-gray-600">
              Sign in to your account
            </p>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />

              <p className="text-sm text-red-800">
                {error}
              </p>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="you@company.com"
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
        {/* FOOTER */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>© 2026 PrintPress Pro. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;