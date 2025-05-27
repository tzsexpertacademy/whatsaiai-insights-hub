
import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useOnboarding } from '@/hooks/useOnboarding';
import { WelcomeExperience } from '@/components/onboarding/WelcomeExperience';
import { GuidedTour } from '@/components/onboarding/GuidedTour';

// Dashboard pages
import { MetricCards } from '@/components/dashboard/MetricCards';
import { ObservatoryTimeline } from '@/components/ObservatoryTimeline';
import { EmotionalThermometer } from '@/components/EmotionalThermometer';
import { AreasOfLife } from '@/components/AreasOfLife';
import { BehavioralProfile } from '@/components/BehavioralProfile';
import { InsightsDashboard } from '@/components/InsightsDashboard';
import { Recommendations } from '@/components/Recommendations';
import { PainPointsAnalysis } from '@/components/PainPointsAnalysis';
import { DocumentAnalysis } from '@/components/DocumentAnalysis';
import { SettingsPage } from '@/components/SettingsPage';
import { ProfilePage } from '@/components/ProfilePage';

export default function Index() {
  const location = useLocation();
  const { 
    isFirstVisit, 
    showTour, 
    completed,
    completeTour,
    skipOnboarding 
  } = useOnboarding();

  console.log('📊 Estado atual do onboarding:', {
    isFirstVisit,
    showTour,
    completed,
    url: location.pathname,
    currentPath: window.location.pathname
  });

  // Se é primeira visita e não completou o onboarding, mostra welcome
  // APENAS se estiver na rota /dashboard (sem sub-rotas)
  if (isFirstVisit && !completed && location.pathname === '/dashboard') {
    console.log('🎬 Exibindo WelcomeExperience');
    return <WelcomeExperience />;
  }

  console.log('📱 Exibindo Dashboard Principal');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<MetricCards />} />
              <Route path="/observatory" element={<ObservatoryTimeline />} />
              <Route path="/thermometer" element={<EmotionalThermometer />} />
              <Route path="/areas" element={<AreasOfLife />} />
              <Route path="/behavioral" element={<BehavioralProfile />} />
              <Route path="/timeline" element={<ObservatoryTimeline />} />
              <Route path="/insights" element={<InsightsDashboard />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/pain-points" element={<PainPointsAnalysis />} />
              <Route path="/documents" element={<DocumentAnalysis />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* Tour guiado quando necessário */}
      {showTour && (
        <GuidedTour 
          onComplete={completeTour}
          onSkip={skipOnboarding}
        />
      )}
    </SidebarProvider>
  );
}
