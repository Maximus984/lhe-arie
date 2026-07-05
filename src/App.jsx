import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import StaffPortal from './pages/StaffPortal.jsx';
import MaxAiDemo from './pages/MaxAiDemo.jsx';

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

function AppRoutes() {
  const { currentUser } = useAuth();
  return (
    <Routes>
      <Route path="/" element={currentUser ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/max-ai" element={<MaxAiDemo />} />
      <Route path="/login" element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute requiredPermission="view_admin"><AdminPanel /></ProtectedRoute>
      } />
      <Route path="/staff" element={
        <ProtectedRoute requiredPermission="view_staff_portal"><StaffPortal /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
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
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
