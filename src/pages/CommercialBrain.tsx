
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import { CommercialSidebar } from '@/components/commercial/CommercialSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { CommercialAnalysisDataProvider } from '@/contexts/CommercialAnalysisDataContext';
import { CommercialDashboard } from '@/components/commercial/CommercialDashboard';
import { FunnelAnalysis } from '@/components/commercial/FunnelAnalysis';
import { SalesPerformance } from '@/components/commercial/SalesPerformance';
import { BehavioralMetrics } from '@/components/commercial/BehavioralMetrics';
import { TeamCulture } from '@/components/commercial/TeamCulture';
import { CommercialPainPoints } from '@/components/commercial/CommercialPainPoints';
import { CommercialTimeline } from '@/components/commercial/CommercialTimeline';
import { StrategicMetrics } from '@/components/commercial/StrategicMetrics';
import { CommercialSettingsPage } from '@/components/commercial/CommercialSettingsPage';
import { CommercialDocumentAnalysis } from '@/components/commercial/CommercialDocumentAnalysis';
import { CommercialRecommendations } from '@/components/commercial/CommercialRecommendations';

export function CommercialBrain() {
  console.log('CommercialBrain component rendering');
  
  return (
    <CommercialAnalysisDataProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 overflow-x-hidden">
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full">
            <CommercialSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <DashboardHeader />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                <div className="max-w-7xl mx-auto w-full">
                  <Routes>
                    <Route path="/" element={<CommercialDashboard />} />
                    <Route path="/funnel" element={<FunnelAnalysis />} />
                    <Route path="/performance" element={<SalesPerformance />} />
                    <Route path="/behavioral" element={<BehavioralMetrics />} />
                    <Route path="/culture" element={<TeamCulture />} />
                    <Route path="/pain-points" element={<CommercialPainPoints />} />
                    <Route path="/timeline" element={<CommercialTimeline />} />
                    <Route path="/strategic" element={<StrategicMetrics />} />
                    <Route path="/analysis" element={<CommercialDocumentAnalysis />} />
                    <Route path="/recommendations" element={<CommercialRecommendations />} />
                    <Route path="/settings" element={<CommercialSettingsPage />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </CommercialAnalysisDataProvider>
  );
}
