import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './page/Login';
import DashBoard from './page/DashBoard';
import OlapExploler from './page/OlapExploler';
import DataVisualization from './page/DataVisualization';
import ManagerReport from './page/ManagerReport';
import AuthCallback from './page/AuthCallback';
import React from 'react';
import Layout from './components/layout/Layout';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<DashBoard />} />
            <Route path="/olap" element={<OlapExploler />} />
            <Route path="/visualization" element={<DataVisualization />} />
            <Route path="/reports" element={<ManagerReport />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;