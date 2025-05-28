
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardMain } from '@/components/dashboard/DashboardMain';

// Dashboard pages
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
  console.log('📱 Exibindo Dashboard Principal');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        {/* Sidebar fixo */}
        <AppSidebar />
        
        {/* Conteúdo principal que muda */}
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<DashboardMain />} />
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
    </SidebarProvider>
  );
}
