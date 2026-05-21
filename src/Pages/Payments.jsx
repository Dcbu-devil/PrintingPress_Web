import { useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Search, Download, Filter, CheckCircle, Clock, XCircle } from 'lucide-react';

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock payment data
  const payments = [
    {
      id: 'PAY-1001',
      orderId: 'ORD-1001',
      customer: 'ABC Corporation',
      agent: 'John Smith',
      subAgent: null,
      orderAmount: 12500,
      agentCommission: 625,
      subAgentCommission: 0,
      paidAmount: 12500,
      paymentDate: '2024-01-20',
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
    },
    {
      id: 'PAY-1002',
      orderId: 'ORD-1002',
      customer: 'XYZ Limited',
      agent: 'Sarah Johnson',
      subAgent: 'Mike Wilson',
      orderAmount: 10000,
      agentCommission: 250,
      subAgentCommission: 250,
      paidAmount: 10000,
      paymentDate: '2024-01-18',
      paymentMethod: 'Credit Card',
      status: 'Paid',
    },
    {
      id: 'PAY-1003',
      orderId: 'ORD-1003',
      customer: 'Tech Solutions Inc',
      agent: 'John Smith',
      subAgent: null,
      orderAmount: 7500,
      agentCommission: 375,
      subAgentCommission: 0,
      paidAmount: 0,
      paymentDate: null,
      paymentMethod: null,
      status: 'Pending',
    },
    {
      id: 'PAY-1004',
      orderId: 'ORD-1004',
      customer: 'Marketing Pro LLC',
      agent: 'Sarah Johnson',
      subAgent: 'Lisa Chen',
      orderAmount: 8000,
      agentCommission: 200,
      subAgentCommission: 200,
      paidAmount: 4000,
      paymentDate: '2024-01-19',
      paymentMethod: 'Bank Transfer',
      status: 'Partial',
    },
    {
      id: 'PAY-1005',
      orderId: 'ORD-1005',
      customer: 'Design Studio',
      agent: 'Emma Davis',
      subAgent: null,
      orderAmount: 5000,
      agentCommission: 250,
      subAgentCommission: 0,
      paidAmount: 5000,
      paymentDate: '2024-01-18',
      paymentMethod: 'Cash',
      status: 'Paid',
    },
  ];

  const filteredPayments = payments.filter(payment =>
    payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Partial': 'bg-blue-100 text-blue-800',
      'Overdue': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Overdue':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const totalRevenue = payments.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalCommissions = payments.reduce((sum, p) => 
    sum + (p.status === 'Paid' ? p.agentCommission + p.subAgentCommission : 0), 0
  );
  const pendingPayments = payments.filter(p => p.status === 'Pending').length;

  return (
    <DashboardLayout title="Payment Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payments & Invoices</h2>
            <p className="text-gray-600 mt-1">Track payments and commission distribution</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Commissions</p>
            <p className="text-2xl font-bold text-blue-600">₹{totalCommissions.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingPayments}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-purple-600">
              {payments.filter(p => p.status === 'Paid').length}
            </p>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{payment.id}</p>
                        <p className="text-xs text-gray-500">Order: {payment.orderId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{payment.customer}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{payment.agent}</p>
                        {payment.subAgent && (
                          <p className="text-xs text-purple-600">Sub: {payment.subAgent}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">₹{payment.orderAmount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-green-600 font-semibold">
                          Agent: ₹{payment.agentCommission.toLocaleString()}
                        </p>
                        {payment.subAgentCommission > 0 && (
                          <p className="text-purple-600 font-semibold">
                            Sub: ₹{payment.subAgentCommission.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-blue-600">₹{payment.paidAmount.toLocaleString()}</p>
                      {payment.status === 'Partial' && (
                        <p className="text-xs text-gray-500">
                          Remaining: ₹{(payment.orderAmount - payment.paidAmount).toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {payment.paymentDate ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">{payment.paymentMethod}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">-</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commission Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Distribution Summary</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 mb-1">Agent Commissions (5% Direct)</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{payments.reduce((sum, p) => sum + (p.status === 'Paid' && !p.subAgent ? p.agentCommission : 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-1">Agent Commissions (2.5% Sub-Agent)</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{payments.reduce((sum, p) => sum + (p.status === 'Paid' && p.subAgent ? p.agentCommission : 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-700 mb-1">Sub-Agent Commissions (2.5%)</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{payments.reduce((sum, p) => sum + (p.status === 'Paid' ? p.subAgentCommission : 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
