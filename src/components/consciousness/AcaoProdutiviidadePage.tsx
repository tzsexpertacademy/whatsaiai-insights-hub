
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Focus, Clock, TrendingUp, Target, AlertTriangle } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function AcaoProdutiviidadePage() {
  const { data, isLoading } = useAnalysisData();

  console.log('⚡ AcaoProdutiviidadePage - Dados recebidos:', {
    hasRealData: data.hasRealData,
    totalInsights: data.insights.length,
    insightsWithAssistant: data.insightsWithAssistant.length,
    assistantsActive: data.metrics.assistantsActive
  });

  if (isLoading) {
    return (
      <PageLayout
        title="Ação e Produtividade"
        description="Carregando dados..."
        showBackButton={true}
      >
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  // Filtrar insights relacionados a ação e produtividade de forma mais ampla
  const productivityInsights = data.insightsWithAssistant?.filter(
    insight => {
      const searchTerms = ['produtividade', 'ação', 'foco', 'execução', 'eficiência', 'procrastinação', 'desempenho', 'metas', 'objetivos', 'tempo'];
      const textToSearch = `${insight.title || ''} ${insight.description || ''} ${insight.assistantArea || ''}`.toLowerCase();
      return searchTerms.some(term => textToSearch.includes(term));
    }
  ) || [];

  console.log('🔍 Insights de Produtividade filtrados:', productivityInsights.length);

  // Métricas baseadas em dados reais mais dinâmicas
  const productivityMetrics = {
    focus: data.hasRealData ? 
      `${Math.min(60 + (productivityInsights.length * 8) + (data.metrics.assistantsActive * 5), 95)}%` : 
      "0%",
    rhythm: data.hasRealData ? 
      (data.chatMessages.length > 20 ? "Alto" : data.chatMessages.length > 10 ? "Moderado" : "Baixo") : 
      "Sem dados",
    efficiency: data.hasRealData ? 
      (productivityInsights.length > 3 ? "Alta" : productivityInsights.length > 1 ? "Média" : "Baixa") : 
      "Sem dados",
    procrastination: data.hasRealData ? 
      (productivityInsights.filter(i => i.description.toLowerCase().includes('procrastin')).length === 0 ? "Baixa" : "Moderada") : 
      "Sem dados"
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Badge className="bg-green-100 text-green-800">
        ⚡ {productivityInsights.length} Insights
      </Badge>
      <Badge className="bg-blue-100 text-blue-800">
        🤖 {data.metrics.assistantsActive} Assistentes
      </Badge>
      {data.hasRealData && (
        <Badge className="bg-green-100 text-green-800">
          ✅ Dados Reais
        </Badge>
      )}
    </div>
  );

  return (
    <PageLayout
      title="Ação e Produtividade"
      description="Análise do seu foco, ritmo de execução e eficiência estratégica"
      headerActions={headerActions}
      showBackButton={true}
    >
      <div className="space-y-6">
        {/* Status de Dados */}
        {!data.hasRealData && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="font-medium text-yellow-800">Sistema em Configuração</h3>
                  <p className="text-sm text-yellow-600">
                    Configure assistentes especializados para análise de produtividade e desempenho.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Focus className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nível de Foco</p>
                  <p className="text-xl font-bold text-green-700">{productivityMetrics.focus}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ritmo de Execução</p>
                  <p className="text-xl font-bold text-blue-700">{productivityMetrics.rhythm}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Eficiência</p>
                  <p className="text-xl font-bold text-purple-700">{productivityMetrics.efficiency}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Procrastinação</p>
                  <p className="text-xl font-bold text-orange-700">{productivityMetrics.procrastination}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights de Produtividade */}
        {productivityInsights.length > 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                Insights sobre Ação e Produtividade ({productivityInsights.length})
              </CardTitle>
              <p className="text-sm text-gray-600">
                Análises especializadas em otimização da performance e execução
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productivityInsights.slice(0, 5).map((insight) => {
                  const getPriorityColor = (priority: string) => {
                    switch (priority) {
                      case 'high': return 'border-red-200 bg-red-50';
                      case 'medium': return 'border-yellow-200 bg-yellow-50';
                      case 'low': return 'border-green-200 bg-green-50';
                      default: return 'border-gray-200 bg-gray-50';
                    }
                  };

                  return (
                    <div key={insight.id} className={`border rounded-lg p-4 ${getPriorityColor(insight.priority)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-slate-800">{insight.title}</h4>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {insight.assistantName}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-2 leading-relaxed">
                        {insight.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Área: {insight.assistantArea}</span>
                        <span>{new Date(insight.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <h3 className="font-medium text-green-800 mb-2">
                {data.hasRealData ? "Aguardando Insights Específicos" : "Configure o Sistema"}
              </h3>
              <p className="text-sm text-green-600">
                {data.hasRealData 
                  ? `${data.insights.length} insights gerais disponíveis. Os assistentes estão analisando padrões de produtividade.`
                  : "Configure assistentes especializados para análise de produtividade."
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Resumo de Dados */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-800 text-base">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total de Insights</p>
                <p className="font-bold text-gray-800">{data.insights.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Assistentes Ativos</p>
                <p className="font-bold text-gray-800">{data.metrics.assistantsActive}</p>
              </div>
              <div>
                <p className="text-gray-600">Mensagens Analisadas</p>
                <p className="font-bold text-gray-800">{data.chatMessages.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-bold text-gray-800">{data.hasRealData ? "Operacional" : "Configuração"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
