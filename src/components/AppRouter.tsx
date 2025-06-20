
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from './auth/LoginPage';
import { SolutionsHub } from '@/pages/SolutionsHub';
import { ObservatoryLanding } from '@/pages/ObservatoryLanding';
import { WelcomeTour } from '@/pages/WelcomeTour';
import Index from '@/pages/Index';
import { CommercialBrain } from '@/pages/CommercialBrain';
import { AdminDashboard } from './admin/AdminDashboard';
import AdminMaster from '@/pages/AdminMaster';
import { AdminRoute } from './AdminRoute';
import { TrialExpirationReminder } from './TrialExpirationReminder';
import { WhatsAppAPIHubPage } from '@/components/WhatsAppAPIHubPage';

export function AppRouter() {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('🌐 AppRouter - Estado:', {
    isAuthenticated,
    isLoading,
    currentPath: window.location.pathname
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Carregando sua experiência...</p>
        </div>
      </div>
    );
  }

  // Verificar se deve mostrar o tour de boas vindas
  const shouldShowWelcomeTour = () => {
    if (!isAuthenticated || !user) return false;
    
    // Verificar se é um novo usuário que deve ver o tour
    const showTour = localStorage.getItem('show_welcome_tour') === 'true';
    const tourCompleted = localStorage.getItem('welcome_tour_completed') === 'true';
    
    // Verificar se é um usuário muito novo (criado há menos de 10 minutos)
    const userCreatedAt = new Date(user.createdAt);
    const now = new Date();
    const minutesSinceCreation = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60);
    const isVeryNewUser = minutesSinceCreation < 10;
    
    console.log('🎯 Verificando tour:', { 
      showTour, 
      tourCompleted, 
      isVeryNewUser,
      minutesSinceCreation,
      userCreatedAt: userCreatedAt.toISOString(),
      shouldShow: (showTour || isVeryNewUser) && !tourCompleted
    });
    
    return (showTour || isVeryNewUser) && !tourCompleted;
  };

  return (
    <>
      {/* Sistema de lembretes para trial expirado */}
      {isAuthenticated && <TrialExpirationReminder />}
      
      <Routes>
        <Route 
          path="/auth" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route 
          path="/welcome" 
          element={isAuthenticated ? <WelcomeTour /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/admin" 
          element={
            isAuthenticated ? (
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/admin/master" 
          element={
            isAuthenticated ? (
              <AdminRoute requiredLevel="super">
                <AdminMaster />
              </AdminRoute>
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/whatsapp-api-hub" 
          element={isAuthenticated ? <WhatsAppAPIHubPage /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/dashboard/*" 
          element={
            isAuthenticated ? (
              shouldShowWelcomeTour() ? (
                <Navigate to="/welcome" replace />
              ) : (
                <Index />
              )
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/commercial/*" 
          element={isAuthenticated ? <CommercialBrain /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/hub" 
          element={isAuthenticated ? <SolutionsHub /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/observatory" 
          element={<ObservatoryLanding />} 
        />
        <Route 
          path="/" 
          element={<ObservatoryLanding />} 
        />
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </>
  );
}
