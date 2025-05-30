import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertTriangle, Bot, Clock, TrendingDown } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';

export function PainPointsAnalysis() {
  const { data, isLoading } = useAnalysisData();

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Badge className="bg-red-100 text-red-800 text-xs sm:text-sm">
        ⚠️ Pontos de Dor
      </Badge>
      <AIAnalysisButton />
    </div>
  );

  if (isLoading) {
    return (
      <PageLayout
        title="Pontos de Dor"
        description="Áreas de atenção identificadas pelos assistentes"
        showBackButton={true}
        headerActions={headerActions}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </PageLayout>
    );
  }

  if (!data.hasRealData) {
    return (
      <PageLayout
        title="Pontos de Dor"
        description="Áreas de atenção identificadas pelos assistentes"
        showBackButton={true}
        headerActions={headerActions}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Pontos de dor não identificados
            </CardTitle>
            <CardDescription>
              Para identificar áreas de atenção, os assistentes precisam analisar suas conversas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">• Execute a análise por IA no dashboard</p>
                <p className="text-sm text-gray-600">• Os assistentes irão identificar pontos de melhoria</p>
                <p className="text-sm text-gray-600">• Dados serão atualizados automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // Filtrar insights que são pontos de dor ou alta prioridade
  const painPointInsights = data.insightsWithAssistant.filter(insight => 
    insight.priority === 'high' || 
    insight.insight_type === 'warning' ||
    insight.title.toLowerCase().includes('problema') ||
    insight.title.toLowerCase().includes('dificuldade') ||
    insight.description.toLowerCase().includes('atenção')
  );

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
      title="Pontos de Dor"
      description="Áreas de atenção identificadas pelos assistentes"
      showBackButton={true}
      headerActions={headerActions}
    >
      {/* Indicadores dos assistentes */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          🔮 Análise dos Assistentes
        </Badge>
        <Badge variant="outline" className="bg-red-50 text-red-700">
          ⚠️ {painPointInsights.length} pontos de atenção
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

      {painPointInsights.length === 0 ? (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-8">
            <div className="text-center">
              <TrendingDown className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-800 mb-2">Nenhum ponto crítico identificado!</h3>
              <p className="text-green-700">
                Os assistentes não identificaram áreas de alta prioridade para atenção imediata.
              </p>
              <div className="mt-4 flex items-center justify-center">
                <Bot className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">Análise por {data.metrics.assistantsActive} assistentes IA</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pontos de dor por prioridade */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Pontos Críticos
              </CardTitle>
              <CardDescription>Áreas que requerem atenção imediata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {painPointInsights.filter(insight => insight.priority === 'high').slice(0, 3).map((insight, index) => (
                  <div key={insight.id} className="border border-red-200 rounded-lg p-4 bg-gradient-to-r from-red-50 to-orange-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-red-800">{insight.title}</h4>
                      <Badge className="bg-red-100 text-red-800">
                        🔮 {insight.assistantName}
                      </Badge>
                    </div>
                    <p className="text-sm text-red-700 mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between text-xs text-red-600">
                      <span>Prioridade: {insight.priority}</span>
                      <span>{new Date(insight.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pontos de atenção */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <TrendingDown className="h-5 w-5" />
                Pontos de Atenção
              </CardTitle>
              <CardDescription>Áreas para monitoramento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {painPointInsights.filter(insight => insight.priority !== 'high').slice(0, 3).map((insight, index) => (
                  <div key={insight.id} className="border border-orange-200 rounded-lg p-4 bg-gradient-to-r from-orange-50 to-yellow-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-orange-800">{insight.title}</h4>
                      <Badge className="bg-orange-100 text-orange-800">
                        🔮 {insight.assistantName}
                      </Badge>
                    </div>
                    <p className="text-sm text-orange-700 mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between text-xs text-orange-600">
                      <span>Área: {insight.assistantArea}</span>
                      <span>{new Date(insight.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Todos os pontos de dor detalhados */}
      {painPointInsights.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Análise Detalhada dos Pontos de Dor</CardTitle>
            <CardDescription>Identificação completa pelos assistentes especializados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {painPointInsights.map((insight, index) => (
                <div key={insight.id} className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-orange-50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-800">{insight.title}</h4>
                    <div className="flex gap-2">
                      <Badge className={`${insight.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                        {insight.priority === 'high' ? '🚨 Crítico' : '⚠️ Atenção'}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800">
                        🔮 {insight.assistantName}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Área: {insight.assistantArea}</span>
                    <span>{new Date(insight.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
