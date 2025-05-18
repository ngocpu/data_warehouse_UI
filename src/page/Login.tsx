import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { login } from '../services/auth/authService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import axiosInstance from '../services/api/apiInstance';

const Login: React.FC = () => {
  const { login: setAuthUser, user, loginDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Nếu đã đăng nhập, chuyển hướng đến dashboard
    if (user) {
      navigate('/dashboard');
      return;
    }
    
    // Kiểm tra lỗi từ quá trình OAuth
    const query = new URLSearchParams(location.search);
    const errorType = query.get('error');
    
    if (errorType) {
      const errorMessages: Record<string, string> = {
        'oauth_error': 'Lỗi xác thực với Google. Vui lòng thử lại.',
        'missing_token': 'Không nhận được token xác thực.',
        'user_info_error': 'Không thể lấy thông tin người dùng.',
        'no_token': 'Không nhận được token từ server.',
        'callback_error': 'Đã xảy ra lỗi khi xử lý đăng nhập.',
        'server_error': 'Lỗi máy chủ khi xử lý đăng nhập.'
      };
      
      setError(errorMessages[errorType] || 'Đã xảy ra lỗi không xác định.');
      return;
    }

    // Xử lý code sau khi đăng nhập Google
    const code = query.get('code');
    if (code) {
      setLoading(true);
      setError(null);
      login(code)
        .then((userData) => {
          setAuthUser(userData);
          navigate('/dashboard');
        })
        .catch((error) => {
          console.error('Đăng nhập thất bại:', error);
          setError('Đăng nhập thất bại. Vui lòng thử lại.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [location, navigate, setAuthUser, user]);

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    
    try {
      // Thêm tham số thời gian để tránh cache
      const timestamp = new Date().getTime();
      // Lấy URL xác thực từ backend
      const response = await axiosInstance.get(`/auth/login?_t=${timestamp}`);
      const { auth_url } = response.data;
      
      // Mở cửa sổ mới để xác thực (tránh vấn đề với cookie/cache)
      window.location.href = auth_url;
    } catch (error) {
      console.error('Không thể lấy URL xác thực:', error);
      setError('Không thể kết nối đến dịch vụ xác thực. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loginDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>Đăng nhập để truy cập vào Data Warehouse OLAP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="mb-4">Sử dụng Google để đăng nhập và xác thực</p>
            {error && <p className="text-destructive mb-4">{error}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <a 
            href="#"
            onClick={handleGoogleLogin}
            className={`w-full flex justify-center items-center bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="mr-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            ) : (
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
                </svg>
              </span>
            )}
            {loading ? 'Đang xử lý...' : 'Đăng nhập với Google'}
          </a>
          
          <button
            onClick={handleDemoLogin}
            className="w-full flex justify-center items-center bg-secondary text-secondary-foreground py-2 rounded-md hover:bg-secondary/80"
            disabled={loading}
          >
            <span className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
              </svg>
            </span>
            Dùng tài khoản demo
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;