
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Target, Eye, Heart, Brain, TrendingUp } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function ConscienciaPropositoPage() {
  const { data, isLoading } = useAnalysisData();

  console.log('🧠 ConscienciaPropositoPage - Dados recebidos:', {
    hasRealData: data.hasRealData,
    totalInsights: data.insights.length,
    insightsWithAssistant: data.insightsWithAssistant.length,
    assistantsActive: data.metrics.assistantsActive
  });

  if (isLoading) {
    return (
      <PageLayout
        title="Consciência e Propósito"
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

  // Filtrar insights relacionados a consciência e propósito de forma mais ampla
  const consciousnessInsights = data.insightsWithAssistant?.filter(
    insight => {
      const searchTerms = ['consciência', 'propósito', 'sentido', 'valores', 'missão', 'visão', 'significado', 'direção'];
      const textToSearch = `${insight.title || ''} ${insight.description || ''} ${insight.assistantArea || ''}`.toLowerCase();
      return searchTerms.some(term => textToSearch.includes(term));
    }
  ) || [];

  console.log('🔍 Insights de Consciência filtrados:', consciousnessInsights.length);

  // Métricas baseadas em dados reais
  const consciousnessMetrics = {
    clarity: data.hasRealData ? 
      (consciousnessInsights.length > 2 ? "Alta" : consciousnessInsights.length > 0 ? "Média" : "Baixa") : 
      "Sem dados",
    alignment: data.hasRealData ? 
      (data.insights.length > 5 ? "Forte" : data.insights.length > 2 ? "Moderado" : "Inicial") : 
      "Sem dados",
    awareness: data.hasRealData ? 
      (consciousnessInsights.length > 3 ? "Elevada" : consciousnessInsights.length > 1 ? "Crescendo" : "Emergente") : 
      "Sem dados",
    coherence: data.hasRealData ? 
      (data.metrics.assistantsActive > 3 ? "Estável" : "Em formação") : 
      "Sem dados"
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Badge className="bg-purple-100 text-purple-800">
        🧠 {consciousnessInsights.length} Insights
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
      title="Consciência e Propósito"
      description="Explore sua clareza de propósito, coerência interna e busca de sentido"
      headerActions={headerActions}
      showBackButton={true}
    >
      <div className="space-y-6">
        {/* Status de Dados */}
        {!data.hasRealData && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="font-medium text-yellow-800">Sistema em Configuração</h3>
                  <p className="text-sm text-yellow-600">
                    Configure assistentes especializados para gerar insights sobre consciência e propósito.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Clareza de Propósito</p>
                  <p className="text-xl font-bold text-purple-700">{consciousnessMetrics.clarity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Alinhamento</p>
                  <p className="text-xl font-bold text-blue-700">{consciousnessMetrics.alignment}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Autoconsciência</p>
                  <p className="text-xl font-bold text-green-700">{consciousnessMetrics.awareness}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Heart className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Coerência Interna</p>
                  <p className="text-xl font-bold text-orange-700">{consciousnessMetrics.coherence}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights da Consciência */}
        {consciousnessInsights.length > 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Insights sobre Consciência e Propósito ({consciousnessInsights.length})
              </CardTitle>
              <p className="text-sm text-gray-600">
                Análises dos assistentes especializados em desenvolvimento da consciência
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consciousnessInsights.slice(0, 5).map((insight) => {
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
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
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
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <Brain className="h-12 w-12 text-blue-400 mx-auto mb-3" />
              <h3 className="font-medium text-blue-800 mb-2">
                {data.hasRealData ? "Aguardando Insights Específicos" : "Configure o Sistema"}
              </h3>
              <p className="text-sm text-blue-600">
                {data.hasRealData 
                  ? `${data.insights.length} insights gerais disponíveis. Os assistentes estão analisando padrões relacionados à consciência e propósito.`
                  : "Configure assistentes especializados para começar a análise da sua consciência."
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
                <p className="text-gray-600">Conversas Analisadas</p>
                <p className="font-bold text-gray-800">{data.conversations.length}</p>
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
