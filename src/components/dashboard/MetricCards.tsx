
import React from 'react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { ResponsiveText } from '@/components/layout/ResponsiveText';
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
  RefreshCw
} from 'lucide-react';

export function MetricCards() {
  const { data, isLoading, refreshData } = useAnalysisData();
  const { resetOnboarding } = useOnboarding();

  console.log('📊 MetricCards - Dados:', {
    hasRealData: data.hasRealData,
    insightsCount: data.insights.length,
    emotionalDataLength: data.emotionalData.length
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <ResponsiveGrid columns={4}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </ResponsiveGrid>
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
    <div className="w-full space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <ResponsiveText variant="h1" className="text-slate-800">
            Observatório da Consciência
          </ResponsiveText>
          <ResponsiveText variant="description" className="mt-2">
            Análise psicológica completa baseada em IA
          </ResponsiveText>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          {data.hasRealData && (
            <Button onClick={resetOnboarding} variant="outline" size="sm">
              Ver Demo
            </Button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex flex-wrap gap-2">
        <Badge 
          className={data.hasRealData ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
        >
          {data.hasRealData ? "Sistema Operacional" : "Aguardando Dados"}
        </Badge>
        
        {data.insights.length > 0 && (
          <Badge className="bg-blue-100 text-blue-800">
            {data.insights.length} Insights Descobertos
          </Badge>
        )}
      </div>

      {/* Metrics Grid */}
      <ResponsiveGrid columns={4} gap="medium">
        {metrics.map((metric, index) => (
          <Card key={index} className={`${metric.bgColor} border-0 hover:shadow-md transition-all duration-300`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <metric.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${metric.color}`} />
                <span className="text-lg font-bold text-gray-600">{metric.trend}</span>
              </div>
              
              <div className="space-y-2">
                <ResponsiveText variant="label" className="text-gray-600">
                  {metric.title}
                </ResponsiveText>
                
                <ResponsiveText variant="h3" className={metric.color}>
                  {metric.value}
                </ResponsiveText>
                
                <ResponsiveText variant="body-small" className="text-gray-500 break-words">
                  {metric.description}
                </ResponsiveText>
              </div>
            </CardContent>
          </Card>
        ))}
      </ResponsiveGrid>

      {/* Progress Section */}
      {data.hasRealData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveGrid columns={3} gap="small">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Brain className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium">Analisar Conversas</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Users className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium">Ver Relacionamentos</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium">Acompanhar Evolução</span>
            </Button>
          </ResponsiveGrid>
        </CardContent>
      </Card>
    </div>
  );
}
