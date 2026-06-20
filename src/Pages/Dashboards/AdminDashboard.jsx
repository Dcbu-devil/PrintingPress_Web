import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../../Components/Layout/Dashboardlayout';
import { useAuth } from '../../context/AuthContext';

import {
  Users,
  ShoppingCart,
  Wallet,
  Network,
  TrendingUp,
} from 'lucide-react';

import api from '../../api/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [agentsResponse, ordersResponse, paymentsResponse] =
        await Promise.all([
          api.get('/agents/'),
          api.get('/orders/'),
          api.get('/payments/'),
        ]);

      setAgents(Array.isArray(agentsResponse.data) ? agentsResponse.data : []);
      setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
      setPayments(
        Array.isArray(paymentsResponse.data) ? paymentsResponse.data : []
      );
    } catch (error) {
      console.error('Admin dashboard error:', error);
      alert(
        error.response?.data?.detail ||
          'Unable to load admin dashboard data. Please check backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalMembers = agents.length;
  const totalJobs = orders.length;

  const pendingJobs = orders.filter((order) => order.status === 'Pending').length;
  const runningJobs = orders.filter((order) => order.status === 'Running').length;
  const completedJobs = orders.filter(
    (order) => order.status === 'Completed'
  ).length;

  const pendingPayments = payments.filter(
    (payment) => payment.payment_status === 'Pending'
  ).length;

  const dashboardBoxes = [
    {
      title: 'Members',
      icon: Users,
      color: 'bg-green-500',
      path: '/agents',
      details: [`Total Members : ${totalMembers}`, 'Manage member details'],
    },
    {
      title: 'Jobs',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      path: '/orders',
      details: [
        `Total Jobs : ${totalJobs}`,
        `Pending Jobs : ${pendingJobs}`,
        `Running Jobs : ${runningJobs}`,
        `Completed Jobs : ${completedJobs}`,
      ],
    },
    {
      title: 'Commissions',
      icon: Wallet,
      color: 'bg-yellow-500',
      path: '/payments',
      details: [
        `Pending Payments : ${pendingPayments}`,
        'View commission payment status',
      ],
    },
    {
      title: 'Network',
      icon: Network,
      color: 'bg-purple-500',
      path: '/network',
      details: ['View member hierarchy', 'Track parent-child network'],
    },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
          <h2 className="text-3xl font-bold">
            Welcome {user?.name || 'Admin'} 👋
          </h2>

          <p className="mt-2 text-green-100">
            Manage daily operations, members, jobs and network activity.
          </p>
        </div>

        {loading && (
          <div className="bg-white rounded-xl p-4 text-gray-500 shadow-sm">
            Loading admin dashboard data...
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardBoxes.map((box, index) => {
            const Icon = box.icon;

            return (
              <div
                key={index}
                onClick={() => navigate(box.path)}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 cursor-pointer border border-gray-100"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`${box.color} p-4 rounded-xl`}>
                    <Icon className="text-white w-7 h-7" />
                  </div>

                  <TrendingUp className="text-green-500" />
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {box.title}
                </h3>

                <div className="space-y-2">
                  {box.details.map((item, i) => (
                    <p key={i} className="text-sm text-gray-600 font-medium">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;