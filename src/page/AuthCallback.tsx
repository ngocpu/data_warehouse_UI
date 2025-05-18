import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: setAuthUser } = useAuth();

  useEffect(() => {
    const processAuthCallback = async () => {
      console.log('👉 AuthCallback: Bắt đầu xử lý callback');
      console.log('👉 AuthCallback: URL params', Object.fromEntries([...searchParams]));
      
      try {
        // Lấy dữ liệu từ URL
        const token = searchParams.get('token')?.replace(/-/g, '.'); // Giải mã token
        const refreshToken = searchParams.get('refresh_token');
        const email = searchParams.get('email') || '';
        const name = searchParams.get('name') || '';
        const avatar = searchParams.get('avatar') || '';
        
        console.log('👉 AuthCallback: token', token ? 'Có token' : 'Không có token');
        console.log('👉 AuthCallback: email', email);

        if (!token) {
          console.error('Không nhận được token từ server');
          navigate('/auth/login?error=no_token');
          return;
        }

        // Lưu token vào localStorage
        if (typeof window !== 'undefined') {
          console.log('👉 AuthCallback: Đang lưu token vào localStorage');
          window.localStorage.setItem('access_token', token);
          if (refreshToken) {
            window.localStorage.setItem('refresh_token', refreshToken);
          }
        }

        // Cập nhật thông tin người dùng trong AuthContext
        const userData = {
          email,
          name,
          avatar
        };
        
        console.log('👉 AuthCallback: Đang cập nhật thông tin người dùng', userData);
        setAuthUser(userData);
        
        // Chuyển hướng đến dashboard
        console.log('👉 AuthCallback: Đang chuyển hướng đến dashboard');
        navigate('/dashboard');
      } catch (error) {
        console.error('👉 Lỗi xử lý callback:', error);
        navigate('/auth/login?error=callback_error');
      }
    };

    processAuthCallback();
  }, [navigate, searchParams, setAuthUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-foreground">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
};

export default AuthCallback; 