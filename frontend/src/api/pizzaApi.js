import api from './axios';

export const pizzaApi = {
  // Get all pizzas with pagination, search, filter, sort
  getAll: (params = {}) => api.get('/pizzas', { params }),

  // Get single pizza by ID
  getById: (id) => api.get(`/pizzas/${id}`),

  // Create pizza (admin only)
  create: (data) => api.post('/pizzas', data),

  // Update pizza (admin only)
  update: (id, data) => api.put(`/pizzas/${id}`, data),

  // Delete pizza (admin only)
  delete: (id) => api.delete(`/pizzas/${id}`),
};
