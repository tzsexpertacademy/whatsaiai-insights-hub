
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
  console.log('Index component rendering - current path:', window.location.pathname);
  
  try {
    console.log('Index - Rendering main layout');
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
                    <Route path="/" element={
                      <>
                        {console.log('Index - Rendering InsightsDashboard')}
                        <InsightsDashboard />
                      </>
                    } />
                    <Route path="/areas" element={
                      <>
                        {console.log('Index - Rendering AreasOfLife')}
                        <AreasOfLife />
                      </>
                    } />
                    <Route path="/profile" element={
                      <>
                        {console.log('Index - Rendering BehavioralProfile')}
                        <BehavioralProfile />
                      </>
                    } />
                    <Route path="/emotions" element={
                      <>
                        {console.log('Index - Rendering EmotionalThermometer')}
                        <EmotionalThermometer />
                      </>
                    } />
                    <Route path="/recommendations" element={
                      <>
                        {console.log('Index - Rendering Recommendations')}
                        <Recommendations />
                      </>
                    } />
                    <Route path="/connection" element={
                      <>
                        {console.log('Index - Rendering WhatsAppConnection')}
                        <WhatsAppConnection />
                      </>
                    } />
                    <Route path="/chat" element={
                      <>
                        {console.log('Index - Rendering ChatInterface')}
                        <ChatInterface />
                      </>
                    } />
                    <Route path="/settings" element={
                      <>
                        {console.log('Index - Rendering SettingsPage')}
                        <SettingsPage />
                      </>
                    } />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>
    );
  } catch (error) {
    console.error('Error in Index component:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro de Renderização no Index</h1>
          <p className="text-gray-600">Erro: {error.message}</p>
          <p className="text-gray-500">Verifique o console para mais detalhes</p>
        </div>
      </div>
    );
  }
};

export default Index;
