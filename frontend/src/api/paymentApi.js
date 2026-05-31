import api from './axios';

export const paymentApi = {
  // Create a Razorpay order based on a backend order ID
  createOrder: (orderId) => 
    api.post('/payments/order', { orderId }),

  // Verify the payment signature returned by Razorpay
  verifyPayment: (paymentDetails) => 
    api.post('/payments/verify', paymentDetails),
};
