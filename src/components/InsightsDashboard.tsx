
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { MetricCards } from '@/components/dashboard/MetricCards';
import { LifeAreasMap } from '@/components/dashboard/LifeAreasMap';
import { EmotionalChart } from '@/components/dashboard/EmotionalChart';
import { PsychologicalProfile } from '@/components/dashboard/PsychologicalProfile';
import { SkillsCards } from '@/components/dashboard/SkillsCards';
import { InsightsAlerts } from '@/components/dashboard/InsightsAlerts';
import { RecommendationsSection } from '@/components/dashboard/RecommendationsSection';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';

export function InsightsDashboard() {
  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Observatório da Consciência</h1>
          <p className="text-slate-600 text-sm sm:text-base">Um espelho da sua mente, comportamentos e evolução pessoal</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-purple-100 text-purple-800">Operacional</Badge>
          <Badge className="bg-blue-100 text-blue-800">Dados Atualizados</Badge>
          <AIAnalysisButton />
        </div>
      </div>

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
  );
}
