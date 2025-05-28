
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from "@/components/ui/sidebar";
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
import { ChatInterface } from '@/components/ChatInterface';
import { ChatWithAssistants } from '@/components/ChatWithAssistants';

export default function Index() {
  console.log('📱 Exibindo Dashboard Principal');

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full flex">
        <AppSidebar />
        <main className="flex-1 w-full bg-gray-50 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardMain />} />
            <Route path="/dashboard" element={<DashboardMain />} />
            <Route path="/dashboard/thermometer" element={<EmotionalThermometer />} />
            <Route path="/dashboard/areas" element={<AreasOfLife />} />
            <Route path="/dashboard/behavioral" element={<BehavioralProfile />} />
            <Route path="/dashboard/chat" element={<ChatWithAssistants />} />
            <Route path="/dashboard/timeline" element={<ObservatoryTimeline />} />
            <Route path="/dashboard/insights" element={<InsightsDashboard />} />
            <Route path="/dashboard/recommendations" element={<Recommendations />} />
            <Route path="/dashboard/pain-points" element={<PainPointsAnalysis />} />
            <Route path="/dashboard/documents" element={<DocumentAnalysis />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            
            {/* Rotas legacy para compatibilidade */}
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
            <Route path="/chat" element={<ChatInterface />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
}
