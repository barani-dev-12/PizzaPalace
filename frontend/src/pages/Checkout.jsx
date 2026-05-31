import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/orderApi';
import { paymentApi } from '../api/paymentApi';
import { toast } from 'react-hot-toast';

// Helper to dynamically load the Razorpay SDK script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart, getPizzaPrice } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form states
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  // Pricing constants
  const deliveryFee = cartTotal > 500 ? 0 : 40;
  const taxes = Math.round(cartTotal * 0.05);
  const grandTotal = cartTotal + deliveryFee + taxes;

  const handleInputChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/menu');
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(address.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const orderItems = cart.map((item) => ({
        pizza: item.pizza._id,
        quantity: item.quantity,
        size: item.size,
      }));

      const payload = {
        orderItems,
        deliveryAddress: address,
        paymentMethod,
      };

      const response = await orderApi.placeOrder(payload);
      if (response.data && response.data.success) {
        const createdOrder = response.data.data.order;

        if (paymentMethod === 'Cash on Delivery') {
          toast.success('🍕 Order placed successfully (COD)!');
          clearCart();
          navigate('/orders');
        } else {
          // Razorpay payment flow
          const isScriptLoaded = await loadRazorpayScript();
          if (!isScriptLoaded) {
            toast.error('Failed to load Razorpay SDK. Please check your internet connection.');
            setLoading(false);
            return;
          }

          try {
            const paymentOrderRes = await paymentApi.createOrder(createdOrder._id);
            if (!paymentOrderRes.data || !paymentOrderRes.data.success) {
              toast.error(paymentOrderRes.data?.message || 'Failed to initialize payment');
              setLoading(false);
              return;
            }

            const { razorpayOrderId, amount, currency, keyId } = paymentOrderRes.data.data;

            const options = {
              key: keyId || process.env.REACT_APP_RAZORPAY_KEY,
              amount,
              currency,
              name: 'Pizza Palace',
              description: 'Thank you for ordering with us!',
              order_id: razorpayOrderId,
              handler: async function (paymentResponse) {
                setLoading(true);
                try {
                  const verifyPayload = {
                    orderId: createdOrder._id,
                    razorpayOrderId: paymentResponse.razorpay_order_id,
                    razorpayPaymentId: paymentResponse.razorpay_payment_id,
                    razorpaySignature: paymentResponse.razorpay_signature,
                  };

                  const verifyRes = await paymentApi.verifyPayment(verifyPayload);
                  if (verifyRes.data && verifyRes.data.success) {
                    toast.success('🍕 Payment successful & order placed!');
                    clearCart();
                    navigate('/orders');
                  } else {
                    toast.error(verifyRes.data?.message || 'Payment verification failed');
                  }
                } catch (err) {
                  console.error('Error verifying payment:', err);
                  toast.error(err.response?.data?.message || 'Payment verification failed');
                } finally {
                  setLoading(false);
                }
              },
              prefill: {
                name: user?.name || '',
                email: user?.email || '',
                contact: address.phone,
              },
              theme: {
                color: '#f59e0b',
              },
              modal: {
                ondismiss: function () {
                  toast.error('Payment cancelled by user.');
                  setLoading(false);
                },
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
          } catch (paymentErr) {
            console.error('Payment initialization error:', paymentErr);
            toast.error(paymentErr.response?.data?.message || 'Failed to initialize payment');
            setLoading(false);
          }
        }
      } else {
        toast.error(response.data?.message || 'Failed to place order');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <p className="text-gray-500 font-bold">No items in your cart to checkout.</p>
        <button
          onClick={() => navigate('/menu')}
          className="px-6 py-2 bg-amber-500 text-white rounded-full font-bold"
        >
          Go to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Checkout</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Enter your delivery details and place your order.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns: Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-800 tracking-tight border-b border-gray-100 pb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-amber-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span>Delivery Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Street Address</label>
                <input
                  type="text"
                  name="street"
                  required
                  placeholder="e.g. Apartment, House No, Flat, Street Name"
                  value={address.street}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium text-sm transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Mumbai"
                  value={address.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium text-sm transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">State</label>
                <input
                  type="text"
                  name="state"
                  required
                  placeholder="e.g. Maharashtra"
                  value={address.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium text-sm transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  required
                  placeholder="e.g. 400001"
                  value={address.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium text-sm transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="10-digit mobile number"
                  value={address.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-800 tracking-tight border-b border-gray-100 pb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-amber-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-5.625-12h17.25c.621 0 1.125.504 1.125 1.125v13.5c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 0 1-1.125-1.125V3.75c0-.621.504-1.125 1.125-1.125Z" />
              </svg>
              <span>Payment Method</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Cash on Delivery', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking'].map((method) => (
                <label
                  key={method}
                  className={`border p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === method
                      ? 'border-amber-500 bg-amber-50/50 text-amber-700 ring-2 ring-amber-500/10'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="text-amber-500 focus:ring-amber-500 h-4 w-4 border-gray-300"
                    />
                    <span className="text-sm font-bold">{method}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Panel */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 tracking-tight pb-3 border-b border-gray-100">
            Order Items
          </h2>

          {/* Items breakdown list */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {cart.map((item, idx) => {
              const price = getPizzaPrice(item.pizza, item.size);
              return (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-gray-800 truncate">{item.pizza.name}</p>
                    <p className="text-gray-400 font-medium">Qty: {item.quantity} • {item.size}</p>
                  </div>
                  <span className="font-bold text-gray-700 flex-shrink-0">₹{price * item.quantity}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-gray-800">₹{cartTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes (5%)</span>
              <span className="font-bold text-gray-800">₹{taxes}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
            <span className="text-base font-bold text-gray-800">Total Amount</span>
            <span className="text-xl font-black text-amber-500">₹{grandTotal}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-center text-sm font-bold text-white bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 rounded-full shadow-md hover:shadow-lg active:scale-98 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;