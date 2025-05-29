
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from "@/components/ui/badge";
import { MetricCards } from '@/components/dashboard/MetricCards';
import { LifeAreasMap } from '@/components/dashboard/LifeAreasMap';
import { EmotionalChart } from '@/components/dashboard/EmotionalChart';
import { PsychologicalProfile } from '@/components/dashboard/PsychologicalProfile';
import { SkillsCards } from '@/components/dashboard/SkillsCards';
import { InsightsAlerts } from '@/components/dashboard/InsightsAlerts';
import { RecommendationsSection } from '@/components/dashboard/RecommendationsSection';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { PageHeader } from '@/components/PageHeader';

export function InsightsDashboard() {
  const { user } = useAuth();
  const { data } = useAnalysisData();
  
  // Debug: Log para verificar dados dos assistentes
  console.log('🔍 DEBUG InsightsDashboard - Dados dos assistentes:', {
    hasRealData: data.hasRealData,
    insightsWithAssistant: data.insightsWithAssistant?.length || 0,
    assistantsActive: data.metrics.assistantsActive
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="YumerMind da Consciência"
        subtitle="Um espelho da sua mente, comportamentos e evolução pessoal"
      >
        <Badge className="bg-purple-100 text-purple-800">
          🔮 {data.metrics.assistantsActive} Assistentes Ativos
        </Badge>
        <Badge className="bg-blue-100 text-blue-800">
          📊 {data.insightsWithAssistant?.length || 0} Insights Gerados
        </Badge>
        <AIAnalysisButton />
      </PageHeader>

      <div className="p-4 md:p-6 space-y-6">
        {/* Métricas principais */}
        <MetricCards />

        {/* Mapa de Áreas da Vida e Termômetro Emocional */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <LifeAreasMap />
          <EmotionalChart />
        </div>

        {/* Perfil Psicológico */}
        <PsychologicalProfile />

        {/* Habilidades e Desenvolvimento */}
        <SkillsCards />

        {/* Insights e alertas */}
        <InsightsAlerts />

        {/* Recomendações */}
        <RecommendationsSection />
      </div>
    </div>
  );
}
