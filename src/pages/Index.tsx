
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { InsightsDashboard } from '@/components/InsightsDashboard';
import { AreasOfLife } from '@/components/AreasOfLife';
import { BehavioralProfile } from '@/components/BehavioralProfile';
import { EmotionalThermometer } from '@/components/EmotionalThermometer';
import { Recommendations } from '@/components/Recommendations';
import { WhatsAppConnection } from '@/components/WhatsAppConnection';
import { ChatInterface } from '@/components/ChatInterface';
import { SettingsPage } from '@/components/SettingsPage';

const Index = () => {
  console.log('Index component rendering');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <DashboardHeader />
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
              <div className="max-w-7xl mx-auto">
                <Routes>
                  <Route path="/" element={<InsightsDashboard />} />
                  <Route path="/areas" element={<AreasOfLife />} />
                  <Route path="/profile" element={<BehavioralProfile />} />
                  <Route path="/emotions" element={<EmotionalThermometer />} />
                  <Route path="/recommendations" element={<Recommendations />} />
                  <Route path="/connection" element={<WhatsAppConnection />} />
                  <Route path="/chat" element={<ChatInterface />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Index;
