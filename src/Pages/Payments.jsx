import { useEffect, useState } from 'react';
import DashboardLayout from '../Components/Layout/Dashboardlayout';

import {
  Download,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  RefreshCw,
  Search,
  Save,
} from 'lucide-react';

import api from '../api/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [paymentInputs, setPaymentInputs] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // =========================
  // FETCH COMMISSION PAYMENTS
  // =========================

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const response = await api.get('/payments/');

      const paymentData = Array.isArray(response.data) ? response.data : [];

      setPayments(paymentData);

      const initialInputs = {};

      paymentData.forEach((payment) => {
        initialInputs[payment.id] = payment.paid_amount ?? 0;
      });

      setPaymentInputs(initialInputs);
    } catch (error) {
      console.error('Failed to fetch commission payments:', error);
      alert(error.response?.data?.detail || 'Failed to load commission payments. Please check backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // =========================
  // STATUS HELPERS
  // =========================

  const getStatusColor = (status) => {
    const colors = {
      Paid: 'bg-green-100 text-green-800 border-green-300',
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Partial: 'bg-blue-100 text-blue-800 border-blue-300',
      Overdue: 'bg-red-100 text-red-800 border-red-300',
    };

    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Partial':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'Overdue':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  // =========================
  // PAYMENT INPUT CHANGE
  // =========================

  const handlePaymentInputChange = (paymentId, value, commissionAmount) => {
    // Allow user to clear the input while typing
    if (value === '') {
      setPaymentInputs({
        ...paymentInputs,
        [paymentId]: '',
      });
      return;
    }

    const typedAmount = Number(value);
    const maxAmount = Number(commissionAmount || 0);

    if (Number.isNaN(typedAmount)) {
      alert('Please enter a valid number');
      return;
    }

    if (typedAmount < 0) {
      alert('Payment amount cannot be negative');
      return;
    }

    if (typedAmount > maxAmount) {
      alert(
        `Payment amount cannot exceed commission amount ₹${maxAmount.toLocaleString()}`
      );
      return;
    }

    setPaymentInputs({
      ...paymentInputs,
      [paymentId]: value,
    });
  };

  // =========================
  // SAVE PAYMENT TO BACKEND
  // =========================

  const handleSavePayment = async (payment) => {
    const paymentDbId = payment.id;
    const typedAmount = Number(paymentInputs[paymentDbId] || 0);
    const commissionAmount = Number(payment.commission_amount || 0);

    if (Number.isNaN(typedAmount)) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (typedAmount < 0) {
      alert('Payment amount cannot be negative');
      return;
    }

    if (typedAmount > commissionAmount) {
      alert(
        `Payment amount cannot exceed commission amount ₹${commissionAmount.toLocaleString()}`
      );
      return;
    }

    try {
      setUpdatingId(paymentDbId);

      const response = await api.put(`/payments/${paymentDbId}/pay`, {
        paid_amount: typedAmount,
        payment_method: 'Company Payment',
      });

      setPayments((prevPayments) =>
        prevPayments.map((item) =>
          item.id === paymentDbId ? response.data : item
        )
      );

      setPaymentInputs((prevInputs) => ({
        ...prevInputs,
        [paymentDbId]: response.data.paid_amount ?? 0,
      }));

      alert('Commission payment updated successfully');
    } catch (error) {
      console.error('Payment update error:', error);
      alert(error.response?.data?.detail || 'Failed to update payment');
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================
  // REVERT PAYMENT
  // =========================

  const handleRevertPayment = async (payment) => {
    const confirmRevert = window.confirm(
      'Are you sure you want to revert this commission payment?'
    );

    if (!confirmRevert) return;

    try {
      setUpdatingId(payment.id);

      const response = await api.put(`/payments/${payment.id}/revert`);

      setPayments((prevPayments) =>
        prevPayments.map((item) =>
          item.id === payment.id ? response.data : item
        )
      );

      setPaymentInputs((prevInputs) => ({
        ...prevInputs,
        [payment.id]: 0,
      }));

      alert('Commission payment reverted successfully');
    } catch (error) {
      console.error('Payment revert error:', error);
      alert(error.response?.data?.detail || 'Failed to revert payment');
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================
  // FILTER PAYMENTS
  // =========================

  const filteredPayments = payments.filter((payment) => {
    const searchValue = searchTerm.toLowerCase();

    return (
      payment.payment_id?.toLowerCase().includes(searchValue) ||
      payment.order_id?.toLowerCase().includes(searchValue) ||
      payment.agent_name?.toLowerCase().includes(searchValue) ||
      payment.agent_role?.toLowerCase().includes(searchValue) ||
      payment.payment_status?.toLowerCase().includes(searchValue)
    );
  });

  // =========================
  // SUMMARY VALUES
  // =========================

  const totalCommissionPayable = payments.reduce(
    (sum, payment) => sum + Number(payment.commission_amount || 0),
    0
  );

  const totalPaidByCompany = payments.reduce(
    (sum, payment) => sum + Number(payment.paid_amount || 0),
    0
  );

  const totalPendingPayment = payments.reduce(
    (sum, payment) => sum + Number(payment.pending_amount || 0),
    0
  );

  const completedPayments = payments.filter(
    (payment) => payment.payment_status === 'Paid'
  ).length;

  const pendingPayments = payments.filter(
    (payment) => payment.payment_status === 'Pending'
  ).length;

  const partialPayments = payments.filter(
    (payment) => payment.payment_status === 'Partial'
  ).length;

  return (
    <DashboardLayout title="Payment Management">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Payments & Commissions
            </h2>

            <p className="text-gray-600 mt-1">
              Company-to-member commission payment tracking.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchPayments}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => alert('Export feature can be added later')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Report
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">
              Commission Payable
            </p>

            <p className="text-2xl font-bold text-blue-600">
              ₹{totalCommissionPayable.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">
              Paid By Company
            </p>

            <p className="text-2xl font-bold text-green-600">
              ₹{totalPaidByCompany.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">
              Pending Payment
            </p>

            <p className="text-2xl font-bold text-yellow-600">
              ₹{totalPendingPayment.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">
              Payment Status
            </p>

            <p className="text-sm font-semibold text-green-600">
              Paid: {completedPayments}
            </p>

            <p className="text-sm font-semibold text-blue-600">
              Partial: {partialPayments}
            </p>

            <p className="text-sm font-semibold text-yellow-600">
              Pending: {pendingPayments}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search payment ID, job ID, member name, role, status..."
              className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* PAYMENTS TABLE */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="text-xl font-bold text-gray-900">
              Commission Payment List
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Total Records: {filteredPayments.length}
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading commission payments...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No commission payment records found. Create a new job first or run
              backfill API for old jobs.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Payment ID
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Job ID
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Member Name
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Member Role
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Commission Amount
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Company Paid Amount
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pending Amount
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Payment Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Payment Date
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => {
                    const commissionAmount = Number(
                      payment.commission_amount || 0
                    );

                    const paidAmount = Number(payment.paid_amount || 0);

                    const pendingAmount = Number(
                      payment.pending_amount || 0
                    );

                    const currentInputValue =
                      paymentInputs[payment.id] ?? paidAmount;

                    const isUpdating = updatingId === payment.id;

                    return (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {payment.payment_id}
                            </p>

                            <p className="text-xs text-gray-500">
                              DB ID: {payment.id}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {payment.order_id}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {payment.agent_name}
                          </p>

                          <p className="text-xs text-gray-500">
                            Member ID: {payment.agent_id}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                            {payment.agent_role}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-blue-600">
                            ₹{commissionAmount.toLocaleString()}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            max={commissionAmount}
                            step="0.01"
                            value={currentInputValue}
                            onChange={(e) =>
                              handlePaymentInputChange(
                                payment.id,
                                e.target.value,
                                commissionAmount
                              )
                            }
                            className="w-36 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter amount"
                          />

                          <p className="text-xs text-gray-500 mt-1">
                            Already Paid: ₹{paidAmount.toLocaleString()}
                          </p>

                          <p className="text-xs text-gray-500">
                            Max: ₹{commissionAmount.toLocaleString()}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p
                            className={`text-sm font-semibold ${
                              pendingAmount > 0
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}
                          >
                            ₹{pendingAmount.toLocaleString()}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(payment.payment_status)}

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                payment.payment_status
                              )}`}
                            >
                              {payment.payment_status}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {payment.payment_date ? (
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(
                                  payment.payment_date
                                ).toLocaleDateString()}
                              </p>

                              <p className="text-xs text-gray-500">
                                {payment.payment_method}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">-</p>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSavePayment(payment)}
                              disabled={isUpdating}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                            >
                              <Save className="w-4 h-4" />
                              {isUpdating ? 'Saving...' : 'PAY'}
                            </button>

                            <button
                              onClick={() => handleRevertPayment(payment)}
                              disabled={isUpdating || paidAmount <= 0}
                              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Revert
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* COMMISSION PAYMENT SUMMARY */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Company to Member Payment Summary
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-1">
                Total Commission Payable
              </p>

              <p className="text-2xl font-bold text-blue-600">
                ₹{totalCommissionPayable.toLocaleString()}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 mb-1">
                Total Paid By Company
              </p>

              <p className="text-2xl font-bold text-green-600">
                ₹{totalPaidByCompany.toLocaleString()}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700 mb-1">
                Total Pending Payment
              </p>

              <p className="text-2xl font-bold text-yellow-600">
                ₹{totalPendingPayment.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Company paid amount cannot exceed the commission amount. Each job can
            create separate payment records for Direct Member, Parent Member,
            and Grandparent Member.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payments;