import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import StaffPortal from './pages/StaffPortal.jsx';
import MaxAiDemo from './pages/MaxAiDemo.jsx';
import Workspace from './pages/Workspace.jsx';
import ForgeFeed from './pages/ForgeFeed.jsx';
import LiveArena from './pages/LiveArena.jsx';
import MaintenancePage from './pages/MaintenancePage.jsx';
import PermissionsModal from './components/PermissionsModal.jsx';
import SeasonalEffects from './components/SeasonalEffects.jsx';
import ForgeChest from './components/ForgeChest.jsx';
import SocialsDock from './components/SocialsDock.jsx';
import { isMaintenanceMode, getMaintenanceMessage } from './data/analytics.js';

function ProtectedRoute({ children, requiredPermission }) {
  const { currentUser, isLoading, can } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!currentUser) return <Navigate to="/login" replace />;
  if (requiredPermission && !can(requiredPermission)) return <Navigate to="/dashboard" replace />;
  return children;
}

// Maintenance gate — allows founder/staff to bypass
function MaintenanceGate({ children }) {
  const { currentUser, can } = useAuth();
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    const check = () => setMaintenance(isMaintenanceMode());
    check();
    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, []);

  // Founder and staff bypass maintenance mode
  if (maintenance && !(currentUser && (can('toggle_maintenance') || can('view_staff_portal')))) {
    return <MaintenancePage message={getMaintenanceMessage()} />;
  }

  return children;
}

function AppRoutes() {
  const { currentUser } = useAuth();
  return (
    <MaintenanceGate>
      <Routes>
        <Route path="/" element={currentUser ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/max-ai" element={<MaxAiDemo />} />
        <Route path="/login" element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/workspace" element={
          <ProtectedRoute requiredPermission="use_workspace"><Workspace /></ProtectedRoute>
        } />
        <Route path="/feed" element={
          <ProtectedRoute><ForgeFeed /></ProtectedRoute>
        } />
        <Route path="/live" element={
          <ProtectedRoute><LiveArena /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requiredPermission="view_admin"><AdminPanel /></ProtectedRoute>
        } />
        <Route path="/staff" element={
          <ProtectedRoute requiredPermission="view_staff_portal"><StaffPortal /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MaintenanceGate>
  );
}

export default function App() {
  useEffect(() => {
    const applyTheme = () => {
      const theme = localStorage.getItem('mfs_theme') || 'obsidian';
      document.documentElement.setAttribute('data-theme', theme);
      
      let accent = '#10B981'; 
      let bg = '#050508';
      if (theme === 'forge-red') {
        accent = '#EF4444';
        bg = '#0a0505';
      } else if (theme === 'deep-navy') {
        accent = '#6366F1';
        bg = '#04040f';
      } else if (theme === 'chrome') {
        accent = '#a0a0b0';
        bg = '#0a0a0d';
      }
      document.documentElement.style.setProperty('--color-moss-green', accent);
      document.documentElement.style.setProperty('--color-cyber-blue', accent); 
      document.documentElement.style.setProperty('--color-obsidian-void', bg);
    };

    applyTheme();

    window.addEventListener('storage', applyTheme);
    const interval = setInterval(applyTheme, 800); 
    return () => {
      window.removeEventListener('storage', applyTheme);
      clearInterval(interval);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(13,13,18,0.95)',
              color: '#F3F4F6',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#050508' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#050508' } },
          }}
        />
        <PermissionsModal />
        <SeasonalEffects />
        <ForgeChest />
        <SocialsDock />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
