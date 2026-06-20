import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

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

/**
 * DashboardLayout Component
 *
 * This is the common layout wrapper for all dashboard pages.
 *
 * Responsibilities:
 * 1. Shows desktop sidebar
 * 2. Shows mobile sidebar
 * 3. Shows top header
 * 4. Shows logged-in user details
 * 5. Handles logout
 * 6. Handles role-based navigation
 * 7. Wraps page content using {children}
 *
 * Used in pages like:
 * - SuperAdminDashboard.jsx
 * - Agents.jsx
 * - Orders.jsx
 * - Network.jsx
 * - Payments.jsx
 *
 * Props:
 * @param {React.ReactNode} children - Page content rendered inside layout
 * @param {string} title - Page title shown in top header
 */
const DashboardLayout = ({ children, title }) => {
  /**
   * AuthContext gives:
   * user    → currently logged-in user
   * logout  → function to logout user
   * loading → auth loading state
   */
  const { user, logout, loading } = useAuth();

  /**
   * React Router hooks
   *
   * navigate  → used to redirect user programmatically
   * location  → used to know current route and highlight active menu
   */
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * UI state
   *
   * sidebarOpen:
   * - true when mobile sidebar is open
   *
   * sidebarCollapsed:
   * - true when desktop sidebar is collapsed
   *
   * profileDropdown:
   * - true when user profile dropdown is open
   */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsDropdown, setNotificationsDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      if (user && (user.role === 'super_admin' || user.role === 'admin')) {
        const response = await api.get('/notifications/');
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  /**
   * Logout Handler
   *
   * Clears auth data using logout()
   * Then redirects user to login page
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Role Based Navigation
   *
   * This function returns sidebar menu items according to user role.
   *
   * Roles:
   * - super_admin
   * - admin
   * - agent
   *
   * Important:
   * Frontend uses "Members" text.
   * Backend/API may still use "agents".
   */
  const getNavigationItems = () => {
    if (!user || !user.role) {
      return [];
    }

    /**
     * Base items are visible to all roles:
     * - Super Admin
     * - Admin
     * - Agent
     */
    const baseItems = [
      {
        name: 'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard',
        roles: ['super_admin', 'admin', 'agent'],
      },
      {
        name: 'Jobs',
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
      {
        name: 'My Member',
        icon: UserCheck,
        path: '/add-member',
        roles: ['agent'],
      },
    ];

    /**
     * Admin items are visible only to:
     * - Super Admin
     * - Admin
     *
     * Customers:
     * - Manage customer records
     *
     * Members:
     * - Manage agents/members
     *
     * Network:
     * - Show Company → Direct Members → Connected Members hierarchy
     */
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

    /**
     * For Super Admin/Admin:
     * Dashboard first,
     * then admin-only items,
     * then Orders and Payments.
     */
    if (user?.role === 'super_admin' || user?.role === 'admin') {
      items = [
        ...baseItems.slice(0, 1),
        ...adminItems,
        ...baseItems.slice(1),
      ];
    } else {
      /**
       * For Agent:
       * Only base items are shown.
       */
      items = [...baseItems];
    }

    /**
     * Final role filtering.
     * This prevents unauthorized menu items from showing.
     */
    return items.filter((item) => item.roles.includes(user?.role));
  };

  const navigationItems = getNavigationItems();

  /**
   * Active Route Checker
   *
   * Used to highlight current active sidebar menu.
   *
   * Example:
   * If current path is /orders, Orders menu becomes blue.
   */
  const isActive = (path) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(path + '/')
    );
  };

  /**
   * Loading Screen
   *
   * Shown while authentication context is checking user status.
   */
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

  /**
   * If user does not exist, render nothing.
   * ProtectedRoute handles redirection separately.
   */
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ============================= */}

      <aside
        className={`hidden md:flex md:fixed md:inset-y-0 bg-gray-900 text-white flex-col transition-all duration-300 z-30 ${
          sidebarCollapsed ? 'md:w-20' : 'md:w-64'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* ============================= */}
          {/* LOGO SECTION */}
          {/* ============================= */}

          <div className="flex items-center justify-between h-16 px-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center overflow-hidden">
              <Printer className="w-8 h-8 text-blue-400 flex-shrink-0" />

              {!sidebarCollapsed && (
                <span className="ml-3 text-xl font-bold whitespace-nowrap">
                  PrintPress Pro
                </span>
              )}
            </div>

            {/* Collapse / Expand Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded hover:bg-gray-700 transition"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* ============================= */}
          {/* DESKTOP NAVIGATION */}
          {/* ============================= */}

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
                  title={sidebarCollapsed ? item.name : ''}
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

          {/* ============================= */}
          {/* DESKTOP USER INFO */}
          {/* ============================= */}

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

      {/* ============================= */}
      {/* MOBILE SIDEBAR */}
      {/* ============================= */}

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          ></div>

          <aside className="fixed inset-y-0 left-0 flex flex-col w-64 bg-gray-900 text-white">
            {/* Mobile Sidebar Header */}
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
                title="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Navigation */}
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

            {/* Mobile User Info */}
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

      {/* ============================= */}
      {/* MAIN CONTENT WRAPPER */}
      {/* ============================= */}

      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* ============================= */}
        {/* TOP HEADER */}
        {/* ============================= */}

        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left Side: Mobile menu button + page title */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
                title="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <h1 className="text-xl font-semibold text-gray-900">
                {title}
              </h1>
            </div>

            {/* Right Side: Notification + Profile */}
            <div className="flex items-center gap-4">
              {/* Notification button */}
              {(user?.role === 'super_admin' || user?.role === 'admin') ? (
                <div className="relative">
                  <button
                    onClick={() => setNotificationsDropdown(!notificationsDropdown)}
                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    title="Notifications"
                  >
                    <Bell className="w-6 h-6" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 min-w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {notificationsDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setNotificationsDropdown(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
                        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                          <span className="font-bold text-gray-700">Costing Requests</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                            {notifications.length} pending
                          </span>
                        </div>

                        <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">
                              All caught up! No pending costing requests.
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => {
                                  setNotificationsDropdown(false);
                                  if (notif.order_id) {
                                    navigate(`/orders?openCosting=${notif.order_id}`);
                                  }
                                }}
                                className="w-full text-left p-4 hover:bg-blue-50/50 transition flex flex-col gap-1 cursor-pointer relative group"
                              >
                                <div className="flex justify-between items-start">
                                  <span className="font-semibold text-gray-900 text-sm">
                                    {notif.title}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-medium font-mono">
                                    {notif.created_date || 'Just now'}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {notif.message}
                                </p>
                                <div className="flex justify-between items-center mt-2">
                                  {notif.order_id ? (
                                    <span className="text-[10px] text-blue-600 font-bold inline-flex items-center gap-1 hover:underline">
                                      Enter Costing →
                                    </span>
                                  ) : (
                                    <span></span>
                                  )}
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        await api.put(`/notifications/${notif.id}/read`);
                                        fetchNotifications();
                                      } catch (error) {
                                        console.error('Failed to mark notification as read:', error);
                                      }
                                    }}
                                    className="text-[11px] text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-800 font-bold px-2 py-1 rounded transition duration-200 border border-red-200"
                                    title="Clear Notification"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  className="relative p-2 text-gray-300 cursor-not-allowed rounded-lg"
                  disabled
                  title="Notifications (Admins only)"
                >
                  <Bell className="w-6 h-6" />
                </button>
              )}

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Profile menu"
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

        {/* ============================= */}
        {/* PAGE CONTENT */}
        {/* ============================= */}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;