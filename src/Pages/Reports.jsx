import { useState } from 'react';
import DashboardLayout from '../Components/Layout/Dashboardlayout';
import { Download, Calendar, TrendingUp, DollarSign, Users, ShoppingCart } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const [dateRange, setDateRange] = useState('month');

  // Mock data
  const salesData = [
    { month: 'Jan', revenue: 45000, orders: 120, commissions: 2250 },
    { month: 'Feb', revenue: 52000, orders: 145, commissions: 2600 },
    { month: 'Mar', revenue: 48000, orders: 130, commissions: 2400 },
    { month: 'Apr', revenue: 61000, orders: 165, commissions: 3050 },
    { month: 'May', revenue: 55000, orders: 150, commissions: 2750 },
    { month: 'Jun', revenue: 67000, orders: 180, commissions: 3350 },
  ];

  const agentPerformance = [
    { name: 'John Smith', orders: 45, revenue: 125000, commission: 6250 },
    { name: 'Sarah Johnson', orders: 38, revenue: 98000, commission: 4900 },
    { name: 'Emma Davis', orders: 28, revenue: 72000, commission: 3600 },
    { name: 'Mike Williams', orders: 32, revenue: 85000, commission: 4250 },
  ];

  const productMix = [
    { name: 'Business Cards', value: 35, color: '#3B82F6' },
    { name: 'Brochures', value: 25, color: '#10B981' },
    { name: 'Posters', value: 20, color: '#F59E0B' },
    { name: 'Flyers', value: 15, color: '#8B5CF6' },
    { name: 'Banners', value: 5, color: '#EF4444' },
  ];

  const commissionBreakdown = [
    { type: 'Direct Orders (5%)', amount: 15000 },
    { type: 'Sub-Agent Orders (2.5%)', amount: 7500 },
  ];

  return (
    <DashboardLayout title="Reports & Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
            <p className="text-gray-600 mt-1">Comprehensive business insights and data analysis</p>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium">+12.5%</span>
            </div>
            <p className="text-sm opacity-90 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold">₹3,28,000</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium">+8.3%</span>
            </div>
            <p className="text-sm opacity-90 mb-1">Total Orders</p>
            <p className="text-3xl font-bold">890</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium">+5.2%</span>
            </div>
            <p className="text-sm opacity-90 mb-1">Active Agents</p>
            <p className="text-3xl font-bold">156</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium">+15.8%</span>
            </div>
            <p className="text-sm opacity-90 mb-1">Commissions Paid</p>
            <p className="text-3xl font-bold">₹22,500</p>
          </div>
        </div>

        {/* Sales Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales & Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} name="Revenue (₹)" />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={3} name="Orders" />
              <Line yAxisId="left" type="monotone" dataKey="commissions" stroke="#8B5CF6" strokeWidth={2} name="Commissions (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Performance & Product Mix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Performance */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Agent Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue (₹)" />
                <Bar dataKey="commission" fill="#10B981" name="Commission (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Product Mix */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Mix</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productMix}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commission Analysis */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Analysis</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={commissionBreakdown} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="type" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#8B5CF6" name="Amount (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Direct Orders Commission (5%)</h4>
                <p className="text-3xl font-bold text-blue-600">₹15,000</p>
                <p className="text-sm text-blue-700 mt-1">From 300 direct orders</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Sub-Agent Orders Commission (2.5%)</h4>
                <p className="text-3xl font-bold text-purple-600">₹7,500</p>
                <p className="text-sm text-purple-700 mt-1">From 200 sub-agent orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Reports Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Performance Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Direct Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sub-Agent Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission Earned</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {agentPerformance.map((agent, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{agent.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{agent.orders}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{Math.floor(agent.orders * 0.6)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{Math.floor(agent.orders * 0.4)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">₹{agent.revenue.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-green-600">₹{agent.commission.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {(65 + Math.random() * 15).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Average Order Value</h4>
            <p className="text-3xl font-bold text-gray-900">₹3,685</p>
            <p className="text-sm text-green-600 mt-2">↑ 8.2% from last period</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Customer Retention Rate</h4>
            <p className="text-3xl font-bold text-gray-900">78.5%</p>
            <p className="text-sm text-green-600 mt-2">↑ 3.1% from last period</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Average Commission Rate</h4>
            <p className="text-3xl font-bold text-gray-900">3.8%</p>
            <p className="text-sm text-gray-500 mt-2">Based on order mix</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;

