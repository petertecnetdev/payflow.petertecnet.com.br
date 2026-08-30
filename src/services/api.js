import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://api.petertecnet.com.br/api',
  timeout: 20000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('petertecnet_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-Peter-App'] = 'payflow';
  return config;
});

export default api;
