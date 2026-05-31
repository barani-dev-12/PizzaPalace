import React, { useState, useEffect } from 'react';
import { orderApi } from '../api/orderApi';
import { getPizzaImageUrl } from '../utils/pizzaImage';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
      };
      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await orderApi.getAllOrders(params);
      if (response.data && response.data.success) {
        setOrders(response.data.data.orders);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await orderApi.updateStatus(orderId, newStatus);
      if (response.data && response.data.success) {
        toast.success(`Order status updated to "${newStatus}"`);
        setOrders(
          orders.map((o) =>
            o._id === orderId
              ? { ...o, orderStatus: newStatus, isPaid: newStatus === 'Delivered' ? true : o.isPaid }
              : o
          )
        );
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this order?')) return;

    try {
      const response = await orderApi.deleteOrder(id);
      if (response.data && response.data.success) {
        toast.success('Order deleted');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  const getStatusDropdownColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'border-amber-300 bg-amber-50 text-amber-800';
      case 'Preparing':
        return 'border-blue-300 bg-blue-50 text-blue-800';
      case 'Out for Delivery':
        return 'border-cyan-300 bg-cyan-50 text-cyan-800';
      case 'Delivered':
        return 'border-emerald-300 bg-emerald-50 text-emerald-800';
      case 'Cancelled':
        return 'border-red-300 bg-red-50 text-red-800';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  };

  const getPizzaImage = (item) => getPizzaImageUrl(item.pizza?.image, item.pizza?.category || 'classic');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Manage Customer Orders</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Track client purchases, update logistics phases, and review deliveries.
          </p>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
        <span className="text-xs font-bold text-gray-500">Filter Status:</span>
        <div className="flex flex-wrap gap-2">
          {['', 'Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {status === '' ? 'All Orders' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20">
          <Spinner />
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="py-4 px-6">Order Info</th>
                  <th className="py-4 px-6">Customer Details</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Payment / Address</th>
                  <th className="py-4 px-6">Order Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                {orders.map((order) => {
                  const isExpanded = expandedOrder === order._id;
                  const qty = order.orderItems.reduce((acc, item) => acc + item.quantity, 0);
                  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-gray-50/30 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-mono text-[10px] text-gray-400 font-bold">
                            #{order._id.substring(14)}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 font-medium">{date}</p>
                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                            className="mt-2 text-[10px] font-bold text-amber-500 hover:text-amber-600 underline flex items-center gap-1"
                          >
                            <span>{qty} item(s)</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-2.5 h-2.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                          </button>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-gray-800">{order.user?.name || 'Customer'}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{order.user?.email}</p>
                          <p className="text-[10px] text-gray-400 font-medium">📞 {order.deliveryAddress?.phone}</p>
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-800 text-sm">
                          ₹{order.totalAmount}
                        </td>
                        <td className="py-4 px-6 text-[10px] text-gray-500 leading-relaxed font-semibold">
                          <p>Method: <b className="text-gray-700">{order.paymentMethod}</b></p>
                          <p>
                            Paid:{' '}
                            <span className={order.isPaid ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                              {order.isPaid ? 'Paid' : 'COD'}
                            </span>
                          </p>
                          <p className="truncate max-w-[150px] mt-0.5" title={order.deliveryAddress?.street}>
                            📍 {order.deliveryAddress?.street}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            disabled={order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled'}
                            className={`border text-[10px] font-bold rounded-full py-1 px-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${getStatusDropdownColor(
                              order.orderStatus
                            )}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="p-2 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-xl transition-colors"
                            aria-label="Delete order"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Pizza Items breakdown row */}
                      {isExpanded && (
                        <tr className="bg-gray-50/20">
                          <td colSpan={6} className="py-4 px-8 border-t border-gray-50">
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Order Items Breakdown
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {order.orderItems.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white border border-gray-150 p-2.5 rounded-xl flex items-center gap-3 shadow-inner"
                                  >
                                    <img
                                      src={getPizzaImage(item)}
                                      alt={item.pizza?.name || 'Pizza'}
                                      className="w-8 h-8 object-cover rounded bg-gray-50"
                                    />
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-gray-800 truncate">
                                        {item.pizza?.name || 'Deleted Pizza'}
                                      </p>
                                      <p className="text-[9px] text-gray-400 font-semibold">
                                        Size: {item.size} • Qty: {item.quantity} • ₹{item.price}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-4 py-4 border-t border-gray-100 select-none">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border rounded-lg text-xs font-bold hover:bg-amber-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-bold self-center text-gray-500">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border rounded-lg text-xs font-bold hover:bg-amber-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          No customer orders found.
        </div>
      )}
    </div>
  );
};

export default AdminOrders;