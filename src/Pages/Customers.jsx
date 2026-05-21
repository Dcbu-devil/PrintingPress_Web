import { useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Plus, Edit, Trash2, Mail, Phone, Building, MapPin, MoreVertical } from 'lucide-react';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Mock customer data
  const customers = [
    {
      id: 1,
      name: 'ABC Corporation',
      contactPerson: 'John Doe',
      email: 'john@abccorp.com',
      phone: '+1 (555) 123-4567',
      address: '123 Business St, New York, NY 10001',
      totalOrders: 45,
      totalSpent: 125000,
      status: 'Active',
      joinedDate: '2023-01-15',
    },
    {
      id: 2,
      name: 'XYZ Limited',
      contactPerson: 'Jane Smith',
      email: 'jane@xyzltd.com',
      phone: '+1 (555) 234-5678',
      address: '456 Commerce Ave, Los Angeles, CA 90001',
      totalOrders: 32,
      totalSpent: 98000,
      status: 'Active',
      joinedDate: '2023-02-20',
    },
    {
      id: 3,
      name: 'Tech Solutions Inc',
      contactPerson: 'Mike Johnson',
      email: 'mike@techsol.com',
      phone: '+1 (555) 345-6789',
      address: '789 Tech Park, San Francisco, CA 94102',
      totalOrders: 28,
      totalSpent: 87500,
      status: 'Active',
      joinedDate: '2023-03-10',
    },
    {
      id: 4,
      name: 'Marketing Pro LLC',
      contactPerson: 'Sarah Williams',
      email: 'sarah@marketingpro.com',
      phone: '+1 (555) 456-7890',
      address: '321 Market Rd, Chicago, IL 60601',
      totalOrders: 18,
      totalSpent: 52000,
      status: 'Inactive',
      joinedDate: '2023-04-05',
    },
    {
      id: 5,
      name: 'Design Studio',
      contactPerson: 'Tom Brown',
      email: 'tom@designstudio.com',
      phone: '+1 (555) 567-8901',
      address: '654 Creative Blvd, Miami, FL 33101',
      totalOrders: 22,
      totalSpent: 68000,
      status: 'Active',
      joinedDate: '2023-05-12',
    },
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const AddCustomerModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      // API call to add customer
      console.log('Adding customer:', formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Customer</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="ABC Corporation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Street address, City, State, ZIP"
              ></textarea>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Customer
              </button>
            </div>
          </form>
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Customer
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {customers.filter(c => c.status === 'Active').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-blue-600">
              {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-purple-600">
              ₹{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
            </p>
          </div>
        </div>


        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {customer.address.split(',')[1] || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.contactPerson}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{customer.totalOrders}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-green-600">₹{customer.totalSpent.toLocaleString()}</p>
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
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showAddModal && <AddCustomerModal />}
      </div>
    </DashboardLayout>
  );
};

export default Customers;
