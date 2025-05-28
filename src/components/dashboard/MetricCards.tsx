
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
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MetricCards() {
  const { data, isLoading, refreshData } = useAnalysisData();
  const { resetOnboarding } = useOnboarding();
  const navigate = useNavigate();

  console.log('📊 MetricCards - Dados:', {
    hasRealData: data.hasRealData,
    insightsCount: data.insights.length,
    emotionalDataLength: data.emotionalData.length
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

  const metrics = [
    {
      title: "Insights Gerados",
      value: data.insights.length,
      description: "Descobertas da IA",
      icon: Brain,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: data.insights.length > 0 ? "↗" : "→"
    },
    {
      title: "Score Emocional",
      value: data.hasRealData ? `${data.relationalAwareness}%` : "0%",
      description: "Consciência relacional",
      icon: Heart,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: data.relationalAwareness > 70 ? "↗" : "→"
    },
    {
      title: "Perfil Comportamental",
      value: data.hasRealData ? "Mapeado" : "Pendente",
      description: data.psychologicalProfile,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: data.hasRealData ? "✓" : "○"
    },
    {
      title: "Estado Atual",
      value: data.emotionalState,
      description: data.mainFocus,
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: data.hasRealData ? "●" : "○"
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
            Análise psicológica completa baseada em IA
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            onClick={() => navigate('/chat')} 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex flex-wrap gap-2">
        <Badge 
          className={data.hasRealData ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
        >
          {data.hasRealData ? "Sistema Operacional" : "Aguardando Interações"}
        </Badge>
        
        {data.insights.length > 0 && (
          <Badge className="bg-blue-100 text-blue-800">
            {data.insights.length} Insights Descobertos
          </Badge>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className={`${metric.bgColor} border-0 hover:shadow-md transition-all duration-300`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <metric.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${metric.color}`} />
                <span className="text-lg font-bold text-gray-600">{metric.trend}</span>
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

      {/* Progress Section */}
      {data.hasRealData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Progresso da Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Perfil Comportamental</span>
                <span>{data.hasRealData ? "100%" : "0%"}</span>
              </div>
              <Progress value={data.hasRealData ? 100 : 0} className="h-2" />
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
                <span>Insights Gerados</span>
                <span>{data.insights.length > 0 ? "100%" : "0%"}</span>
              </div>
              <Progress value={data.insights.length > 0 ? 100 : 0} className="h-2" />
            </div>
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
              onClick={() => navigate('/chat')}
            >
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium">Conversar com IA</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col gap-2"
              onClick={() => navigate('/insights')}
            >
              <Brain className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium">Ver Insights</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col gap-2"
              onClick={() => navigate('/thermometer')}
            >
              <TrendingUp className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium">Análise Emocional</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
