
import React from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { OnboardingExperience } from '@/components/onboarding/OnboardingExperience';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { EmotionalChart } from '@/components/dashboard/EmotionalChart';
import { LifeAreasMap } from '@/components/dashboard/LifeAreasMap';
import { PsychologicalProfile } from '@/components/dashboard/PsychologicalProfile';
import { SkillsCards } from '@/components/dashboard/SkillsCards';
import { InsightsAlerts } from '@/components/dashboard/InsightsAlerts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Brain, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardMain() {
  const { isFirstVisit, completed, showDemo } = useOnboarding();
  const { data, isLoading } = useAnalysisData();
  const navigate = useNavigate();

  console.log('📊 DashboardMain - Estado atual:', {
    isFirstVisit,
    completed,
    showDemo,
    hasRealData: data.hasRealData,
    isLoading
  });

  // Se é primeira visita, mostra experiência de onboarding
  if (isFirstVisit && !completed) {
    return <OnboardingExperience />;
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <DashboardHeader />
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Carregando seu observatório...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se não tem dados reais ainda
  if (!data.hasRealData) {
    return (
      <div className="w-full">
        <DashboardHeader />
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="text-center">
                <CardTitle className="text-xl sm:text-2xl text-blue-800 flex items-center justify-center gap-2">
                  <Brain className="w-6 h-6 sm:w-8 sm:h-8" />
                  Observatório da Consciência
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-blue-600 text-base sm:text-lg">
                  Sua plataforma está pronta! Comece conversando com nossos assistentes especializados.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                    onClick={() => navigate('/dashboard/chat')}
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Começar no Chat
                  </Button>
                  
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Ver Tutorial
                  </Button>
                </div>

                <div className="text-sm text-gray-500 space-y-2">
                  <p>✅ Sistema configurado e operacional</p>
                  <p>💬 Pronto para suas primeiras conversas</p>
                  <p>🧠 IA preparada para análise personalizada</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Se tem dados reais - mostra dashboard completo com gráficos
  return (
    <div className="w-full">
      <DashboardHeader />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Métricas principais */}
          <MetricCards />

          {/* Gráficos principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmotionalChart />
            <LifeAreasMap />
          </div>

          {/* Perfil psicológico */}
          <PsychologicalProfile />

          {/* Habilidades */}
          <SkillsCards />

          {/* Insights e alertas */}
          <InsightsAlerts />
        </div>
      </div>
    </div>
  );
}
