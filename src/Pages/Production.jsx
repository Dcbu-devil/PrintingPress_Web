import { useState } from 'react';
import DashboardLayout from '../Components/Layout/Dashboardlayout';
import { Clock, CheckCircle, AlertCircle, Package, TrendingUp } from 'lucide-react';

const Production = () => {
  const [view, setView] = useState('kanban'); // kanban or list

  // Mock production data
  const productionOrders = [
    {
      id: 'ORD-1001',
      customer: 'ABC Corporation',
      product: 'Business Cards',
      quantity: 5000,
      deadline: '2024-01-25',
      status: 'In Production',
      priority: 'High',
      progress: 75,
      assignedTo: 'Machine A',
      estimatedCompletion: '2024-01-24',
    },
    {
      id: 'ORD-1002',
      customer: 'XYZ Limited',
      product: 'Brochures',
      quantity: 2000,
      deadline: '2024-01-28',
      status: 'Pending',
      priority: 'Medium',
      progress: 0,
      assignedTo: null,
      estimatedCompletion: null,
    },
    {
      id: 'ORD-1003',
      customer: 'Tech Solutions Inc',
      product: 'Posters',
      quantity: 500,
      deadline: '2024-01-26',
      status: 'Quality Check',
      priority: 'High',
      progress: 90,
      assignedTo: 'Machine B',
      estimatedCompletion: '2024-01-25',
    },
    {
      id: 'ORD-1004',
      customer: 'Marketing Pro LLC',
      product: 'Flyers',
      quantity: 10000,
      deadline: '2024-01-30',
      status: 'In Production',
      priority: 'Medium',
      progress: 45,
      assignedTo: 'Machine C',
      estimatedCompletion: '2024-01-29',
    },
    {
      id: 'ORD-1005',
      customer: 'Design Studio',
      product: 'Banners',
      quantity: 20,
      deadline: '2024-01-24',
      status: 'Completed',
      priority: 'Low',
      progress: 100,
      assignedTo: 'Machine A',
      estimatedCompletion: '2024-01-23',
    },
  ];

  const stages = {
    'Pending': productionOrders.filter(o => o.status === 'Pending'),
    'In Production': productionOrders.filter(o => o.status === 'In Production'),
    'Quality Check': productionOrders.filter(o => o.status === 'Quality Check'),
    'Completed': productionOrders.filter(o => o.status === 'Completed'),
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-800 border-red-300',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Low': 'bg-green-100 text-green-800 border-green-300',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-500',
      'In Production': 'bg-blue-500',
      'Quality Check': 'bg-purple-500',
      'Completed': 'bg-green-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const ProductionCard = ({ order }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-gray-900">{order.id}</span>
        <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(order.priority)}`}>
          {order.priority}
        </span>
      </div>

      <h4 className="font-medium text-gray-900 mb-1">{order.product}</h4>
      <p className="text-sm text-gray-600 mb-3">{order.customer}</p>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Quantity:</span>
          <span className="font-medium">{order.quantity}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Deadline:</span>
          <span className="font-medium">{new Date(order.deadline).toLocaleDateString()}</span>
        </div>
        {order.assignedTo && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Assigned:</span>
            <span className="font-medium text-blue-600">{order.assignedTo}</span>
          </div>
        )}
      </div>

      {order.status !== 'Pending' && order.status !== 'Completed' && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{order.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getStatusColor(order.status)}`}
              style={{ width: `${order.progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout title="Production Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Production Workflow</h2>
            <p className="text-gray-600 mt-1">Track and manage production stages</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('kanban')}
              className={`px-4 py-2 rounded-lg ${
                view === 'kanban' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg ${
                view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stages['Pending'].length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Production</p>
                <p className="text-2xl font-bold text-gray-900">{stages['In Production'].length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Quality Check</p>
                <p className="text-2xl font-bold text-gray-900">{stages['Quality Check'].length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stages['Completed'].length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stages).map(([stage, orders]) => (
              <div key={stage} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{stage}</h3>
                  <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-700">
                    {orders.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {orders.map(order => (
                    <ProductionCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {productionOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{order.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{order.product}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{order.customer}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{order.quantity}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getStatusColor(order.status)}`}></span>
                        <span className="text-sm font-medium text-gray-900">{order.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getStatusColor(order.status)}`}
                              style={{ width: `${order.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{order.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(order.priority)}`}>
                          {order.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(order.deadline).toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Production Capacity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Capacity</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Machine A</p>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Utilization</span>
                  <span className="font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Machine B</p>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Utilization</span>
                  <span className="font-medium">90%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Machine C</p>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Utilization</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Production;
