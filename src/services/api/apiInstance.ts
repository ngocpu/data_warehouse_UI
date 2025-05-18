import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import axiosConfig from './apiConfig';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: any;

const axiosInstance = axios.create(axiosConfig);

// Add token to request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    console.log('Request interceptor - token exists:', !!token);
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    console.log('Response interceptor error:', error.response?.status);
    
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Attempting token refresh...');

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          console.log('No refresh token available');
          throw new Error('No refresh token');
        }
        
        // Chắc chắn gửi refresh_token trong body request
        const response = await axios.post(
          `${axiosConfig.baseURL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        console.log('Refresh token response:', response.status);
        
        if (response.data && response.data.access_token) {
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          // Cập nhật header cho request ban đầu
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

          console.log('Token refreshed successfully');
          return axiosInstance(originalRequest);
        } else {
          console.log('Invalid refresh response:', response.data);
          throw new Error('Invalid refresh response');
        }
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        
        // Xóa token và chuyển hướng đến trang đăng nhập
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login?error=session_expired';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;