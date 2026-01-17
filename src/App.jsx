import React from 'react';
// Rebuild Trigger
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ConfigScreen from './pages/ConfigScreen';
import LoginScreen from './pages/LoginScreen';
import History from './pages/History'; // New Import
import LocationManager from './components/LocationManager';
import LiveMap from './components/LiveMap';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RideProvider } from './contexts/RideContext';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const { config, loading: configLoading } = useConfig();

  if (authLoading || configLoading) return <div style={{ padding: '20px', color: 'white' }}>Loading...</div>;

  // 1. Must be logged in
  if (!currentUser) return <Navigate to="/login" />;

  // 2. Must have config (except if we are ON the config screen logic, typically handled by routing structure)
  // Here we check if config is missing, redirect to config setup
  if (!config) return <Navigate to="/config" />;

  return children;
};

// Config Route wrapper (Must be logged in to set config)
const ConfigRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  const { config } = useConfig();

  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />

      <Route path="/config" element={
        <ConfigRoute>
          {config ? <Navigate to="/" /> : <ConfigScreen />}
        </ConfigRoute>
      } />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="map" element={<LiveMap />} />
        <Route path="history" element={<History />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <RideProvider>
          <LocationManager />
          <Router>
            <AppRoutes />
          </Router>
        </RideProvider>
      </ConfigProvider>
    </AuthProvider>
  );
}

export default App;
