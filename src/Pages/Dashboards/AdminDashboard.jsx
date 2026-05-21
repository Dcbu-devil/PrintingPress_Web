import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUp,
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();

  // Mock data
  const productionData = [
    { day: 'Mon', completed: 12, pending: 8, inProgress: 15 },
    { day: 'Tue', completed: 15, pending: 6, inProgress: 12 },
    { day: 'Wed', completed: 18, pending: 5, inProgress: 14 },
    { day: 'Thu', completed: 14, pending: 7, inProgress: 16 },
    { day: 'Fri', completed: 20, pending: 4, inProgress: 10 },
    { day: 'Sat', completed: 16, pending: 3, inProgress: 8 },
  ];

  const dailyRevenueData = [
    { date: '01/15', revenue: 45000 },
    { date: '01/16', revenue: 52000 },
    { date: '01/17', revenue: 48000 },
    { date: '01/18', revenue: 61000 },
    { date: '01/19', revenue: 55000 },
    { date: '01/20', revenue: 67000 },
    { date: '01/21', revenue: 72000 },
  ];

  const stats = [
    {
      title: 'Today\'s Revenue',
      value: '₹72,000',
      change: '+18.2%',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Active Orders',
      value: '45',
      change: '+5 new',
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'In Production',
      value: '28',
      change: '62% capacity',
      icon: Package,
      color: 'bg-orange-500',
    },
    {
      title: 'Completed Today',
      value: '16',
      change: '+3 from yesterday',
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
  ];

  const pendingApprovals = [
    { id: 'ORD-5678', customer: 'ABC Corp', amount: 35000, agent: 'John Smith', type: 'New Order' },
    { id: 'ORD-5679', customer: 'Tech Hub', amount: 28000, agent: 'Sarah Johnson', type: 'Rush Order' },
    { id: 'ORD-5680', customer: 'Print Pro', amount: 42000, agent: 'Mike Williams', type: 'Custom Design' },
  ];

  const productionQueue = [
    { id: 'ORD-5675', customer: 'XYZ Ltd', product: 'Business Cards', quantity: 5000, deadline: '2024-01-22', priority: 'High' },
    { id: 'ORD-5676', customer: 'Marketing Co', product: 'Brochures', quantity: 2000, deadline: '2024-01-23', priority: 'Medium' },
    { id: 'ORD-5677', customer: 'Design Studio', product: 'Posters', quantity: 500, deadline: '2024-01-24', priority: 'Low' },
    { id: 'ORD-5681', customer: 'Event Planners', product: 'Banners', quantity: 10, deadline: '2024-01-22', priority: 'High' },
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Good day, {user?.name}! 🎯</h2>
          <p className="text-purple-100">Manage operations and oversee production efficiently.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-green-600 font-medium">{stat.change}</p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Production Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Production Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
                <Bar dataKey="inProgress" fill="#3B82F6" name="In Progress" />
                <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} name="Revenue (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Approvals & Production Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {pendingApprovals.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{item.id}</span>
                    <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                      {item.type}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm mb-3">
                    <p><span className="text-gray-600">Customer:</span> <span className="font-medium">{item.customer}</span></p>
                    <p><span className="text-gray-600">Agent:</span> <span className="font-medium">{item.agent}</span></p>
                    <p><span className="text-gray-600">Amount:</span> <span className="font-semibold text-green-600">₹{item.amount.toLocaleString()}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-700 transition">
                      Approve
                    </button>
                    <button className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-700 transition">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Production Queue */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Queue</h3>
            <div className="space-y-3">
              {productionQueue.map((item) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{item.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Customer:</span> <span className="font-medium">{item.customer}</span></p>
                    <p><span className="text-gray-600">Product:</span> <span className="font-medium">{item.product}</span></p>
                    <p><span className="text-gray-600">Quantity:</span> <span className="font-medium">{item.quantity}</span></p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600">Deadline:</span>
                      <span className="font-medium">{new Date(item.deadline).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Low Inventory Alert</p>
                <p className="text-sm text-red-700">A4 Paper stock is running low. Only 500 sheets remaining.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Approaching Deadline</p>
                <p className="text-sm text-yellow-700">Order ORD-5675 deadline is in 2 days. Current status: 60% complete.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Performance Update</p>
                <p className="text-sm text-blue-700">Production efficiency increased by 15% this week!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
