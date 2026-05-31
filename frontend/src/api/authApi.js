import api from './axios';

export const authApi = {
  // Register a new user
  register: (name, email, password) => 
    api.post('/auth/register', { name, email, password }),

  // Login a user
  login: (email, password) => 
    api.post('/auth/login', { email, password }),

  // Get current user profile
  getProfile: () => 
    api.get('/auth/profile'),
};
