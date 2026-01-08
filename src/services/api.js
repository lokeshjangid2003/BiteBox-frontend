import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
};

// Restaurant API
export const restaurantAPI = {
  getAll: () => api.get('/restaurants'),
  getById: (id) => api.get(`/restaurants/${id}`),
  getFoodItems: (id) => api.get(`/restaurants/${id}/food-items`),
  create: (restaurantData) => api.post('/restaurants', restaurantData),
  update: (id, restaurantData) => api.put(`/restaurants/${id}`, restaurantData),
  delete: (id) => api.delete(`/restaurants/${id}`),
};

// Order API
export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getUserOrders: () => api.get('/orders'),
  getRestaurantOrders: () => api.get('/orders/restaurant'),
  getRiderOrders: (status) => api.get(`/orders/rider${status ? `?status=${status}` : ''}`),
  assignOrder: (id) => api.patch(`/orders/${id}/assign`),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Food Item API
export const foodItemAPI = {
  create: (restaurantId, itemData) => api.post(`/food-items/restaurants/${restaurantId}/food-items`, itemData),
  update: (id, itemData) => api.put(`/food-items/${id}`, itemData),
  delete: (id) => api.delete(`/food-items/${id}`),
};

export default api;
