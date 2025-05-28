
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
import { MessageSquare, Brain, Sparkles, Settings, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClientConfig } from '@/contexts/ClientConfigContext';

export function DashboardMain() {
  const { isFirstVisit, completed, showDemo } = useOnboarding();
  const { data, isLoading } = useAnalysisData();
  const { config } = useClientConfig();
  const navigate = useNavigate();

  console.log('📊 DashboardMain - Estado atual:', {
    isFirstVisit,
    completed,
    showDemo,
    hasRealData: data.hasRealData,
    isLoading,
    openaiConfigured: !!config.openai?.apiKey
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

  // Status das configurações
  const isOpenAIConfigured = config.openai?.apiKey && config.openai.apiKey.startsWith('sk-');
  const isWhatsAppConfigured = config.whatsapp?.webhookUrl;
  const isFirebaseConfigured = config.firebase?.projectId;

  // Se não tem dados reais ainda - Dashboard de boas-vindas
  if (!data.hasRealData) {
    return (
      <div className="w-full">
        <DashboardHeader />
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Header de Boas-vindas */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Brain className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Observatório da Consciência
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Sua plataforma de análise comportamental está configurada e pronta para uso!
              </p>
            </div>

            {/* Status das Configurações */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Status das Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg border-2 ${isOpenAIConfigured ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${isOpenAIConfigured ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="font-medium">OpenAI</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {isOpenAIConfigured ? '✅ Configurado' : '⚠️ Pendente'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${isWhatsAppConfigured ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${isWhatsAppConfigured ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="font-medium">WhatsApp</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {isWhatsAppConfigured ? '✅ Configurado' : '📋 Opcional'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${isFirebaseConfigured ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${isFirebaseConfigured ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="font-medium">Firebase</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {isFirebaseConfigured ? '✅ Configurado' : '📋 Opcional'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/chat')}>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chat com Assistentes</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Converse com assistentes especializados em análise comportamental
                  </p>
                  <Button className="w-full" disabled={!isOpenAIConfigured}>
                    {isOpenAIConfigured ? 'Iniciar Chat' : 'Configure OpenAI'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/insights')}>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Dashboard Completo</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Visualize métricas, gráficos e análises detalhadas
                  </p>
                  <Button variant="outline" className="w-full">
                    Ver Dashboard
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/settings')}>
                <CardContent className="p-6 text-center">
                  <Settings className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Configurações</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Configure integrações e personalize o sistema
                  </p>
                  <Button variant="outline" className="w-full">
                    Configurar
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Próximos Passos */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Próximos Passos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!isOpenAIConfigured && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                      <span className="text-sm">Configure sua API key da OpenAI para ativar os assistentes</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{isOpenAIConfigured ? '1' : '2'}</div>
                    <span className="text-sm">Inicie uma conversa com os assistentes especializados</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{isOpenAIConfigured ? '2' : '3'}</div>
                    <span className="text-sm">Explore as análises geradas automaticamente</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard com dados reais - análises completas
  return (
    <div className="w-full">
      <DashboardHeader />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Header com dados */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Completo</h1>
            <p className="text-gray-600">Análises comportamentais baseadas em suas conversas</p>
          </div>

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
