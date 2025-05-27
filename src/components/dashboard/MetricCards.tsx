
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { DemoDashboard } from '@/components/onboarding/DemoData';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { 
  Brain, 
  Heart, 
  TrendingUp, 
  Target, 
  Users, 
  MessageSquare,
  Sparkles,
  AlertCircle,
  Activity,
  Eye,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

export function MetricCards() {
  const { data, isLoading } = useAnalysisData();
  const { showDemo, isFirstVisit, completeOnboarding } = useOnboarding();

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
  const totalConversations = 0;
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
          <AIAnalysisButton />
        </div>
      </div>

      {/* Introdução para novos usuários */}
      {isFirstVisit && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Eye className="h-5 w-5" />
              Bem-vindo ao seu Observatório da Consciência!
            </CardTitle>
            <CardDescription className="text-blue-600">
              Aqui você terá acesso a análises profundas da sua personalidade e comportamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-blue-800 mb-1">Métricas Comportamentais</h3>
                <p className="text-sm text-blue-600">Acompanhe sua evolução emocional e cognitiva</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                <PieChart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium text-purple-800 mb-1">Áreas da Vida</h3>
                <p className="text-sm text-purple-600">Mapeamento completo dos seus focos</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <LineChart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-green-800 mb-1">Insights Personalizados</h3>
                <p className="text-sm text-green-600">Descobertas únicas sobre sua personalidade</p>
              </div>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={completeOnboarding}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Começar a Explorar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Card de instruções se não houver dados */}
      {!data.hasRealData && !isFirstVisit && (
        <Card className="bg-gradient-to-r from-indigo-50 to-cyan-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <Activity className="h-5 w-5" />
              Pronto para começar sua análise?
            </CardTitle>
            <CardDescription className="text-indigo-600">
              Faça upload das suas conversas para gerar insights personalizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
              <p className="text-sm text-gray-600 mb-2">
                💡 <strong>Próximo passo:</strong> Clique no botão "Análise por IA" para fazer upload das suas conversas
              </p>
              <p className="text-xs text-gray-500">
                Seus dados são 100% privados e processados com segurança máxima
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
