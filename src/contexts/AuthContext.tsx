import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserData } from '../services/auth/authService';
import { getCurrentUser } from '../services/auth/authService';

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (userData: UserData) => void;
  logout: () => void;
  loginDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const checkLoggedIn = async () => {
      console.log("AuthContext: Kiểm tra đăng nhập");
      
      try {
        // Trước tiên kiểm tra xem có token không
        const token = window.localStorage.getItem('access_token');
        
        if (!token) {
          console.log("AuthContext: Không tìm thấy token");
          setLoading(false);
          return;
        }
        
        console.log("AuthContext: Token tồn tại, kiểm tra thông tin người dùng");
        const userData = await getCurrentUser();
        
        if (userData) {
          console.log("AuthContext: Đã lấy thông tin người dùng:", userData.email);
          setUser(userData);
        } else {
          console.log("AuthContext: Không lấy được thông tin người dùng");
          // Xóa token không hợp lệ
          window.localStorage.removeItem('access_token');
          window.localStorage.removeItem('refresh_token');
        }
      } catch (error) {
        console.error('AuthContext: Lỗi kiểm tra đăng nhập:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = (userData: UserData) => {
    console.log("AuthContext: Đăng nhập thành công với:", userData.email);
    setUser(userData);
  };

  const logout = () => {
    console.log("AuthContext: Đang đăng xuất");
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('access_token');
      window.localStorage.removeItem('refresh_token');
    }
    setUser(null);
  };

  // Phương thức đăng nhập demo không cần API
  const loginDemo = () => {
    console.log("AuthContext: Đăng nhập demo");
    const demoUser: UserData = {
      email: 'demo@example.com',
      name: 'Người dùng Demo',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff'
    };
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('access_token', 'demo_token');
      window.localStorage.setItem('refresh_token', 'demo_refresh_token');
    }
    
    setUser(demoUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, loginDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};