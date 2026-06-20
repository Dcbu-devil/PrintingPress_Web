import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ResetPassword() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    loading: authLoading,
    resetPassword,
    logout,
  } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================================================
  // PAGE PROTECTION
  // ============================================================
  // Only logged-in users with must_reset_password = true
  // should access this page.

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      navigate("/login", {
        replace: true,
      });
      return;
    }

    if (!user.must_reset_password) {
      redirectUserByRole(user);
    }
  }, [authLoading, isAuthenticated, user]);

  // ============================================================
  // ROLE BASED REDIRECT
  // ============================================================

  const getUserRole = (loggedInUser) => {
    return (
      loggedInUser?.role_name ||
      loggedInUser?.role?.name ||
      loggedInUser?.role ||
      null
    );
  };

  const redirectUserByRole = (loggedInUser) => {
    const role = getUserRole(loggedInUser);

    if (role === "super_admin") {
      navigate("/super-admin/dashboard", {
        replace: true,
      });
      return;
    }

    if (role === "admin") {
      navigate("/admin/dashboard", {
        replace: true,
      });
      return;
    }

    if (role === "agent") {
      navigate("/agent/dashboard", {
        replace: true,
      });
      return;
    }

    navigate("/dashboard", {
      replace: true,
    });
  };

  // ============================================================
  // HANDLE RESET PASSWORD
  // ============================================================

  const handleReset = async (e) => {
    e.preventDefault();

    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please enter both password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);

      const result = await resetPassword(newPassword);

      if (!result.success) {
        setError(result.error || "Failed to reset password.");
        return;
      }

      alert("Password reset successfully. Please login again.");

      await logout();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Reset password error:", error);

      setError("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-2">
          Reset Password
        </h1>

        <p className="text-center text-gray-500 mb-6">
          First time login detected. Please create your new password.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>

            <input
              type="password"
              className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError("");
              }}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>

            <input
              type="password"
              className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}