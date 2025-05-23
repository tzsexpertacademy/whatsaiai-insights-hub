
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { WhatsAppConnection } from '@/components/WhatsAppConnection';
import { ChatInterface } from '@/components/ChatInterface';
import { InsightsDashboard } from '@/components/InsightsDashboard';
import { AnalyticsPage } from '@/components/AnalyticsPage';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <DashboardHeader />
            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<InsightsDashboard />} />
                <Route path="/connection" element={<WhatsAppConnection />} />
                <Route path="/chat" element={<ChatInterface />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Index;
