import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Plus, Edit, Trash2, Mail, Phone, Building, MapPin, MoreVertical } from 'lucide-react';
import api from '../api/api';

const Customers = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/');
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const customers = useMemo(() => {
    const customerMap = {};
    orders.forEach((order) => {
      const name = order.customer_name;
      if (!name) return;
      if (!customerMap[name]) {
        customerMap[name] = {
          name: name,
          contactPerson: 'N/A',
          email: 'N/A',
          phone: 'N/A',
          address: 'N/A',
          totalOrders: 0,
          totalSpent: 0,
          status: 'Active',
          joinedDate: order.created_date || 'N/A',
        };
      }
      customerMap[name].totalOrders += 1;
      customerMap[name].totalSpent += Number(order.requirement_total_amount || order.total_amount || 0);
      if (order.created_date && (customerMap[name].joinedDate === 'N/A' || order.created_date < customerMap[name].joinedDate)) {
        customerMap[name].joinedDate = order.created_date;
      }
    });

    return Object.values(customerMap).map((cust, idx) => ({
      id: idx + 1,
      ...cust
    }));
  }, [orders]);

  const handleDeleteCustomer = async (customerName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete customer "${customerName}"? This will delete all jobs/orders associated with this customer from the database.`
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const customerOrders = orders.filter((o) => o.customer_name === customerName);
      await Promise.all(customerOrders.map((order) => api.delete(`/orders/${order.id}`)));
      alert('Customer and all associated jobs deleted successfully');
      await fetchOrders();
    } catch (error) {
      console.error('Failed to delete customer orders:', error);
      alert('Failed to delete customer. Some jobs could not be deleted.');
      await fetchOrders();
    }
  };

  const AddCustomerModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Customer</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Customer profiles are generated automatically from your printing jobs. 
            To add a customer, please create a new job and enter their name.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                navigate('/add-order');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition"
            >
              Go to Add Job
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Customer Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
            <p className="text-gray-600 mt-1">Manage your customer database</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold shadow-sm transition"
          >
            <Plus className="w-5 h-5" />
            Add Customer
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{loading ? '...' : customers.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {loading ? '...' : customers.filter(c => c.status === 'Active').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-blue-600">
              {loading ? '...' : customers.reduce((sum, c) => sum + c.totalOrders, 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-purple-600">
              ₹{loading ? '...' : customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-10 text-center text-gray-500">
                Loading customer records from database...
              </div>
            ) : customers.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                No customers found. Create a new job to add a customer.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{customer.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {customer.address}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.contactPerson}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{customer.totalOrders}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-green-600">₹{customer.totalSpent.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 font-medium">
                          {customer.joinedDate}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteCustomer(customer.name)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-semibold shadow-sm transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {showAddModal && <AddCustomerModal />}
      </div>
    </DashboardLayout>
  );
};

export default Customers;
