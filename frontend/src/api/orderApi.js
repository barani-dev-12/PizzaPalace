import api from './axios';

export const orderApi = {
  // Place a new order
  placeOrder: (orderData) => 
    api.post('/orders', orderData),

  // Get current user's orders (paginated, with optional status filter)
  getMyOrders: (params = {}) => 
    api.get('/orders/my', { params }),

  // Admin: Get all orders (paginated, with optional status/userId filters)
  getAllOrders: (params = {}) => 
    api.get('/orders', { params }),

  // Admin: Update order status
  updateStatus: (id, orderStatus) => 
    api.put(`/orders/${id}/status`, { orderStatus }),

  // Admin: Delete an order
  deleteOrder: (id) => 
    api.delete(`/orders/${id}`),
};
