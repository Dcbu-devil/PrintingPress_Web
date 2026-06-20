import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../../Components/Layout/Dashboardlayout';
import { useAuth } from '../../context/AuthContext';

import {
  ShoppingCart,
  Wallet,
  User,
  Network,
  Users,
} from 'lucide-react';

import api from '../../api/api';

const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [subagents, setSubagents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchAgentDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const [ordersResponse, paymentsResponse, profileResponse, subagentsResponse] =
        await Promise.all([
          api.get('/orders/my'),
          api.get('/payments/my'),
          api.get('/agents/me'),
          api.get('/agents/subagents'),
        ]);

      setOrders(
        Array.isArray(ordersResponse.data)
          ? ordersResponse.data
          : []
      );

      setPayments(
        Array.isArray(paymentsResponse.data)
          ? paymentsResponse.data
          : []
      );

      setProfile(profileResponse.data);

      setSubagents(
        Array.isArray(subagentsResponse.data)
          ? subagentsResponse.data
          : []
      );
    } catch (error) {
      console.error('Agent dashboard error:', error);

      setErrorMessage(
        error.response?.data?.detail ||
          'Unable to load agent dashboard data. Please check backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentDashboardData();
  }, []);

  const totalJobs = orders.length;

  const pendingJobs = orders.filter(
    (order) => order.status === 'Pending'
  ).length;

  const runningJobs = orders.filter(
    (order) => order.status === 'Running'
  ).length;

  const completedJobs = orders.filter(
    (order) => order.status === 'Completed'
  ).length;

  const totalCommission = payments.reduce((sum, payment) => {
    return sum + Number(payment.commission_amount || 0);
  }, 0);

  const totalJobsValue = orders.reduce((sum, order) => {
    return sum + Number(order.requirement_total_amount || order.total_amount || 0);
  }, 0);

  const paidCommission = payments.reduce((sum, payment) => {
    return sum + Number(payment.paid_amount || 0);
  }, 0);

  const pendingCommission = payments.reduce((sum, payment) => {
    return sum + Number(payment.pending_amount || 0);
  }, 0);

  return (
    <DashboardLayout title="Agent Dashboard">
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
          <h2 className="text-3xl font-bold">
            Welcome {profile?.name || user?.name || 'Member'} 👋
          </h2>

          <p className="mt-2 text-purple-100">
            Track your jobs, commission and profile activity.
          </p>
        </div>

        {loading && (
          <div className="bg-white rounded-xl p-4 text-gray-500 shadow-sm">
            Loading member dashboard data...
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="bg-green-500 p-4 rounded-xl inline-block mb-4">
              <User className="text-white w-7 h-7" />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              My Profile
            </h3>

            <div className="space-y-2 text-sm text-gray-600 font-medium">
              <p>Name : {profile?.name || user?.name || 'N/A'}</p>
              <p>Email : {profile?.email || user?.email || 'N/A'}</p>
              <p>Code : {profile?.code || 'N/A'}</p>
              <p>Status : {profile?.status || user?.status || 'N/A'}</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/payments')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 cursor-pointer border border-gray-100"
          >
            <div className="bg-yellow-500 p-4 rounded-xl inline-block mb-4">
              <Wallet className="text-white w-7 h-7" />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              My Commission
            </h3>

            <div className="space-y-2 text-sm text-gray-600 font-medium">
              <p>Total Commission : ₹{totalCommission.toLocaleString()}</p>
              <p>Paid Commission : ₹{paidCommission.toLocaleString()}</p>
              <p>Pending Commission : ₹{pendingCommission.toLocaleString()}</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/orders')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 cursor-pointer border border-gray-100"
          >
            <div className="bg-blue-500 p-4 rounded-xl inline-block mb-4">
              <ShoppingCart className="text-white w-7 h-7" />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              My Jobs
            </h3>

            <div className="space-y-2 text-sm text-gray-600 font-medium">
              <p>Total Jobs : {totalJobs}</p>
              <p>Pending Jobs : {pendingJobs}</p>
              <p>Running Jobs : {runningJobs}</p>
              <p>Completed Jobs : {completedJobs}</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/add-member')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 cursor-pointer border border-gray-100 flex flex-col h-[280px]"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-3 rounded-xl">
                  <Users className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  My Members
                </h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {subagents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <p className="text-sm">No subagents added yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Click here to add subagents and build your network.</p>
                </div>
              ) : (
                subagents.map((sub) => (
                  <div key={sub.id} className="flex justify-between items-center p-3 border rounded-xl hover:bg-gray-100 transition">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{sub.code}</p>
                      <p className="text-xs text-gray-500">{sub.email}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${sub.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {sub.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;