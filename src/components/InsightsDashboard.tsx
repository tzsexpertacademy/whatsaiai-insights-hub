
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
import { PageLayout } from '@/components/layout/PageLayout';
import { responsiveContainerClasses } from '@/utils/responsiveUtils';

export function InsightsDashboard() {
  const { user } = useAuth();
  const { data } = useAnalysisData();
  
  // Debug: Log para verificar dados dos assistentes
  console.log('🔍 DEBUG InsightsDashboard - Dados dos assistentes:', {
    hasRealData: data.hasRealData,
    insightsWithAssistant: data.insightsWithAssistant?.length || 0,
    assistantsActive: data.metrics.assistantsActive
  });

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Badge className="bg-purple-100 text-purple-800 text-xs sm:text-sm">
        🔮 {data.metrics.assistantsActive} Assistentes Ativos
      </Badge>
      <Badge className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
        📊 {data.insightsWithAssistant?.length || 0} Insights Gerados
      </Badge>
      <AIAnalysisButton />
    </div>
  );
  
  return (
    <PageLayout
      title="YumerMind da Consciência"
      description="Um espelho da sua mente, comportamentos e evolução pessoal"
      headerActions={headerActions}
    >
      {/* Métricas principais */}
      <MetricCards />

      {/* Mapa de Áreas da Vida e Termômetro Emocional */}
      <div className={responsiveContainerClasses.grid.twoColumns}>
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
    </PageLayout>
  );
}
