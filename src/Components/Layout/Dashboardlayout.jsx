import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import {
  Printer,
  LayoutDashboard,
  Users,
  ShoppingCart,
  UserCheck,
  CreditCard,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Network,
} from 'lucide-react';

const DashboardLayout = ({ children, title }) => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigationItems = () => {
    if (!user || !user.role) {
      return [];
    }

    const baseItems = [
      {
        name: 'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard',
        roles: ['super_admin', 'admin', 'agent'],
      },
      {
        name: 'Orders',
        icon: ShoppingCart,
        path: '/orders',
        roles: ['super_admin', 'admin', 'agent'],
      },
      {
        name: 'Payments',
        icon: CreditCard,
        path: '/payments',
        roles: ['super_admin', 'admin', 'agent'],
      },
    ];

    const adminItems = [
      {
        name: 'Customers',
        icon: Users,
        path: '/customers',
        roles: ['super_admin', 'admin'],
      },
      {
        name: 'Members',
        icon: UserCheck,
        path: '/agents',
        roles: ['super_admin', 'admin'],
      },
      {
        name: 'Network',
        icon: Network,
        path: '/network',
        roles: ['super_admin', 'admin'],
      },
    ];

    let items = [...baseItems];

    if (user?.role === 'super_admin' || user?.role === 'admin') {
      items = [
        ...baseItems.slice(0, 1),
        ...adminItems,
        ...baseItems.slice(1),
      ];
    } else {
      items = [...baseItems];
    }

    return items.filter((item) => item.roles.includes(user?.role));
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(path + '/')
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex md:fixed md:inset-y-0 bg-gray-900 text-white flex-col transition-all duration-300 z-30 ${
          sidebarCollapsed ? 'md:w-20' : 'md:w-64'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center overflow-hidden">
              <Printer className="w-8 h-8 text-blue-400 flex-shrink-0" />

              {!sidebarCollapsed && (
                <span className="ml-3 text-xl font-bold whitespace-nowrap">
                  PrintPress Pro
                </span>
              )}
            </div>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded hover:bg-gray-700 transition"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center ${
                    sidebarCollapsed ? 'justify-center' : 'justify-start'
                  } px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      !sidebarCollapsed ? 'mr-3' : ''
                    }`}
                  />

                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <div
              className={`flex items-center ${
                sidebarCollapsed ? 'justify-center' : 'justify-start'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>

              {!sidebarCollapsed && (
                <div className="ml-3 flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {user?.name}
                  </p>

                  <p className="text-xs text-gray-400 capitalize">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          ></div>

          <aside className="fixed inset-y-0 left-0 flex flex-col w-64 bg-gray-900 text-white">
            <div className="flex items-center justify-between h-16 px-4 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center">
                <Printer className="w-8 h-8 text-blue-400" />

                <span className="ml-3 text-xl font-bold">
                  PrintPress Pro
                </span>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded hover:bg-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />

                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>

                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{user?.name}</p>

                  <p className="text-xs text-gray-400 capitalize">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>

              <h1 className="text-xl font-semibold text-gray-900">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
                <Bell className="w-6 h-6" />

                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>

                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;