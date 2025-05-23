
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { InsightsDashboard } from '@/components/InsightsDashboard';
import { AreasOfLife } from '@/components/AreasOfLife';
import { BehavioralProfile } from '@/components/BehavioralProfile';
import { EmotionalThermometer } from '@/components/EmotionalThermometer';
import { Recommendations } from '@/components/Recommendations';

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
                <Route path="/areas" element={<AreasOfLife />} />
                <Route path="/profile" element={<BehavioralProfile />} />
                <Route path="/emotions" element={<EmotionalThermometer />} />
                <Route path="/recommendations" element={<Recommendations />} />
              </Routes>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Index;
