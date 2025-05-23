
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/components/auth/LoginPage';
import Index from '@/pages/Index';

export function AppRouter() {
  const { isAuthenticated, login, isLoading } = useAuth();

  console.log('AppRouter - Estado atual:', {
    isAuthenticated,
    isLoading,
    currentPath: window.location.pathname
  });

  if (isLoading) {
    console.log('AppRouter - Exibindo tela de carregamento');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('AppRouter - Usuário não autenticado, exibindo login');
    return <LoginPage onLogin={login} />;
  }

  console.log('AppRouter - Usuário autenticado, renderizando aplicação principal');
  try {
    return <Index />;
  } catch (error) {
    console.error('AppRouter - Erro ao renderizar Index:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro no AppRouter</h1>
          <p className="text-gray-600">Erro: {error.message}</p>
          <p className="text-gray-500">Verifique o console do navegador para mais detalhes</p>
        </div>
      </div>
    );
  }
}
