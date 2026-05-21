import { useEffect, useState } from 'react';
import DashboardLayout from '../Components/Layout/Dashboardlayout';
import { Plus, Search, Eye, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPageData = async () => {
    try {
      setLoading(true);

      const [ordersResponse, agentsResponse] = await Promise.all([
        api.get('/orders/'),
        api.get('/agents/'),
      ]);

      setOrders(ordersResponse.data);
      setAgents(agentsResponse.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      alert('Failed to load orders. Please check FastAPI backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const getAgentName = (agentId) => {
    if (!agentId) return 'No Agent';

    const agent = agents.find((item) => item.id === Number(agentId));

    return agent ? agent.name : 'Unknown';
  };

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();

    return (
      order.order_id?.toLowerCase().includes(search) ||
      order.customer_name?.toLowerCase().includes(search) ||
      order.product_name?.toLowerCase().includes(search) ||
      getAgentName(order.direct_agent_id).toLowerCase().includes(search)
    );
  });

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Processing: 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
    };

    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const OrderDetailsModal = ({ order }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-3xl w-full p-6 overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Order Details
            </h2>

            <button
              onClick={() => setSelectedOrder(null)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-semibold">{order.order_id}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-semibold">{order.customer_name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Product</p>
                <p className="font-semibold">{order.product_name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Quantity</p>
                <p className="font-semibold">{order.quantity}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Unit Price</p>
                <p className="font-semibold">₹{order.unit_price}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-bold text-green-600">
                  ₹{Number(order.total_amount || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Printing Cost</p>
                <p className="font-bold text-blue-600">
                  ₹{Number(order.printing_cost || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Created Date</p>
                <p className="font-semibold">{order.created_date || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Delivery Date</p>
                <p className="font-semibold">{order.delivery_date || 'N/A'}</p>
              </div>
            </div>

            <div className="border-t pt-5">
              <h3 className="text-lg font-bold mb-4">
                Dynamic Commission Chain
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Direct Agent</p>
                  <p className="font-bold">
                    {getAgentName(order.direct_agent_id)}
                  </p>
                  <p className="text-xl font-bold text-blue-600 mt-2">
                    ₹
                    {Number(
                      order.final_direct_agent_commission || 0
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Parent Agent</p>
                  <p className="font-bold">
                    {order.parent_agent_id
                      ? getAgentName(order.parent_agent_id)
                      : 'No Parent'}
                  </p>
                  <p className="text-xl font-bold text-green-600 mt-2">
                    ₹{Number(order.parent_commission || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Grandparent Agent</p>
                  <p className="font-bold">
                    {order.grandparent_agent_id
                      ? getAgentName(order.grandparent_agent_id)
                      : 'No Grandparent'}
                  </p>
                  <p className="text-xl font-bold text-purple-600 mt-2">
                    ₹
                    {Number(order.grandparent_commission || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-gray-50 rounded-xl p-4">
                <p>
                  <strong>Total Direct 10% Commission:</strong> ₹
                  {Number(order.direct_agent_commission || 0).toLocaleString()}
                </p>

                <p>
                  <strong>Final Direct Agent Keep:</strong> ₹
                  {Number(
                    order.final_direct_agent_commission || 0
                  ).toLocaleString()}
                </p>

                <p className="text-sm text-gray-600 mt-2">
                  Parent and grandparent commissions are deducted from the
                  direct agent commission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Orders">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Orders Management
            </h2>

            <p className="text-gray-600 mt-1">
              Manage orders from FastAPI backend
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchPageData}
              className="bg-gray-700 text-white px-5 py-3 rounded-xl hover:bg-gray-800 flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>

            <button
              onClick={() => navigate('/add-order')}
              className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Order
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Orders</p>
            <h3 className="text-3xl font-bold mt-2">{orders.length}</h3>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <h3 className="text-3xl font-bold text-green-600 mt-2">
              ₹
              {orders
                .reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
                .toLocaleString()}
            </h3>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pending Orders</p>
            <h3 className="text-3xl font-bold text-yellow-600 mt-2">
              {orders.filter((order) => order.status === 'Pending').length}
            </h3>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Completed Orders</p>
            <h3 className="text-3xl font-bold text-blue-600 mt-2">
              {orders.filter((order) => order.status === 'Completed').length}
            </h3>
          </div>
        </div>

        {/* SEARCH BAR HIDDEN FROM FRONTEND VIEW */}
        <div className="hidden bg-white rounded-xl p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />

            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Direct Agent
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">
                        {order.order_id}
                      </td>

                      <td className="px-6 py-4">{order.customer_name}</td>

                      <td className="px-6 py-4">
                        {getAgentName(order.direct_agent_id)}
                      </td>

                      <td className="px-6 py-4">{order.product_name}</td>

                      <td className="px-6 py-4 font-semibold text-green-600">
                        ₹{Number(order.total_amount || 0).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedOrder && <OrderDetailsModal order={selectedOrder} />}
      </div>
    </DashboardLayout>
  );
};

export default Orders;