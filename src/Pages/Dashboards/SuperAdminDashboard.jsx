import { useEffect, useState } from 'react';
import DashboardLayout from '../../Components/Layout/Dashboardlayout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import {
  Users,
  ShoppingCart,
  Wallet,
  Network,
  TrendingUp,
} from 'lucide-react';

import api from '../../api/api';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [agentsResponse, ordersResponse] = await Promise.all([
        api.get('/agents/'),
        api.get('/orders/'),
      ]);

      setAgents(agentsResponse.data);
      setOrders(ordersResponse.data);
    } catch (error) {
      console.error('Dashboard API error:', error);
      alert('Unable to load dashboard data. Please check FastAPI backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getChildrenCount = (agentId) => {
    return agents.filter((agent) => agent.parent_agent_id === agentId).length;
  };

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === 'Pending'
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === 'Completed'
  ).length;

  const processingOrders = orders.filter(
    (order) => order.status === 'Processing'
  ).length;

  const totalMembers = agents.length;

  const totalCommissionDistributed = orders.reduce((sum, order) => {
    return (
      sum +
      Number(order.final_direct_agent_commission || 0) +
      Number(order.parent_commission || 0) +
      Number(order.grandparent_commission || 0)
    );
  }, 0);

  const topNetworkAgent = [...agents].sort(
    (a, b) => getChildrenCount(b.id) - getChildrenCount(a.id)
  )[0];

  const topEarningAgent = [...agents].sort(
    (a, b) =>
      Number(b.total_commission || 0) - Number(a.total_commission || 0)
  )[0];

  const dashboardBoxes = [
    {
      title: 'Jobs',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      path: '/orders',
      details: [
        `Total Orders : ${totalOrders}`,
        `Pending Orders : ${pendingOrders}`,
        `Processing Orders : ${processingOrders}`,
        `Completed Orders : ${completedOrders}`,
      ],
    },
    {
      title: 'Members',
      icon: Users,
      color: 'bg-green-500',
      path: '/agents',
      details: [
        `Total Members : ${totalMembers}`,
        `Top Earner : ${topEarningAgent?.name || 'N/A'}`,
      ],
    },
    {
      title: 'Commissions',
      icon: Wallet,
      color: 'bg-yellow-500',
      path: '/payments',
      details: [
        `Total Distributed : ₹${totalCommissionDistributed.toLocaleString()}`,
      ],
    },
    {
      title: 'Network',
      icon: Network,
      color: 'bg-purple-500',
      path: '/agents',
      details: [
        `Top Network Member : ${topNetworkAgent?.name || 'N/A'}`,
        `Connected Members : ${
          topNetworkAgent ? getChildrenCount(topNetworkAgent.id) : 0
        }`,
      ],
    },
  ];

  return (
    <DashboardLayout title="Super Admin Dashboard">
      <div className="space-y-8">
        {/* WELCOME */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h2 className="text-3xl font-bold">
            Welcome {user?.name || 'Super Admin'} 👋
          </h2>

          <p className="mt-2 text-blue-100">
            Manage members, orders, commissions and dynamic network hierarchy.
          </p>
        </div>

        {loading && (
          <div className="bg-white rounded-xl p-4 text-gray-500 shadow-sm">
            Loading dashboard data from FastAPI backend...
          </div>
        )}

        {/* MAIN DASHBOARD BOXES */}
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

export default SuperAdminDashboard;