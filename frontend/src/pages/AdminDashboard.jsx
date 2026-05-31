import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { pizzaApi } from '../api/pizzaApi';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [pizzaCount, setPizzaCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, pizzasRes] = await Promise.all([
          orderApi.getAllOrders({ limit: 100 }), // fetch recent 100 orders for stats
          pizzaApi.getAll({ limit: 100 }),
        ]);

        if (ordersRes.data && ordersRes.data.success) {
          setOrders(ordersRes.data.data.orders);
        }
        if (pizzasRes.data && pizzasRes.data.success) {
          setPizzaCount(pizzasRes.data.data.pagination.totalItems);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-24">
        <Spinner />
      </div>
    );
  }

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => {
    // Only count delivered/paid orders for revenue, or all non-cancelled orders
    if (order.orderStatus !== 'Cancelled') {
      return sum + order.totalAmount;
    }
    return sum;
  }, 0);

  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending').length;
  const activeOrders = orders.filter(
    (o) => o.orderStatus === 'Preparing' || o.orderStatus === 'Out for Delivery'
  ).length;
  const recentOrders = orders.slice(0, 5);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.067 4.06 0l.853.659M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0Z" />
        </svg>
      ),
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      color: 'bg-amber-500/10 text-amber-600',
    },
    {
      title: 'Active Shipments',
      value: activeOrders,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V11.25c0-.447-.266-.852-.68-1.026L17.25 8.25h-3m4.5 3H13.5V8.25m3 3h-3V1.5h-4.5v12.75" />
        </svg>
      ),
      color: 'bg-cyan-500/10 text-cyan-600',
    },
    {
      title: 'Total Pizzas',
      value: pizzaCount,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
        </svg>
      ),
      color: 'bg-purple-500/10 text-purple-600',
    },
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Real-time shop statistics, revenue monitoring, and quick action shortcuts.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/pizzas"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all"
          >
            Manage Pizza Menu
          </Link>
          <Link
            to="/admin/orders"
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow"
          >
            <div className={`p-4 rounded-2xl ${card.color}`}>{card.icon}</div>
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                {card.title}
              </span>
              <span className="text-2xl font-black text-gray-800">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Sections (Recent Orders) */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 tracking-tight">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors"
          >
            See All Orders
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Items Qty</th>
                  <th className="py-4 px-6">Total</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                {recentOrders.map((order) => {
                  const qty = order.orderItems.reduce((acc, item) => acc + item.quantity, 0);
                  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  });

                  return (
                    <tr key={order._id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="py-4 px-6 font-mono text-[11px] font-bold text-gray-400">
                        {order._id.substring(0, 10)}...
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-800">{order.user?.name || 'Guest User'}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{date}</p>
                      </td>
                      <td className="py-4 px-6 font-bold">{qty} pizza(s)</td>
                      <td className="py-4 px-6 font-bold text-gray-800">₹{order.totalAmount}</td>
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 font-semibold">No recent orders.</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;