import React, { useState, useEffect } from 'react';
import { orderApi } from '../api/orderApi';
import { getPizzaImageUrl } from '../utils/pizzaImage';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderApi.getMyOrders({ limit: 50 }); // fetch all recent orders
        if (response.data && response.data.success) {
          setOrders(response.data.data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleExpandOrder = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Out for Delivery':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPizzaImage = (item) => getPizzaImageUrl(item.pizza?.image, item.pizza?.category || 'classic');

  if (loading) {
    return (
      <div className="py-24">
        <Spinner />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4 animate-fadeIn">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 0 13.5 2.25H15a2.25 2.25 0 0 0 2.25 2.25m-10.5 6h9.75m-9.75 3.25h9.75m-9.75 3.25h9.75M3 18.75V6.108c0-1.135.845-2.098 1.976-2.192a48.424 48.424 0 0 1 1.123-.08" />
          </svg>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-800">No Orders Yet</h2>
          <p className="text-sm text-gray-400">You haven't placed any orders with us yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Order History</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Track active orders or review your past pizza purchases.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrder === order._id;
          const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={order._id}
              className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Order Row Header */}
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                      Order ID:
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                      {order._id}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-500">Ordered on: {orderDate}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  {/* Total and Status */}
                  <div className="text-right sm:space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">
                      Total
                    </span>
                    <span className="text-base font-extrabold text-gray-800">
                      ₹{order.totalAmount}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3.5 py-1.5 text-xs font-bold rounded-full border ${getStatusBadgeClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>

                    {/* Expand Trigger */}
                    <button
                      onClick={() => toggleExpandOrder(order._id)}
                      className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-amber-500"
                      aria-label={isExpanded ? 'Collapse order' : 'Expand order'}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible details panel */}
              {isExpanded && (
                <div className="border-t border-gray-50 bg-gray-50/30 p-5 sm:p-6 space-y-6">
                  {/* Items list */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Items Purchased</h3>
                    <div className="space-y-3">
                      {order.orderItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-4 bg-white border border-gray-100 p-3 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={getPizzaImage(item)}
                              alt={item.pizza?.name || 'Pizza'}
                              className="w-10 h-10 object-cover rounded-lg bg-gray-50"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-gray-800 truncate">
                                {item.pizza?.name || 'Deleted Pizza'}
                              </h4>
                              <p className="text-[10px] text-gray-400 font-medium">
                                Size: {item.size} • Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-gray-700">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping and Billing details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100/50">
                    <div className="space-y-2">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Delivery Address</h3>
                      <div className="text-xs text-gray-600 leading-relaxed font-semibold">
                        <p>{order.deliveryAddress?.street}</p>
                        <p>
                          {order.deliveryAddress?.city}, {order.deliveryAddress?.state} -{' '}
                          {order.deliveryAddress?.zipCode}
                        </p>
                        <p className="mt-1 text-gray-500">📞 Phone: {order.deliveryAddress?.phone}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Payment & Billing</h3>
                      <div className="text-xs text-gray-600 leading-relaxed font-semibold">
                        <p>Method: <span className="font-bold text-gray-800">{order.paymentMethod}</span></p>
                        <p className="mt-1">
                          Payment Status:{' '}
                          <span className={`font-bold uppercase ${order.isPaid ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {order.isPaid ? 'Paid' : 'Unpaid / Cash on Delivery'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistory;