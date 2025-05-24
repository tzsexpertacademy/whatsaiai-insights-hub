
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from './auth/LoginPage';
import Index from '@/pages/Index';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminRoute } from './AdminRoute';

export function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🎯 AppRouter - Estado atual:', {
    isAuthenticated,
    isLoading,
    currentPath: window.location.pathname
  });

  if (isLoading) {
    console.log('🔄 AppRouter - Carregando autenticação...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  console.log('✅ AppRouter - Renderizando rotas, isAuthenticated:', isAuthenticated);

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={
          isAuthenticated ? (
            <>
              {console.log('🔀 Redirecionando usuário autenticado de /auth para /')}
              <Navigate to="/" replace />
            </>
          ) : (
            <>
              {console.log('📝 Renderizando LoginPage')}
              <LoginPage />
            </>
          )
        } 
      />
      <Route 
        path="/admin" 
        element={
          isAuthenticated ? (
            <>
              {console.log('🔐 Renderizando AdminRoute')}
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </>
          ) : (
            <>
              {console.log('🔀 Redirecionando usuário não autenticado de /admin para /auth')}
              <Navigate to="/auth" replace />
            </>
          )
        } 
      />
      <Route 
        path="/*" 
        element={
          isAuthenticated ? (
            <>
              {console.log('🏠 Renderizando Index (app principal)')}
              <Index />
            </>
          ) : (
            <>
              {console.log('🔀 Redirecionando usuário não autenticado para /auth')}
              <Navigate to="/auth" replace />
            </>
          )
        } 
      />
    </Routes>
  );
}
