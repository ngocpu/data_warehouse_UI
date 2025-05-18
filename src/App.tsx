import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './page/Login';
import DashBoard from './page/DashBoard';
import OlapExploler from './page/OlapExploler';
import DataVisualization from './page/DataVisualization';
import ManagerReport from './page/ManagerReport';
import React from 'react';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/olap" element={<OlapExploler />} />
          <Route path="/visualization" element={<DataVisualization />} />
          <Route path="/reports" element={<ManagerReport />} />
          <Route path="/" element={<DashBoard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;