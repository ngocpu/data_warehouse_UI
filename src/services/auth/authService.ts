import axiosInstance from "../api/apiInstance";

export interface UserData {
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_data: UserData;
}

// Khai báo để TypeScript hiểu localStorage tồn tại
declare global {
  interface Window {
    localStorage: Storage;
  }
}

export const login = async (code: string): Promise<UserData> => {
  try {
    console.log('Đang xử lý đăng nhập với code...');
    
    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    const response = await axiosInstance.get(`/auth/callback?code=${code}&_t=${timestamp}`);
    
    console.log('Phản hồi từ server:', response.status);
    
    const { access_token, refresh_token, user_data } = response.data as AuthResponse;
    
    if (!access_token || !user_data) {
      console.error('Dữ liệu phản hồi không hợp lệ:', response.data);
      throw new Error('Phản hồi không hợp lệ');
    }
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('access_token', access_token);
      if (refresh_token) {
        window.localStorage.setItem('refresh_token', refresh_token);
      }
    }
    
    console.log('Đăng nhập thành công:', user_data.email);
    return user_data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const refresh = async (refreshToken: string): Promise<string> => {
  try {
    const response = await axiosInstance.post('/auth/refresh', { refresh_token: refreshToken });
    const { access_token } = response.data;
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('access_token', access_token);
    }
    return access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<UserData | null> => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const token = window.localStorage.getItem('access_token');
  
  if (!token) {
    return null;
  }
  
  try {
    if (token === 'demo_token') {
      // Trả về user mẫu cho demo mode
      return {
        email: 'demo@example.com',
        name: 'Người dùng Demo',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff'
      };
    }
    
    // Sử dụng endpoint đúng từ API backend
    const response = await axiosInstance.get('/auth/me');
    return response.data as UserData;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};