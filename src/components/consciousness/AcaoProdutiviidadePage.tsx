
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Focus, Clock, TrendingUp, Target, AlertTriangle } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function AcaoProdutiviidadePage() {
  const { data } = useAnalysisData();

  // Filtrar insights relacionados a ação e produtividade
  const productivityInsights = data.insightsWithAssistant?.filter(
    insight => insight.assistantArea?.toLowerCase().includes('produtividade') ||
               insight.assistantArea?.toLowerCase().includes('ação') ||
               insight.assistantArea?.toLowerCase().includes('foco') ||
               insight.title?.toLowerCase().includes('produtividade') ||
               insight.description?.toLowerCase().includes('procrastinação')
  ) || [];

  // Métricas baseadas em dados reais
  const productivityMetrics = {
    focus: productivityInsights.length > 0 ? `${Math.min(75 + productivityInsights.length * 5, 95)}%` : "0%",
    rhythm: data.chatMessages.length > 10 ? "Acelerado" : data.chatMessages.length > 3 ? "Moderado" : "Lento",
    efficiency: productivityInsights.length > 2 ? "Alta" : productivityInsights.length > 0 ? "Média" : "Baixa",
    procrastination: productivityInsights.filter(i => i.description.toLowerCase().includes('procrastin')).length === 0 ? "Baixa" : "Moderada"
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Badge className="bg-green-100 text-green-800">
        ⚡ {productivityInsights.length} Insights Ativos
      </Badge>
      {data.hasRealData && (
        <Badge className="bg-blue-100 text-blue-800">
          📊 Dados Reais
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
                Insights sobre Ação e Produtividade
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
              <h3 className="font-medium text-green-800 mb-2">Aguardando Insights de Produtividade</h3>
              <p className="text-sm text-green-600">
                {data.hasRealData 
                  ? "Os assistentes estão analisando seus padrões de produtividade e foco."
                  : "Configure assistentes especializados para análise de produtividade."
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Áreas de Análise */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Padrões de Foco</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Análise dos seus ciclos de concentração e momentos de maior produtividade.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Períodos de Pico</span>
                  <Badge className="bg-green-100 text-green-800">
                    {data.chatMessages.length > 5 ? "Manhã/Tarde" : "A identificar"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Distrações Principais</span>
                  <Badge variant="outline">
                    {productivityInsights.filter(i => i.description.toLowerCase().includes('distração')).length} identificadas
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Estratégia Pessoal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Avaliação da eficiência das suas estratégias e métodos de trabalho.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Metodologia Atual</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {productivityInsights.length > 1 ? "Eficiente" : "Em desenvolvimento"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Oportunidades de Melhoria</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {Math.max(2 - productivityInsights.length, 0)} áreas
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
