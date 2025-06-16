
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardMain } from '@/components/dashboard/DashboardMain';
import { AnalysisDataProvider } from '@/contexts/AnalysisDataContext';

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
import { VoiceChatInterface } from '@/components/VoiceChatInterface';
import { NotificationsPage } from '@/components/NotificationsPage';
import { RoutinePage } from '@/components/RoutinePage';
import { ConversationAnalysisDashboard } from '@/components/whatsapp/ConversationAnalysisDashboard';

// New consciousness dimension pages
import { ConscienciaPropositoPage } from '@/components/consciousness/ConscienciaPropositoPage';
import { AcaoProdutiviidadePage } from '@/components/consciousness/AcaoProdutiviidadePage';
import { GestaoRecursosPage } from '@/components/consciousness/GestaoRecursosPage';
import { CorpoVitalidadePage } from '@/components/consciousness/CorpoVitalidadePage';
import { RelacoesImpactoPage } from '@/components/consciousness/RelacoesImpactoPage';

export default function Index() {
  console.log('📱 Exibindo Dashboard Principal');

  return (
    <AnalysisDataProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen w-full flex">
          <AppSidebar />
          <main className="flex-1 w-full bg-gray-50 overflow-auto">
            <Routes>
              {/* Dashboard Central - Análise Global */}
              <Route path="/" element={<DashboardMain />} />
              <Route path="/dashboard" element={<DashboardMain />} />
              
              {/* Dimensões da Consciência */}
              <Route path="/dashboard/consciencia-proposito" element={<ConscienciaPropositoPage />} />
              <Route path="/dashboard/acao-produtividade" element={<AcaoProdutiviidadePage />} />
              <Route path="/dashboard/gestao-recursos" element={<GestaoRecursosPage />} />
              <Route path="/dashboard/corpo-vitalidade" element={<CorpoVitalidadePage />} />
              <Route path="/dashboard/relacoes-impacto" element={<RelacoesImpactoPage />} />
              
              {/* Análise de Conversas - Permanece independente */}
              <Route path="/dashboard/conversation-analysis" element={<ConversationAnalysisDashboard />} />
              
              {/* Chat com Assistentes */}
              <Route path="/dashboard/chat" element={<VoiceChatInterface />} />
              
              {/* Sistema */}
              <Route path="/dashboard/timeline" element={<ObservatoryTimeline />} />
              <Route path="/dashboard/notifications" element={<NotificationsPage />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route path="/dashboard/profile" element={<ProfilePage />} />
              
              {/* Páginas que agora estão integradas no Dashboard Geral - mantidas para compatibilidade */}
              <Route path="/dashboard/thermometer" element={<DashboardMain />} />
              <Route path="/dashboard/areas" element={<DashboardMain />} />
              <Route path="/dashboard/behavioral" element={<DashboardMain />} />
              <Route path="/dashboard/insights" element={<DashboardMain />} />
              
              {/* Outras páginas do sistema */}
              <Route path="/dashboard/whatsapp" element={<ChatInterface />} />
              <Route path="/dashboard/recommendations" element={<Recommendations />} />
              <Route path="/dashboard/pain-points" element={<PainPointsAnalysis />} />
              <Route path="/dashboard/routine" element={<RoutinePage />} />
              <Route path="/dashboard/documents" element={<DocumentAnalysis />} />
              
              {/* Rotas legacy para compatibilidade */}
              <Route path="/observatory" element={<ObservatoryTimeline />} />
              <Route path="/thermometer" element={<DashboardMain />} />
              <Route path="/areas" element={<DashboardMain />} />
              <Route path="/behavioral" element={<DashboardMain />} />
              <Route path="/conversation-analysis" element={<ConversationAnalysisDashboard />} />
              <Route path="/timeline" element={<ObservatoryTimeline />} />
              <Route path="/insights" element={<DashboardMain />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/pain-points" element={<PainPointsAnalysis />} />
              <Route path="/routine" element={<RoutinePage />} />
              <Route path="/documents" element={<DocumentAnalysis />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/chat" element={<VoiceChatInterface />} />
              <Route path="/whatsapp" element={<ChatInterface />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Routes>
          </main>
        </div>
      </SidebarProvider>
    </AnalysisDataProvider>
  );
}
