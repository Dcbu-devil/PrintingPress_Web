import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Components/Layout/Dashboardlayout';
import api from '../api/api';

const AddOrder = () => {
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    directAgentId: '',
    productName: '',
    deliveryDate: '',
    quantity: '',
    unitPrice: '',
    printingCost: '',
  });

  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoadingAgents(true);
        const response = await api.get('/agents/');
        setAgents(response.data);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
        alert('Failed to load agents. Please check FastAPI backend.');
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

  const getAgentName = (agentId) => {
    if (!agentId) return 'No Agent';

    const agent = agents.find((item) => item.id === Number(agentId));

    return agent ? agent.name : 'Unknown';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.directAgentId) {
      alert('Please select an agent');
      return;
    }

    const payload = {
      customer_name: formData.customerName,
      product_name: formData.productName,
      quantity: Number(formData.quantity),
      unit_price: Number(formData.unitPrice),
      printing_cost: Number(formData.printingCost),
      direct_agent_id: Number(formData.directAgentId),
      delivery_date: formData.deliveryDate,
    };

    try {
      setSubmitting(true);

      const response = await api.post('/orders/', payload);

      setCreatedOrder(response.data);

      alert('Order created successfully');
    } catch (error) {
      console.error('Create order error:', error);
      alert(error.response?.data?.detail || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Create New Order">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900">
              Create New Order
            </h2>

            <p className="text-gray-500 mt-2">
              Select only direct agent. Backend automatically finds parent and
              grandparent.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer *
                </label>

                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerName: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Agent *
                </label>

                <select
                  required
                  value={formData.directAgentId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      directAgentId: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  disabled={loadingAgents}
                >
                  <option value="">
                    {loadingAgents ? 'Loading agents...' : 'Select Agent'}
                  </option>

                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product/Service *
                </label>

                <input
                  type="text"
                  required
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productName: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  placeholder="Business Cards, Banner, Brochure..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Date *
                </label>

                <input
                  type="date"
                  required
                  value={formData.deliveryDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deliveryDate: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity *
                </label>

                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit Price (₹) *
                </label>

                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unitPrice: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  placeholder="10.50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Printing Cost (₹) *
              </label>

              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.printingCost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    printingCost: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3"
                placeholder="Enter printing cost"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl disabled:opacity-60"
              >
                {submitting ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </form>

          {createdOrder && (
            <div className="mt-10 border-t pt-8">
              <h3 className="text-3xl font-bold mb-6">
                Commission Result From Backend
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-xl p-5">
                  <h4 className="text-xl font-bold text-blue-600 mb-4">
                    Direct Agent
                  </h4>

                  <p>
                    <strong>Name:</strong>{' '}
                    {getAgentName(createdOrder.direct_agent_id)}
                  </p>

                  <p>
                    <strong>Total Direct 10%:</strong> ₹
                    {createdOrder.direct_agent_commission}
                  </p>

                  <p>
                    <strong>Final Keep:</strong> ₹
                    {createdOrder.final_direct_agent_commission}
                  </p>
                </div>

                <div className="border rounded-xl p-5">
                  <h4 className="text-xl font-bold text-green-600 mb-4">
                    Parent Agent
                  </h4>

                  <p>
                    <strong>Name:</strong>{' '}
                    {createdOrder.parent_agent_id
                      ? getAgentName(createdOrder.parent_agent_id)
                      : 'No Parent'}
                  </p>

                  <p>
                    <strong>Commission:</strong> ₹
                    {createdOrder.parent_commission}
                  </p>
                </div>

                <div className="border rounded-xl p-5">
                  <h4 className="text-xl font-bold text-purple-600 mb-4">
                    Grandparent Agent
                  </h4>

                  <p>
                    <strong>Name:</strong>{' '}
                    {createdOrder.grandparent_agent_id
                      ? getAgentName(createdOrder.grandparent_agent_id)
                      : 'No Grandparent'}
                  </p>

                  <p>
                    <strong>Commission:</strong> ₹
                    {createdOrder.grandparent_commission}
                  </p>
                </div>

                <div className="border rounded-xl p-5">
                  <h4 className="text-xl font-bold text-orange-600 mb-4">
                    Order Summary
                  </h4>

                  <p>
                    <strong>Order ID:</strong> {createdOrder.order_id}
                  </p>

                  <p>
                    <strong>Customer:</strong> {createdOrder.customer_name}
                  </p>

                  <p>
                    <strong>Product:</strong> {createdOrder.product_name}
                  </p>

                  <p>
                    <strong>Total Amount:</strong> ₹{createdOrder.total_amount}
                  </p>

                  <p>
                    <strong>Printing Cost:</strong> ₹
                    {createdOrder.printing_cost}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => navigate('/orders')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
                >
                  Go To Orders
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddOrder;