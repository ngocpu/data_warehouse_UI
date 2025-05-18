import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { login } from '../services/auth/authService';

const Login: React.FC = () => {
  const { login: setAuthUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const code = query.get('code');
    if (code) {
      login(code).then((userData) => {
        setAuthUser(userData);
        navigate('/dashboard');
      }).catch((error) => {
        console.error('Login failed:', error);
      });
    }
  }, [location, navigate, setAuthUser]);

  return (
    <div>
      <h1>Login with Google</h1>
      <a href="http://localhost:8000/auth/login">Login</a>
    </div>
  );
};

export default Login;