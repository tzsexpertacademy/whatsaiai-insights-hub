
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

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Badge className="bg-green-100 text-green-800">
        ⚡ {productivityInsights.length} Insights Ativos
      </Badge>
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
                  <p className="text-xl font-bold text-green-700">75%</p>
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
                  <p className="text-xl font-bold text-blue-700">Acelerado</p>
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
                  <p className="text-xl font-bold text-purple-700">Alta</p>
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
                  <p className="text-xl font-bold text-orange-700">Baixa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights de Produtividade */}
        {productivityInsights.length > 0 && (
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
                  <Badge className="bg-green-100 text-green-800">Manhã</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Distrações Principais</span>
                  <Badge variant="outline">3 identificadas</Badge>
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
                  <Badge className="bg-blue-100 text-blue-800">Eficiente</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Oportunidades de Melhoria</span>
                  <Badge className="bg-yellow-100 text-yellow-800">2 áreas</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
