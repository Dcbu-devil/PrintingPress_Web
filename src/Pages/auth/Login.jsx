import { useState , useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Printer, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated,authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let isMounted = true; // Track if component is mounted
    
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (!isMounted) return; // ✅ Don't update state if unmounted

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  // Demo credentials helper
  const fillDemoCredentials = (role) => {
    const credentials = {
      super_admin: { email: 'super@admin.com', password: 'admin123' },
      admin: { email: 'admin@company.com', password: 'admin123' },
      agent: { email: 'agent@company.com', password: 'agent123' },
    };
    setFormData(credentials[role]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
              <Printer className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PrintPress Pro</h1>
          <p className="text-gray-600">Enterprise Printing Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3 text-center">Demo Credentials:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('super_admin')}
                className="text-xs px-2 py-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="text-xs px-2 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('agent')}
                className="text-xs px-2 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition"
              >
                Agent
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>© 2026 PrintPress Pro. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
