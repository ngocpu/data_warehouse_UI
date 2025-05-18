const axiosConfig = {
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default axiosConfig;