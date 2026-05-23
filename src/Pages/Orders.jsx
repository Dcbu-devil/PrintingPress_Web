import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  X,
  RefreshCw,
  Plus,
  ShoppingCart,
} from 'lucide-react';

import DashboardLayout from '../Components/Layout/Dashboardlayout';
import api from '../api/api';

const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH JOBS / ORDERS
  // =========================

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get('/orders/');

      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      alert('Failed to load jobs. Please check backend.');
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH MEMBERS / AGENTS
  // =========================

  const fetchAgents = async () => {
    try {
      const response = await api.get('/agents/');

      setAgents(response.data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAgents();
  }, []);

  // =========================
  // GET MEMBER NAME
  // =========================

  const getAgentName = (agentId) => {
    if (!agentId) return 'N/A';

    const agent = agents.find((item) => item.id === Number(agentId));

    return agent ? agent.name : 'Unknown';
  };

  // =========================
  // STATUS COLORS
  // =========================

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Running: 'bg-blue-100 text-blue-800 border-blue-300',
      Completed: 'bg-green-100 text-green-800 border-green-300',
    };

    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // =========================
  // UPDATE STATUS FROM DROPDOWN
  // =========================

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? response.data : order
        )
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(response.data);
      }

      alert('Job status updated successfully');
    } catch (error) {
      console.error('Status update error:', error);
      alert(error.response?.data?.detail || 'Failed to update job status');
    }
  };

  // =========================
  // FILTER JOBS
  // =========================

  const filteredOrders = orders.filter((order) => {
    const searchValue = searchTerm.toLowerCase();

    return (
      order.order_id?.toLowerCase().includes(searchValue) ||
      order.customer_name?.toLowerCase().includes(searchValue) ||
      order.product_name?.toLowerCase().includes(searchValue) ||
      order.status?.toLowerCase().includes(searchValue)
    );
  });

  // =========================
  // JOB DETAILS MODAL
  // =========================

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b p-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Job Details
              </h2>

              <p className="text-gray-500 mt-1">
                {order.order_id}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={22} />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* BASIC JOB DETAILS */}
            <div>
              <h3 className="text-lg font-bold mb-4">
                Basic Information
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Job ID</p>
                  <p className="font-bold">{order.order_id}</p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-bold">{order.customer_name}</p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="font-bold">{order.product_name}</p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className={`mt-1 px-3 py-2 rounded-lg text-sm font-semibold border outline-none cursor-pointer ${getStatusColor(
                      order.status
                    )}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Running">Running</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-bold">{order.quantity}</p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Delivery Date</p>
                  <p className="font-bold">{order.delivery_date || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* REQUIREMENT COSTING TABLE */}
            <div>
              <h3 className="text-lg font-bold mb-4">
                Job Requirement Costing
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-3 text-left"></th>
                      <th className="border p-3 text-left">Paper</th>
                      <th className="border p-3 text-left">Plate</th>
                      <th className="border p-3 text-left">Printing</th>
                      <th className="border p-3 text-left">Lamination</th>
                      <th className="border p-3 text-left">Binding</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="border p-3 font-semibold bg-gray-50">
                        Type
                      </td>

                      <td className="border p-3">
                        {order.paper_type || 'N/A'}
                      </td>

                      <td className="border p-3">
                        {order.plate_type || 'N/A'}
                      </td>

                      <td className="border p-3">
                        {order.printing_type || 'N/A'}
                      </td>

                      <td className="border p-3">
                        {order.lamination_type || 'N/A'}
                      </td>

                      <td className="border p-3">
                        {order.binding_type || 'N/A'}
                      </td>
                    </tr>

                    <tr>
                      <td className="border p-3 font-semibold bg-gray-50">
                        Amount
                      </td>

                      <td className="border p-3">
                        ₹{Number(order.paper_amount || 0).toLocaleString()}
                      </td>

                      <td className="border p-3">
                        ₹{Number(order.plate_amount || 0).toLocaleString()}
                      </td>

                      <td className="border p-3">
                        ₹{Number(order.printing_amount || 0).toLocaleString()}
                      </td>

                      <td className="border p-3">
                        ₹{Number(order.lamination_amount || 0).toLocaleString()}
                      </td>

                      <td className="border p-3">
                        ₹{Number(order.binding_amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex justify-between items-center">
                <span className="font-bold text-gray-700">
                  Total Job Amount
                </span>

                <span className="text-2xl font-bold text-blue-600">
                  ₹
                  {Number(
                    order.requirement_total_amount || order.total_amount || 0
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {/* MEMBER AND COMMISSION DETAILS */}
            <div>
              <h3 className="text-lg font-bold mb-4">
                Member & Commission Details
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Direct Member</p>
                  <p className="font-bold">
                    {getAgentName(order.direct_agent_id)}
                  </p>

                  <p className="text-sm text-gray-500 mt-3">
                    Final Commission
                  </p>
                  <p className="font-bold text-blue-600">
                    ₹
                    {Number(
                      order.final_direct_agent_commission || 0
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Parent Member</p>
                  <p className="font-bold">
                    {order.parent_agent_id
                      ? getAgentName(order.parent_agent_id)
                      : 'No Parent'}
                  </p>

                  <p className="text-sm text-gray-500 mt-3">
                    Commission
                  </p>
                  <p className="font-bold text-green-600">
                    ₹{Number(order.parent_commission || 0).toLocaleString()}
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Grandparent Member</p>
                  <p className="font-bold">
                    {order.grandparent_agent_id
                      ? getAgentName(order.grandparent_agent_id)
                      : 'No Grandparent'}
                  </p>

                  <p className="text-sm text-gray-500 mt-3">
                    Commission
                  </p>
                  <p className="font-bold text-purple-600">
                    ₹
                    {Number(
                      order.grandparent_commission || 0
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* AMOUNT SUMMARY */}
            <div>
              <h3 className="text-lg font-bold mb-4">
                Amount Summary
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-blue-600">
                    ₹{Number(order.total_amount || 0).toLocaleString()}
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Requirement Total</p>
                  <p className="text-xl font-bold text-green-600">
                    ₹
                    {Number(
                      order.requirement_total_amount || 0
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Printing Cost</p>
                  <p className="text-xl font-bold text-orange-600">
                    ₹{Number(order.printing_cost || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t p-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Jobs">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Jobs
            </h1>

            <p className="text-gray-500 mt-1">
              Manage all printing jobs, status, costing, and commission details.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 border border-gray-300 px-4 py-3 rounded-xl hover:bg-gray-100"
            >
              <RefreshCw size={18} />
              Refresh
            </button>

            <button
              onClick={() => navigate('/add-order')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
            >
              <Plus size={18} />
              Add Job
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="hidden bg-white rounded-xl p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jobs..."
              className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Job List
              </h2>

              <p className="text-gray-500 text-sm">
                Total Jobs: {filteredOrders.length}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading jobs...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No jobs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-600">
                      Job ID
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-gray-600">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-gray-600">
                      Product
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-gray-600">
                      Member
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-gray-600">
                      Total Amount
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-gray-600">
                      Delivery Date
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {order.order_id}
                      </td>

                      <td className="px-6 py-4">
                        {order.customer_name}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 font-semibold hover:underline"
                        >
                          {order.product_name}
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        {getAgentName(order.direct_agent_id)}
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        ₹
                        {Number(
                          order.requirement_total_amount ||
                            order.total_amount ||
                            0
                        ).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          className={`px-3 py-2 rounded-lg text-xs font-semibold border outline-none cursor-pointer ${getStatusColor(
                            order.status
                          )}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Running">Running</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        {order.delivery_date || 'N/A'}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          <Eye size={17} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;