import axios from 'axios';

// Set default auth header from storage on module load
const storedToken = localStorage.getItem('member_token');
if (storedToken) {
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + storedToken;
}

const api = axios.create({
  // Use relative URL so Vite proxy forwards to http://localhost:3000
  // This avoids CORS entirely — browser talks to localhost:3002, Vite forwards to :3000
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const t = localStorage.getItem('member_token');
  if (t) config.headers.Authorization = 'Bearer ' + t;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('member_token');
      localStorage.removeItem('member_data');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
