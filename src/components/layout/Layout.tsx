import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Chuyển hướng từ đường dẫn gốc sang dashboard nếu đã đăng nhập
  useEffect(() => {
    if (!loading && user && location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [location.pathname, user, loading, navigate]);

  // Các trang không yêu cầu đăng nhập
  const publicPages = ['/auth/login', '/auth/callback'];
  const isPublicPage = publicPages.includes(location.pathname);
  
  // Kiểm tra trang công khai
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Hiển thị loading khi đang kiểm tra đăng nhập
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Chuyển hướng nếu không có user
  if (!user) {
    navigate('/auth/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-6 py-3 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Data Warehouse OLAP</h1>
          {user && (
            <div className="flex items-center gap-4">
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span>{user.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-primary-foreground text-primary rounded-md hover:bg-opacity-90"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-muted p-4 hidden md:block">
          <nav className="space-y-2">
            <Link
              to="/dashboard"
              className={`block px-4 py-2 rounded-md ${
                location.pathname === '/dashboard'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-primary/10'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/olap"
              className={`block px-4 py-2 rounded-md ${
                location.pathname === '/olap'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-primary/10'
              }`}
            >
              OLAP Explorer
            </Link>
            <Link
              to="/visualization"
              className={`block px-4 py-2 rounded-md ${
                location.pathname === '/visualization'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-primary/10'
              }`}
            >
              Data Visualization
            </Link>
            <Link
              to="/reports"
              className={`block px-4 py-2 rounded-md ${
                location.pathname === '/reports'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-primary/10'
              }`}
            >
              Manager Reports
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-background">{children}</main>
      </div>

      {/* Footer */}
      <footer className="bg-muted px-6 py-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} - Data Warehouse OLAP Dashboard</p>
      </footer>
    </div>
  );
};

export default Layout; 