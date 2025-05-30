
import React from 'react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Heart, 
  Target, 
  TrendingUp, 
  Users, 
  Activity,
  Lightbulb,
  BarChart3,
  RefreshCw,
  MessageSquare,
  Clock,
  Bot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MetricCards() {
  const { data, isLoading, refreshData } = useAnalysisData();
  const { resetOnboarding } = useOnboarding();
  const navigate = useNavigate();

  console.log('📊 MetricCards - Dados REAIS:', {
    hasRealData: data.hasRealData,
    insightsCount: data.insights.length,
    assistantsActive: data.metrics.assistantsActive,
    lastAnalysis: data.metrics.lastAnalysis
  });

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Formatar data da última análise
  const lastAnalysisFormatted = data.metrics.lastAnalysis ? 
    new Date(data.metrics.lastAnalysis).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : null;

  const metrics = [
    {
      title: "Insights dos Assistentes",
      value: data.insights.length,
      description: data.hasRealData ? `${data.metrics.assistantsActive} assistentes ativos` : "Aguardando análise",
      icon: Brain,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: data.insights.length > 0 ? "✓" : "○",
      isReal: data.hasRealData
    },
    {
      title: "Análise Emocional",
      value: data.emotionalData.length > 0 ? "Ativa" : "Pendente",
      description: data.emotionalData.length > 0 ? `${data.emotionalData.length} insights emocionais` : "Aguardando análise",
      icon: Heart,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: data.emotionalData.length > 0 ? "✓" : "○",
      isReal: data.emotionalData.length > 0
    },
    {
      title: "Perfil Comportamental",
      value: data.hasRealData ? "Mapeado" : "Pendente",
      description: data.hasRealData ? "Análise psicológica ativa" : "Aguardando análise",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: data.hasRealData ? "✓" : "○",
      isReal: data.hasRealData
    },
    {
      title: "Estado Atual",
      value: data.hasRealData ? "Operacional" : "Configuração",
      description: data.hasRealData ? "Sistema analisando" : "Configure assistentes",
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: data.hasRealData ? "●" : "○",
      isReal: data.hasRealData
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
            Observatório da Consciência
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Análise psicológica REAL baseada em assistentes IA especializados
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Badge com informações REAIS */}
      <div className="flex flex-wrap gap-2">
        <Badge 
          className={data.hasRealData ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
        >
          {data.hasRealData ? "🤖 Sistema Operacional" : "⚠️ Aguardando Dados Reais"}
        </Badge>
        
        {data.insights.length > 0 && (
          <Badge className="bg-blue-100 text-blue-800">
            🧠 {data.insights.length} Insights Reais
          </Badge>
        )}

        {data.metrics.assistantsActive > 0 && (
          <Badge className="bg-purple-100 text-purple-800">
            🔮 {data.metrics.assistantsActive} Assistentes Ativos
          </Badge>
        )}

        {lastAnalysisFormatted && (
          <Badge className="bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3 mr-1" />
            Última análise: {lastAnalysisFormatted}
          </Badge>
        )}
      </div>

      {/* Metrics Grid - APENAS DADOS REAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className={`${metric.bgColor} border-0 hover:shadow-md transition-all duration-300`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <metric.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${metric.color}`} />
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-gray-600">{metric.trend}</span>
                  {metric.isReal && (
                    <Bot className="w-4 h-4 text-green-600" title="Dados reais dos assistentes" />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  {metric.title}
                </p>
                
                <p className={`text-xl sm:text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </p>
                
                <p className="text-xs text-gray-500 break-words">
                  {metric.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Section - APENAS DADOS REAIS */}
      {data.hasRealData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Progresso da Análise Real
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Insights Gerados pelos Assistentes</span>
                <span>{data.insights.length > 0 ? "100%" : "0%"}</span>
              </div>
              <Progress value={data.insights.length > 0 ? 100 : 0} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Análise Emocional</span>
                <span>{data.emotionalData.length > 0 ? "100%" : "0%"}</span>
              </div>
              <Progress value={data.emotionalData.length > 0 ? 100 : 0} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Perfil Comportamental</span>
                <span>{data.hasRealData ? "100%" : "0%"}</span>
              </div>
              <Progress value={data.hasRealData ? 100 : 0} className="h-2" />
            </div>

            {/* Informações dos Assistentes REAIS */}
            {data.hasRealData && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Assistentes Ativos</h4>
                <div className="text-xs text-blue-600">
                  <p>🤖 {data.metrics.assistantsActive} assistentes especializados</p>
                  <p>📊 {data.insights.length} insights gerados</p>
                  {lastAnalysisFormatted && (
                    <p>⏰ Última análise: {lastAnalysisFormatted}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col gap-2"
              onClick={() => navigate('/dashboard/chat')}
            >
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium">Conversar com IA</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col gap-2"
              onClick={() => navigate('/dashboard/insights')}
            >
              <Brain className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium">Ver Insights Reais</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col gap-2"
              onClick={() => navigate('/dashboard/behavioral')}
            >
              <Target className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium">Perfil Comportamental</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
