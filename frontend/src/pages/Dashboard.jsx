import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Pill, Users, TrendingUp, AlertTriangle, Package, Activity } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/charts')
        ]);
        setStats(statsRes.data);
        setCharts(chartsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (!stats || !charts) return <div className="p-8 text-center text-red-500">Failed to load dashboard.</div>;

  const statCards = [
    { title: 'Total Medicines', value: stats.totalMedicines, icon: Pill, color: 'bg-blue-100 text-blue-600' },
    { title: "Today's Revenue", value: `$${stats.todayRevenue || 0}`, icon: TrendingUp, color: 'bg-green-100 text-green-600' },
    { title: "Today's Sales", value: stats.todaySales, icon: Activity, color: 'bg-purple-100 text-purple-600' },
    { title: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'bg-indigo-100 text-indigo-600' },
    { title: 'Low Stock Alerts', value: stats.lowStockCount, icon: AlertTriangle, color: 'bg-orange-100 text-orange-600' },
    { title: 'Expiring Soon', value: stats.expiringCount, icon: Package, color: 'bg-red-100 text-red-600' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
            <div className={`p-4 rounded-full ${stat.color} mr-4`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Trend (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Medicines</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.topMedicines}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#10b981" name="Quantity Sold" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
