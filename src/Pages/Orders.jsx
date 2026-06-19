import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Eye,
  X,
  RefreshCw,
  Plus,
  ShoppingCart,
  Trash2,
} from 'lucide-react';

import DashboardLayout from '../Components/Layout/Dashboardlayout';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isAgent = user?.role === 'agent';
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [costingOrder, setCostingOrder] = useState(null);
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

    if (user?.role !== 'agent') {
      fetchAgents();
    }
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      const queryParams = new URLSearchParams(location.search);
      const openCostingId = queryParams.get('openCosting');
      if (openCostingId) {
        const foundOrder = orders.find((o) => o.id === Number(openCostingId));
        if (foundOrder) {
          setCostingOrder(foundOrder);
          // Remove query param from URL without page reload
          navigate('/orders', { replace: true });
        }
      }
    }
  }, [orders, location.search, navigate]);

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
  // DELETE JOB / ORDER
  // =========================

  const handleDeleteOrder = async (order) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete job "${order.order_id}"? This will also delete all associated commission payments and revert member totals.`
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/orders/${order.id}`);
      alert('Job deleted successfully');
      fetchOrders();
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert(error.response?.data?.detail || 'Failed to delete job');
    }
  };

  // =========================
  // FILTER JOBS (Search removed)
  // =========================

  const filteredOrders = orders;

  // =========================
  // JOB DETAILS MODAL
  // =========================

  const OrderDetailsModal = ({ order, onClose }) => {
    const [isEditingQuantity, setIsEditingQuantity] = useState(false);
    const [newQuantity, setNewQuantity] = useState(order.quantity);
    const [updatingQuantity, setUpdatingQuantity] = useState(false);

    if (!order) return null;

    const handleSaveQuantity = async () => {
      const q = Number(newQuantity);
      if (isNaN(q) || q <= 0) {
        alert('Quantity must be a valid number greater than 0');
        return;
      }
      try {
        setUpdatingQuantity(true);
        const response = await api.put(`/orders/${order.id}/quantity`, {
          quantity: q
        });
        alert('Quantity updated successfully');
        setIsEditingQuantity(false);
        setSelectedOrder(response.data);
        fetchOrders();
      } catch (err) {
        console.error('Failed to update quantity:', err);
        alert(err.response?.data?.detail || 'Failed to update quantity');
      } finally {
        setUpdatingQuantity(false);
      }
    };

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
                  {isAgent ? (
                    <span
                      className={`inline-block mt-1 px-3 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  ) : (
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
                  )}
                </div>

                <div className="border rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    {isEditingQuantity ? (
                      <input
                        type="number"
                        min="1"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value)}
                        className="font-bold border rounded px-2 py-1 w-28 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        disabled={updatingQuantity}
                      />
                    ) : (
                      <p className="font-bold">{order.quantity}</p>
                    )}
                  </div>

                  {user?.role === 'super_admin' && (
                    <div>
                      {isEditingQuantity ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveQuantity}
                            disabled={updatingQuantity}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-semibold transition"
                          >
                            {updatingQuantity ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setIsEditingQuantity(false)}
                            disabled={updatingQuantity}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-2.5 py-1.5 rounded-lg font-semibold transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setNewQuantity(order.quantity);
                            setIsEditingQuantity(true);
                          }}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs px-2.5 py-1.5 rounded-lg font-semibold transition"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )}
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

                <div className="flex items-center gap-4">
                  {!isAgent && (
                    <button
                      onClick={() => {
                        setCostingOrder(order);
                        onClose();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      {Number(order.requirement_total_amount || 0) === 0 ? "Enter Costing" : "Edit Costing"}
                    </button>
                  )}

                  <span className="text-2xl font-bold text-blue-600">
                    ₹
                    {Number(
                      order.requirement_total_amount || order.total_amount || 0
                    ).toLocaleString()}
                  </span>
                </div>
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

  const CostingModal = ({ order, onClose, onSuccess }) => {
    const [paperAmount, setPaperAmount] = useState(order.paper_amount || 0);
    const [plateAmount, setPlateAmount] = useState(order.plate_amount || 0);
    const [printingAmount, setPrintingAmount] = useState(order.printing_amount || 0);
    const [laminationAmount, setLaminationAmount] = useState(order.lamination_amount || 0);
    const [bindingAmount, setBindingAmount] = useState(order.binding_amount || 0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setSubmitting(true);
        setError('');
        await api.put(`/orders/${order.id}/costing`, {
          paper_amount: Number(paperAmount),
          plate_amount: Number(plateAmount),
          printing_amount: Number(printingAmount),
          lamination_amount: Number(laminationAmount),
          binding_amount: Number(bindingAmount),
        });
        alert('Costing updated successfully');
        onSuccess();
      } catch (err) {
        console.error('Failed to update costing:', err);
        setError(err.response?.data?.detail || 'Failed to update costing. Please try again.');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full overflow-hidden">
          <div className="flex items-center justify-between border-b p-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Enter Requirement Costing</h2>
              <p className="text-gray-500 text-sm mt-1">Job ID: {order.order_id}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Paper Cost (₹) <span className="text-xs font-normal text-gray-500">({order.paper_type || 'N/A'})</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={paperAmount}
                  onChange={(e) => setPaperAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Plate Cost (₹) <span className="text-xs font-normal text-gray-500">({order.plate_type || 'N/A'})</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={plateAmount}
                  onChange={(e) => setPlateAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Printing Cost (₹) <span className="text-xs font-normal text-gray-500">({order.printing_type || 'N/A'})</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={printingAmount}
                  onChange={(e) => setPrintingAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Lamination Cost (₹) <span className="text-xs font-normal text-gray-500">({order.lamination_type || 'N/A'})</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={laminationAmount}
                  onChange={(e) => setLaminationAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Binding Cost (₹) <span className="text-xs font-normal text-gray-500">({order.binding_type || 'N/A'})</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={bindingAmount}
                  onChange={(e) => setBindingAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50 transition"
              >
                {submitting ? 'Updating...' : 'Submit Costing'}
              </button>
            </div>
          </form>
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
                    {!isAgent && (
                      <th className="px-6 py-4 text-left font-semibold text-gray-600">
                        Delete
                      </th>
                    )}
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
                        {isAgent ? (
                          <span
                            className={`px-3 py-2 rounded-lg text-xs font-semibold border ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        ) : (
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
                        )}
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

                      {!isAgent && (
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                          >
                            <Trash2 size={17} />
                            Delete
                          </button>
                        </td>
                      )}
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

        {costingOrder && (
          <CostingModal
            order={costingOrder}
            onClose={() => setCostingOrder(null)}
            onSuccess={() => {
              setCostingOrder(null);
              fetchOrders();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;