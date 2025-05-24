import React from 'react';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Observatório da Consciência</h1>
          <p className="text-slate-600">Um espelho da sua mente, comportamentos e evolução pessoal</p>
        </div>
        
        {/* Botão de Análise por IA no Dashboard */}
        <div className="flex items-center gap-3">
          <AIAnalysisButton />
        </div>
      </div>

      {/* Métricas principais */}
      <MetricCards />

      {/* Mapa de Áreas da Vida e Termômetro Emocional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
