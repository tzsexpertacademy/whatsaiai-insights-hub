
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, Lightbulb, Bot, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';

export function Recommendations() {
  const { data, isLoading } = useAnalysisData();

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">
        💡 Recomendações dos Assistentes
      </Badge>
      <AIAnalysisButton />
    </div>
  );

  if (isLoading) {
    return (
      <PageLayout
        title="Recomendações"
        description="Sugestões de crescimento personalizadas pelos assistentes"
        showBackButton={true}
        headerActions={headerActions}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </PageLayout>
    );
  }

  // Filtrar apenas insights que são realmente recomendações dos assistentes
  const recommendationInsights = data.insightsWithAssistant.filter(insight => 
    insight.insight_type === 'recommendation' ||
    insight.title.toLowerCase().includes('recomend') ||
    insight.title.toLowerCase().includes('sugest') ||
    insight.description.toLowerCase().includes('recomend') ||
    insight.description.toLowerCase().includes('sugest')
  );

  if (!data.hasRealData || recommendationInsights.length === 0) {
    return (
      <PageLayout
        title="Recomendações"
        description="Sugestões de crescimento personalizadas pelos assistentes"
        showBackButton={true}
        headerActions={headerActions}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Recomendações não geradas
            </CardTitle>
            <CardDescription>
              Para gerar sugestões personalizadas, os assistentes precisam analisar suas conversas reais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">• Execute a análise por IA no dashboard</p>
                <p className="text-sm text-gray-600">• Os assistentes irão gerar recomendações reais</p>
                <p className="text-sm text-gray-600">• Baseadas em suas conversas e dados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const lastUpdate = data.metrics.lastAnalysis ? 
    new Date(data.metrics.lastAnalysis).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : null;

  return (
    <PageLayout
      title="Recomendações"
      description="Sugestões de crescimento personalizadas pelos assistentes"
      showBackButton={true}
      headerActions={headerActions}
    >
      {/* Indicadores dos assistentes */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          🔮 Análise Real dos Assistentes
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          💡 {recommendationInsights.length} recomendações reais
        </Badge>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          🤖 {data.metrics.assistantsActive} assistentes ativos
        </Badge>
        {lastUpdate && (
          <Badge variant="outline" className="bg-gray-50 text-gray-700">
            <Clock className="h-3 w-3 mr-1" />
            Última análise: {lastUpdate}
          </Badge>
        )}
      </div>

      {/* Recomendações detalhadas dos assistentes */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recomendações dos Assistentes
          </CardTitle>
          <CardDescription>Sugestões personalizadas baseadas em análises reais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendationInsights.map((insight, index) => (
              <div key={insight.id} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-green-50">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-800">{insight.title}</h4>
                  <Badge className="bg-blue-100 text-blue-800">
                    🔮 {insight.assistantName}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{insight.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Área: {insight.assistantArea || 'Geral'}</span>
                  <span>Prioridade: {insight.priority || 'Média'}</span>
                  <span>{new Date(insight.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumo das recomendações por área */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['desenvolvimento', 'relacionamentos', 'carreira', 'bem-estar', 'produtividade'].map((area) => {
          const areaRecommendations = recommendationInsights.filter(insight => 
            insight.assistantArea?.toLowerCase().includes(area) ||
            insight.description.toLowerCase().includes(area)
          );
          
          return (
            <Card key={area} className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between capitalize">
                  {area}
                  <Badge className="bg-blue-100 text-blue-800">
                    {areaRecommendations.length}
                  </Badge>
                </CardTitle>
                <CardDescription>Recomendações dos assistentes</CardDescription>
              </CardHeader>
              <CardContent>
                {areaRecommendations.length > 0 ? (
                  <div className="space-y-3">
                    {areaRecommendations.slice(0, 2).map((insight, idx) => (
                      <div key={idx} className="border rounded-lg p-3 bg-gradient-to-r from-blue-50 to-green-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-800">{insight.title}</span>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {insight.assistantName}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">{insight.description.substring(0, 80)}...</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Bot className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Aguardando análise dos assistentes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageLayout>
  );
}
