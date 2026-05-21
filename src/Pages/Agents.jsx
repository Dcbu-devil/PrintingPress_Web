import { useEffect, useState } from 'react';
import DashboardLayout from '../Components/Layout/Dashboardlayout';

import {
  Search,
  Eye,
  X,
  RefreshCw,
  Plus,
  Users,
  Edit,
  Trash2,
} from 'lucide-react';

import api from '../api/api';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [editingAgent, setEditingAgent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/agents/');
      setAgents(response.data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      alert('Failed to load members. Please check FastAPI backend.');
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    await fetchAgents();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const filteredAgents = agents.filter((agent) => {
    const search = searchTerm.toLowerCase();

    return (
      agent.name?.toLowerCase().includes(search) ||
      agent.email?.toLowerCase().includes(search) ||
      agent.code?.toLowerCase().includes(search) ||
      agent.phone?.toLowerCase().includes(search)
    );
  });

  const getParentName = (parentId) => {
    if (!parentId) return 'No Parent';
    const parent = agents.find((agent) => agent.id === Number(parentId));
    return parent?.name || 'Unknown';
  };

  const getChildrenCount = (agentId) => {
    return agents.filter((agent) => agent.parent_agent_id === agentId).length;
  };

  const getTotalPayment = (agent) => {
    return Number(
      agent.total_payment ??
        agent.total_commission ??
        agent.paid_amount ??
        0
    );
  };

  const getPendingPayment = (agent) => {
    return Number(
      agent.total_pending_payment ??
        agent.pending_payment ??
        agent.unpaid_amount ??
        0
    );
  };

  const totalPayment = agents.reduce(
    (sum, agent) => sum + getTotalPayment(agent),
    0
  );

  const totalOrders = agents.reduce(
    (sum, agent) => sum + Number(agent.total_orders || 0),
    0
  );

  const handleDeleteMember = async (agent) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${agent.name}?`
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/agents/${agent.id}`);
      alert('Member deleted successfully');
      await refreshAll();
    } catch (error) {
      console.error('Delete member failed:', error);
      alert(
        error.response?.data?.detail ||
          'Delete failed. Please check backend DELETE API.'
      );
    }
  };

  const AddAgentModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      address: '',
      parent_agent_id: '',
      status: 'Active',
      joined_date: new Date().toISOString().slice(0, 10),
    });

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        parent_agent_id: formData.parent_agent_id
          ? Number(formData.parent_agent_id)
          : null,
        status: formData.status,
        joined_date: formData.joined_date,
      };

      try {
        setSubmitting(true);
        await api.post('/agents/', payload);

        alert('Member added successfully');
        setShowAddModal(false);
        await refreshAll();
      } catch (error) {
        console.error('Add member failed:', error);
        alert(error.response?.data?.detail || 'Failed to add member');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative">
          <button
            onClick={() => setShowAddModal(false)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold mb-2">Add New Member</h2>

          <p className="text-gray-500 mb-5">
            Member code will be generated automatically like AG001, AG002, AG003.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Full Name *
                </label>

                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Enter member name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email *
                </label>

                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="member@example.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Phone
                </label>

                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Address
                </label>

                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Hired By / Parent Member
              </label>

              <select
                value={formData.parent_agent_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parent_agent_id: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="">No Parent / Root Member</option>

                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.code} - {agent.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Status
                </label>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Joined Date
                </label>

                <input
                  type="date"
                  value={formData.joined_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      joined_date: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              Only parent-child hiring relationship is stored. No fixed senior,
              junior, or sub-member role is created.
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="border px-5 py-2 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditAgentModal = ({ agent }) => {
    const [formData, setFormData] = useState({
      name: agent.name || '',
      email: agent.email || '',
      phone: agent.phone || '',
      address: agent.address || '',
      parent_agent_id: agent.parent_agent_id || '',
      status: agent.status || 'Active',
      joined_date: agent.joined_date || '',
    });

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        parent_agent_id: formData.parent_agent_id
          ? Number(formData.parent_agent_id)
          : null,
        status: formData.status,
        joined_date: formData.joined_date,
      };

      try {
        setSubmitting(true);
        await api.put(`/agents/${agent.id}`, payload);

        alert('Member updated successfully');
        setEditingAgent(null);
        await refreshAll();
      } catch (error) {
        console.error('Edit member failed:', error);
        alert(
          error.response?.data?.detail ||
            'Edit failed. Please check backend PUT API.'
        );
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative">
          <button
            onClick={() => setEditingAgent(null)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold mb-2">Edit Member</h2>

          <p className="text-gray-500 mb-5">
            Member ID: <strong>{agent.code}</strong>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Full Name *
                </label>

                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email *
                </label>

                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Phone
                </label>

                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Address
                </label>

                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Hired By / Parent Member
              </label>

              <select
                value={formData.parent_agent_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parent_agent_id: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="">No Parent / Root Member</option>

                {agents
                  .filter((item) => item.id !== agent.id)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code} - {item.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Status
                </label>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Joined Date
                </label>

                <input
                  type="date"
                  value={formData.joined_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      joined_date: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setEditingAgent(null)}
                className="border px-5 py-2 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
              >
                {submitting ? 'Updating...' : 'Update Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const AgentDetailsModal = ({ agent }) => {
    if (!agent) return null;

    const connectedAgents = agents.filter(
      (item) => item.parent_agent_id === agent.id
    );

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
          <button
            onClick={() => setSelectedAgent(null)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold mb-6">Member Details</h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <p className="text-sm text-gray-500">Member Id</p>
              <p className="font-semibold">{agent.code || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Member Name</p>
              <p className="font-semibold">{agent.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">{agent.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-semibold">{agent.phone || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-semibold">{agent.address || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Hired By</p>
              <p className="font-semibold">
                {getParentName(agent.parent_agent_id)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="font-semibold">{agent.total_orders || 0}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Payment</p>
              <p className="font-semibold text-green-600">
                ₹{getTotalPayment(agent).toLocaleString()}
              </p>
              <p className="text-xs text-red-500">
                Pending: ₹{getPendingPayment(agent).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Printing Revenue</p>
              <p className="font-semibold text-blue-600">
                ₹{Number(agent.printing_revenue || 0).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold">{agent.status || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Joined Date</p>
              <p className="font-semibold">{agent.joined_date || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Connected Members</p>
              <p className="font-semibold">{connectedAgents.length}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Members">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Members</h2>

            <p className="text-gray-600 mt-2">
              Dynamic parent-child member system from FastAPI backend
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={refreshAll}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          </div>
        </div>

        {/* SEARCH BAR HIDDEN */}
        <div className="hidden bg-white rounded-xl shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
            />
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-gray-500 text-sm">Total Members</p>
            <h2 className="text-3xl font-bold mt-2">{agents.length}</h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-gray-500 text-sm">Active Members</p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {agents.filter((agent) => agent.status === 'Active').length}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-gray-500 text-sm">Total Orders</p>
            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              {totalOrders}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-gray-500 text-sm">Total Payment</p>
            <h2 className="text-3xl font-bold text-purple-600 mt-2">
              ₹{totalPayment.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              All Members
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4">Member Id</th>
                  <th className="text-left p-4">Member name</th>
                  <th className="text-left p-4">Total orders</th>
                  <th className="text-left p-4">
                    Total payment
                    <span className="block text-xs font-normal text-gray-500">
                      Total pendingpayment
                    </span>
                  </th>
                  <th className="text-left p-4">Connected members</th>
                  <th className="text-left p-4">Action</th>
                  <th className="text-left p-4">Edit</th>
                  <th className="text-left p-4">Delete</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
                      Loading members...
                    </td>
                  </tr>
                ) : filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
                      No members found. Click Add Member to create one.
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => (
                    <tr key={agent.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-semibold text-gray-900">
                        {agent.code || `MEM-${agent.id}`}
                      </td>

                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {agent.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {agent.email}
                          </p>

                          <p className="text-xs text-gray-400">
                            Phone: {agent.phone || 'N/A'}
                          </p>
                        </div>
                      </td>

                      <td className="p-4 font-semibold">
                        {agent.total_orders || 0}
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-green-600">
                          ₹{getTotalPayment(agent).toLocaleString()}
                        </p>

                        <p className="text-xs text-red-500">
                          Pending: ₹{getPendingPayment(agent).toLocaleString()}
                        </p>
                      </td>

                      <td className="p-4 font-semibold">
                        {getChildrenCount(agent.id)}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => setSelectedAgent(agent)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => setEditingAgent(agent)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteMember(agent)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedAgent && <AgentDetailsModal agent={selectedAgent} />}

        {editingAgent && <EditAgentModal agent={editingAgent} />}

        {showAddModal && <AddAgentModal />}
      </div>
    </DashboardLayout>
  );
};

export default Agents;