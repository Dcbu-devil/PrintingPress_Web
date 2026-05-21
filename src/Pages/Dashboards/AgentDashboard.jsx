import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AgentDashboard = () => {
  const { user } = useAuth();

  // Mock data
  const monthlyPerformance = [
    { month: 'Jan', orders: 12, commission: 3500 },
    { month: 'Feb', orders: 15, commission: 4200 },
    { month: 'Mar', orders: 18, commission: 5100 },
    { month: 'Apr', orders: 14, commission: 3900 },
    { month: 'May', orders: 22, commission: 6300 },
    { month: 'Jun', orders: 25, commission: 7200 },
  ];

  const commissionBreakdown = [
    { week: 'Week 1', direct: 1200, subAgent: 800 },
    { week: 'Week 2', direct: 1500, subAgent: 950 },
    { week: 'Week 3', direct: 1800, subAgent: 1100 },
    { week: 'Week 4', direct: 2100, subAgent: 1350 },
  ];

  const stats = [
    {
      title: 'Total Commission',
      value: '₹28,200',
      subtitle: 'This month',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'My Orders',
      value: '25',
      subtitle: '+3 this week',
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'Sub-Agents',
      value: '8',
      subtitle: '2 active today',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Conversion Rate',
      value: '68%',
      subtitle: '+5% from last month',
      icon: Target,
      color: 'bg-orange-500',
    },
  ];

  const myOrders = [
    { id: 'ORD-8901', customer: 'ABC Corp', amount: 25000, commission: 1250, status: 'In Production', date: '2024-01-18', subAgent: null },
    { id: 'ORD-8902', customer: 'Tech Solutions', amount: 18000, commission: 900, status: 'Completed', date: '2024-01-17', subAgent: 'Mike Wilson' },
    { id: 'ORD-8903', customer: 'Marketing Hub', amount: 32000, commission: 1600, status: 'Pending', date: '2024-01-16', subAgent: null },
    { id: 'ORD-8904', customer: 'Design Studio', amount: 15000, commission: 750, status: 'Completed', date: '2024-01-15', subAgent: 'Sarah Lee' },
    { id: 'ORD-8905', customer: 'Print Pro', amount: 28000, commission: 1400, status: 'In Production', date: '2024-01-14', subAgent: null },
  ];

  const subAgents = [
    { name: 'Mike Wilson', orders: 12, commission: 3600, status: 'Active', lastActive: '2 hours ago' },
    { name: 'Sarah Lee', orders: 8, commission: 2400, status: 'Active', lastActive: '5 hours ago' },
    { name: 'Tom Brown', orders: 6, commission: 1800, status: 'Inactive', lastActive: '2 days ago' },
    { name: 'Lisa Chen', orders: 10, commission: 3000, status: 'Active', lastActive: '1 hour ago' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'In Production': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout title="Agent Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Hello, {user?.name}! 🚀</h2>
          <p className="text-green-100">Track your orders, commission, and sub-agent performance.</p>
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
                <p className="text-sm text-gray-500">{stat.subtitle}</p>
              </div>
            );
          })}
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Performance */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} name="Orders" />
                <Line yAxisId="right" type="monotone" dataKey="commission" stroke="#10B981" strokeWidth={2} name="Commission (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Commission Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Breakdown (Weekly)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={commissionBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="direct" fill="#3B82F6" name="Direct Orders (5%)" />
                <Bar dataKey="subAgent" fill="#8B5CF6" name="Sub-Agent Orders (2.5%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commission Calculation Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Commission Structure</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Direct Orders (Agent)</p>
                  <p className="text-2xl font-bold text-blue-600">5%</p>
                  <p className="text-xs text-gray-500 mt-1">You earn 5% commission on orders you bring directly</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Sub-Agent Orders</p>
                  <p className="text-2xl font-bold text-purple-600">2.5%</p>
                  <p className="text-xs text-gray-500 mt-1">You earn 2.5% on orders brought by your sub-agents</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Orders & Sub-Agents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Recent Orders</h3>
            <div className="space-y-3">
              {myOrders.map((order) => (
                <div key={order.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{order.id}</span>
                      {order.subAgent && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
                          Sub-Agent: {order.subAgent}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Customer</p>
                      <p className="font-medium text-gray-900">{order.customer}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Order Amount</p>
                      <p className="font-semibold text-gray-900">₹{order.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Your Commission</p>
                      <p className="font-semibold text-green-600">₹{order.commission.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Agents */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Sub-Agents</h3>
            <div className="space-y-3">
              {subAgents.map((agent, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{agent.name}</p>
                    <span className={`w-2 h-2 rounded-full ${
                      agent.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p className="flex justify-between">
                      <span>Orders:</span>
                      <span className="font-medium text-gray-900">{agent.orders}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Commission:</span>
                      <span className="font-semibold text-green-600">₹{agent.commission.toLocaleString()}</span>
                    </p>
                    <p className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      {agent.lastActive}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
              Add Sub-Agent
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
              <ShoppingCart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Create New Order</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Track Orders</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">View Commission</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
