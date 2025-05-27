import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { DemoDashboard } from '@/components/onboarding/DemoData';
import { 
  Brain, 
  Heart, 
  TrendingUp, 
  Target, 
  Users, 
  MessageSquare,
  Sparkles,
  AlertCircle,
  Activity
} from 'lucide-react';

export function MetricCards() {
  const { data, isLoading } = useAnalysisData();
  const { showDemo } = useOnboarding();

  // Show demo data if in demo mode or no real data
  if (showDemo || !data.hasRealData) {
    return <DemoDashboard />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalInsights = data.insights?.length || 0;
  const totalConversations = 0; // Removido referência incorreta
  const averageEmotion = data.emotionalData?.length > 0 
    ? Math.round(data.emotionalData.reduce((acc, curr) => acc + curr.level, 0) / data.emotionalData.length)
    : 0;
  const growthAreas = data.lifeAreas?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Observatório da Consciência</h1>
          <p className="text-slate-600 text-sm sm:text-base">Um espelho da sua mente, comportamentos e evolução pessoal</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-purple-100 text-purple-800">Operacional</Badge>
          {totalInsights > 0 && (
            <Badge className="bg-blue-100 text-blue-800">
              {totalInsights} Insights Gerados
            </Badge>
          )}
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" data-tour="metrics">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total de Insights</p>
                <p className="text-2xl font-bold text-blue-800">{totalInsights}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {totalInsights > 0 ? 'Análises ativas' : 'Aguardando análise'}
                </p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Score Emocional</p>
                <p className="text-2xl font-bold text-green-800">{averageEmotion}%</p>
                <p className="text-xs text-green-600 mt-1">
                  {averageEmotion > 70 ? 'Acima da média' : 'Em desenvolvimento'}
                </p>
              </div>
              <Heart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Conversas Analisadas</p>
                <p className="text-2xl font-bold text-purple-800">{totalConversations}</p>
                <p className="text-xs text-purple-600 mt-1">
                  {totalConversations > 0 ? 'Base de dados ativa' : 'Nenhuma análise'}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Áreas Mapeadas</p>
                <p className="text-2xl font-bold text-orange-800">{growthAreas}</p>
                <p className="text-xs text-orange-600 mt-1">
                  {growthAreas > 0 ? 'Perfil ativo' : 'Aguardando dados'}
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card de boas-vindas se não houver dados */}
      {!data.hasRealData && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200" data-tour="welcome-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <Sparkles className="h-5 w-5" />
              Bem-vindo ao seu Observatório da Consciência!
            </CardTitle>
            <CardDescription className="text-indigo-600">
              Comece sua jornada de autoconhecimento fazendo a primeira análise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Assistentes IA especializados</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Análise emocional em tempo real</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700">Evolução personalizada</span>
                </div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
                <p className="text-sm text-gray-600 mb-2">
                  💡 <strong>Próximo passo:</strong> Clique no botão "Análise por IA" para fazer upload das suas conversas
                </p>
                <p className="text-xs text-gray-500">
                  Seus dados são 100% privados e processados com segurança máxima
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
