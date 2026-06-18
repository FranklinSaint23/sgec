import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sgec-api.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const keys = ['token', 'userEmail', 'userName', 'userRole', 'userId', 'userCreatedAt', 'rememberMe'];
      keys.forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
