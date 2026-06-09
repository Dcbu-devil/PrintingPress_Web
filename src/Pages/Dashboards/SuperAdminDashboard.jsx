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

/*
  ============================================================
  SUPER ADMIN DASHBOARD PAGE
  ============================================================

  Purpose:
  This page is the main dashboard for Super Admin.

  It shows business summary cards for:

  1. Jobs
     - Total jobs
     - Pending jobs
     - Running jobs
     - Completed jobs

  2. Members
     - Total members
     - Top earning member

  3. Commissions
     - Total commission distributed

  4. Network
     - Top network member
     - Number of connected members

  Important:
  This page fetches data from FastAPI backend:

      GET /api/agents/
      GET /api/orders/

  API base URL is handled by:

      ppweb/src/api/api.js
*/

const SuperAdminDashboard = () => {
  /*
    ============================================================
    AUTH AND ROUTER HOOKS
    ============================================================

    user:
    Current logged-in user from AuthContext.

    navigate:
    Used to move user to another page when dashboard card is clicked.
  */

  const { user } = useAuth();
  const navigate = useNavigate();

  /*
    ============================================================
    STATE MANAGEMENT
    ============================================================

    agents:
    Stores all members/agents from backend.

    orders:
    Stores all jobs/orders from backend.

    loading:
    Shows loading message while API data is being fetched.
  */

  const [agents, setAgents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
    ============================================================
    FETCH DASHBOARD DATA
    ============================================================

    This function loads dashboard data from backend.

    It calls two APIs together using Promise.all():

      1. /agents/
      2. /orders/

    Why Promise.all?
    Both API calls run at the same time, so dashboard loads faster.
  */

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [agentsResponse, ordersResponse] = await Promise.all([
        api.get('/agents/'),
        api.get('/orders/'),
      ]);

      setAgents(Array.isArray(agentsResponse.data) ? agentsResponse.data : []);
      setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
    } catch (error) {
      console.error('Dashboard API error:', error);

      alert(
        error.response?.data?.detail ||
          'Unable to load dashboard data. Please check FastAPI backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
    ============================================================
    PAGE LOAD EFFECT
    ============================================================

    This runs once when Super Admin Dashboard opens.
  */

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /*
    ============================================================
    HELPER: GET CHILDREN COUNT
    ============================================================

    Purpose:
    Counts how many direct child members an agent has.

    Example:
    If Ravi hired 3 members, getChildrenCount(Ravi.id) returns 3.
  */

  const getChildrenCount = (agentId) => {
    return agents.filter((agent) => agent.parent_agent_id === agentId).length;
  };

  /*
    ============================================================
    JOB SUMMARY CALCULATIONS
    ============================================================

    Your backend job status values are:

      Pending
      Running
      Completed

    So we use Running, not Processing.
  */

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === 'Pending'
  ).length;

  const runningOrders = orders.filter(
    (order) => order.status === 'Running'
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === 'Completed'
  ).length;

  /*
    ============================================================
    MEMBER SUMMARY CALCULATIONS
    ============================================================
  */

  const totalMembers = agents.length;

  /*
    ============================================================
    COMMISSION SUMMARY CALCULATION
    ============================================================

    Total distributed commission means:

      final_direct_agent_commission
      + parent_commission
      + grandparent_commission

    for all jobs.
  */

  const totalCommissionDistributed = orders.reduce((sum, order) => {
    return (
      sum +
      Number(order.final_direct_agent_commission || 0) +
      Number(order.parent_commission || 0) +
      Number(order.grandparent_commission || 0)
    );
  }, 0);

  /*
    ============================================================
    TOP NETWORK MEMBER
    ============================================================

    Top network member means the member who has the highest number
    of direct child members.
  */

  const topNetworkAgent = [...agents].sort(
    (a, b) => getChildrenCount(b.id) - getChildrenCount(a.id)
  )[0];

  /*
    ============================================================
    TOP EARNING MEMBER
    ============================================================

    Top earning member means the member with highest total_commission.
  */

  const topEarningAgent = [...agents].sort(
    (a, b) =>
      Number(b.total_commission || 0) - Number(a.total_commission || 0)
  )[0];

  /*
    ============================================================
    DASHBOARD CARDS DATA
    ============================================================

    Important Fix:
    Network card path must be:

      /network

    Previously it was:

      /agents

    That caused Network card click to open Members page.
  */

  const dashboardBoxes = [
    {
      title: 'Jobs',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      path: '/orders',
      details: [
        `Total Jobs : ${totalOrders}`,
        `Pending Jobs : ${pendingOrders}`,
        `Running Jobs : ${runningOrders}`,
        `Completed Jobs : ${completedOrders}`,
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
      path: '/network',
      details: [
        `Top Network Member : ${topNetworkAgent?.name || 'N/A'}`,
        `Connected Members : ${
          topNetworkAgent ? getChildrenCount(topNetworkAgent.id) : 0
        }`,
      ],
    },
  ];

  /*
    ============================================================
    UI RENDER
    ============================================================
  */

  return (
    <DashboardLayout title="Super Admin Dashboard">
      <div className="space-y-8">
        {/* ========================= */}
        {/* WELCOME SECTION */}
        {/* ========================= */}

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h2 className="text-3xl font-bold">
            Welcome {user?.name || 'Super Admin'} 👋
          </h2>

          <p className="mt-2 text-blue-100">
            Manage members, jobs, commissions and dynamic network hierarchy.
          </p>
        </div>

        {/* ========================= */}
        {/* LOADING MESSAGE */}
        {/* ========================= */}

        {loading && (
          <div className="bg-white rounded-xl p-4 text-gray-500 shadow-sm">
            Loading dashboard data from FastAPI backend...
          </div>
        )}

        {/* ========================= */}
        {/* MAIN DASHBOARD BOXES */}
        {/* ========================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardBoxes.map((box, index) => {
            const Icon = box.icon;

            return (
              <div
                key={index}
                onClick={() => navigate(box.path)}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 cursor-pointer border border-gray-100"
              >
                {/* Card icon and trend icon */}
                <div className="flex items-center justify-between mb-5">
                  <div className={`${box.color} p-4 rounded-xl`}>
                    <Icon className="text-white w-7 h-7" />
                  </div>

                  <TrendingUp className="text-green-500" />
                </div>

                {/* Card title */}
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {box.title}
                </h3>

                {/* Card details */}
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