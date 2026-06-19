import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Components/Layout/Dashboardlayout';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const AddOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAgent = user?.role === 'agent';

  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const [formData, setFormData] = useState({
    customerName: '',
    directAgentId: '',
    productName: '',
    deliveryDate: '',
    quantity: '',

    paperType: '',
    paperAmount: '',
    plateType: '',
    plateAmount: '',
    printingType: '',
    printingAmount: '',
    laminationType: '',
    laminationAmount: '',
    bindingType: '',
    bindingAmount: '',
  });

  useEffect(() => {
    if (isAgent) {
      if (user) {
        setAgents([{ id: user.agent_id, name: user.name }]);
        setFormData((prev) => ({
          ...prev,
          directAgentId: String(user.agent_id),
        }));
      }
      setLoadingAgents(false);
    } else {
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
    }
  }, [isAgent, user]);

  const getAgentName = (agentId) => {
    if (!agentId) return 'No Agent';

    const agent = agents.find((item) => item.id === Number(agentId));

    return agent ? agent.name : 'Unknown';
  };

  const handleRequirementChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const requirementTotalAmount =
    Number(formData.paperAmount || 0) +
    Number(formData.plateAmount || 0) +
    Number(formData.printingAmount || 0) +
    Number(formData.laminationAmount || 0) +
    Number(formData.bindingAmount || 0);

  const calculatedUnitPrice =
    Number(formData.quantity || 0) > 0
      ? requirementTotalAmount / Number(formData.quantity)
      : 0;

  const calculatedPrintingCost = requirementTotalAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.directAgentId) {
      alert('Please select an agent');
      return;
    }

    if (!isAgent && requirementTotalAmount <= 0) {
      alert('Please enter at least one requirement amount');
      return;
    }

    if (Number(formData.quantity || 0) <= 0) {
      alert('Please enter valid quantity');
      return;
    }

    const payload = {
      customer_name: formData.customerName,
      product_name: formData.productName,
      quantity: Number(formData.quantity),

      unit_price: isAgent ? 0 : Number(calculatedUnitPrice.toFixed(2)),
      total_amount: isAgent ? 0 : Number(requirementTotalAmount.toFixed(2)),
      requirement_total_amount: isAgent ? 0 : Number(requirementTotalAmount.toFixed(2)),

      printing_cost: isAgent ? 0 : Number(calculatedPrintingCost.toFixed(2)),
      direct_agent_id: Number(formData.directAgentId),
      delivery_date: formData.deliveryDate,

      paper_type: formData.paperType,
      paper_amount: isAgent ? 0 : Number(formData.paperAmount || 0),

      plate_type: formData.plateType,
      plate_amount: isAgent ? 0 : Number(formData.plateAmount || 0),

      printing_type: formData.printingType,
      printing_amount: isAgent ? 0 : Number(formData.printingAmount || 0),

      lamination_type: formData.laminationType,
      lamination_amount: isAgent ? 0 : Number(formData.laminationAmount || 0),

      binding_type: formData.bindingType,
      binding_amount: isAgent ? 0 : Number(formData.bindingAmount || 0),
    };

    try {
      setSubmitting(true);

      const response = await api.post('/orders/', payload);

      if (isAgent) {
        alert('Job created and costing request sent to administrator successfully.');
        navigate('/orders');
      } else {
        setCreatedOrder(response.data);
        alert('Job created successfully');
      }
    } catch (error) {
      console.error('Create Job error:', error);
      alert(error.response?.data?.detail || 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Create New Job">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900">
              Create New Job
            </h2>

            <p className="text-gray-500 mt-2">
              {/* Select only direct agent. Backend automatically finds parent and
              grandparent. */}
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
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white disabled:bg-gray-100"
                  disabled={loadingAgents || isAgent}
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

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Job Requirement Costing
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-3 text-left">Requirement</th>
                      <th className="border p-3 text-left">Type</th>
                      {!isAgent && <th className="border p-3 text-left">Amount</th>}
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="border p-3 font-semibold">Paper</td>
                      <td className="border p-3">
                        <input
                          type="text"
                          value={formData.paperType}
                          onChange={(e) =>
                            handleRequirementChange(
                              'paperType',
                              e.target.value
                            )
                          }
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="Example: Art Paper 300 GSM"
                        />
                      </td>
                      {!isAgent && (
                        <td className="border p-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.paperAmount}
                            onChange={(e) =>
                              handleRequirementChange(
                                'paperAmount',
                                e.target.value
                              )
                            }
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="500"
                          />
                        </td>
                      )}
                    </tr>

                    <tr>
                      <td className="border p-3 font-semibold">Plate</td>
                      <td className="border p-3">
                        <input
                          type="text"
                          value={formData.plateType}
                          onChange={(e) =>
                            handleRequirementChange(
                              'plateType',
                              e.target.value
                            )
                          }
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="Example: CTP Plate"
                        />
                      </td>
                      {!isAgent && (
                        <td className="border p-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.plateAmount}
                            onChange={(e) =>
                              handleRequirementChange(
                                'plateAmount',
                                e.target.value
                              )
                            }
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="300"
                          />
                        </td>
                      )}
                    </tr>

                    <tr>
                      <td className="border p-3 font-semibold">Printing</td>
                      <td className="border p-3">
                        <input
                          type="text"
                          value={formData.printingType}
                          onChange={(e) =>
                            handleRequirementChange(
                              'printingType',
                              e.target.value
                            )
                          }
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="Example: 4 Color Offset"
                        />
                      </td>
                      {!isAgent && (
                        <td className="border p-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.printingAmount}
                            onChange={(e) =>
                              handleRequirementChange(
                                'printingAmount',
                                e.target.value
                              )
                            }
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="1500"
                          />
                        </td>
                      )}
                    </tr>

                    <tr>
                      <td className="border p-3 font-semibold">Lamination</td>
                      <td className="border p-3">
                        <input
                          type="text"
                          value={formData.laminationType}
                          onChange={(e) =>
                            handleRequirementChange(
                              'laminationType',
                              e.target.value
                            )
                          }
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="Example: Gloss Lamination"
                        />
                      </td>
                      {!isAgent && (
                        <td className="border p-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.laminationAmount}
                            onChange={(e) =>
                              handleRequirementChange(
                                'laminationAmount',
                                e.target.value
                              )
                            }
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="400"
                          />
                        </td>
                      )}
                    </tr>

                    <tr>
                      <td className="border p-3 font-semibold">Binding</td>
                      <td className="border p-3">
                        <input
                          type="text"
                          value={formData.bindingType}
                          onChange={(e) =>
                            handleRequirementChange(
                              'bindingType',
                              e.target.value
                            )
                          }
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="Example: Perfect Binding"
                        />
                      </td>
                      {!isAgent && (
                        <td className="border p-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.bindingAmount}
                            onChange={(e) =>
                              handleRequirementChange(
                                'bindingAmount',
                                e.target.value
                              )
                            }
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="300"
                          />
                        </td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>

              {isAgent ? (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <span className="font-semibold text-yellow-800 text-sm">
                    Costing and total amounts will be populated by the administrator after submission.
                  </span>
                </div>
              ) : (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between">
                  <span className="font-bold text-gray-700">
                    Total job Amount
                  </span>

                  <span className="text-2xl font-bold text-blue-600">
                    ₹{requirementTotalAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
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

              {!isAgent && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit Price Auto
                    </label>

                    <input
                      type="text"
                      readOnly
                      value={`₹${calculatedUnitPrice.toFixed(2)}`}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Printing Cost Auto
                    </label>

                    <input
                      type="text"
                      readOnly
                      value={`₹${calculatedPrintingCost.toLocaleString()}`}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </>
              )}
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
                {submitting ? 'Creating...' : (isAgent ? 'Create Job & Request Costing' : 'Create Order')}
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
                    <strong>Job ID:</strong> {createdOrder.order_id}
                  </p>

                  <p>
                    <strong>Customer:</strong> {createdOrder.customer_name}
                  </p>

                  <p>
                    <strong>Product:</strong> {createdOrder.product_name}
                  </p>

                  <p>
                    <strong>Total Amount:</strong> ₹
                    {Number(
                      createdOrder.requirement_total_amount ||
                        createdOrder.total_amount ||
                        0
                    ).toLocaleString()}
                  </p>

                  <p>
                    <strong>Unit Price:</strong> ₹
                    {Number(createdOrder.unit_price || 0).toFixed(2)}
                  </p>

                  <p>
                    <strong>Printing Cost:</strong> ₹
                    {Number(createdOrder.printing_cost || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => navigate('/orders')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
                >
                  Go To Jobs
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