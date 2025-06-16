
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Battery, Clock, DollarSign, Focus, Leaf } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function GestaoRecursosPage() {
  const { data } = useAnalysisData();

  // Filtrar insights relacionados a gestão de recursos
  const resourceInsights = data.insightsWithAssistant?.filter(
    insight => insight.assistantArea?.toLowerCase().includes('recursos') ||
               insight.assistantArea?.toLowerCase().includes('energia') ||
               insight.assistantArea?.toLowerCase().includes('tempo') ||
               insight.title?.toLowerCase().includes('energia') ||
               insight.description?.toLowerCase().includes('gestão')
  ) || [];

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Badge className="bg-blue-100 text-blue-800">
        🎯 {resourceInsights.length} Insights Ativos
      </Badge>
    </div>
  );

  return (
    <PageLayout
      title="Gestão de Recursos"
      description="Monitore sua energia, tempo, atenção e sustentabilidade pessoal"
      headerActions={headerActions}
      showBackButton={true}
    >
      <div className="space-y-6">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Battery className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nível de Energia</p>
                  <p className="text-xl font-bold text-yellow-700">68%</p>
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
                  <p className="text-sm text-gray-600">Gestão do Tempo</p>
                  <p className="text-xl font-bold text-blue-700">Boa</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Focus className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Qualidade da Atenção</p>
                  <p className="text-xl font-bold text-purple-700">Alta</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sustentabilidade</p>
                  <p className="text-xl font-bold text-green-700">Estável</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights de Recursos */}
        {resourceInsights.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Insights sobre Gestão de Recursos
              </CardTitle>
              <p className="text-sm text-gray-600">
                Análises especializadas em otimização de recursos pessoais
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resourceInsights.slice(0, 5).map((insight) => {
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
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
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

        {/* Análise Detalhada de Recursos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">Energia e Vitalidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Monitoramento dos seus ciclos energéticos e padrões de desgaste.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Energia Matinal</span>
                  <Badge className="bg-green-100 text-green-800">Alta</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Queda Vespertina</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Moderada</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recuperação</span>
                  <Badge className="bg-blue-100 text-blue-800">Eficiente</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Atenção e Foco</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Análise da qualidade e direcionamento da sua atenção ao longo do dia.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Concentração Profunda</span>
                  <Badge className="bg-purple-100 text-purple-800">3h/dia</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Multitasking</span>
                  <Badge className="bg-orange-100 text-orange-800">Moderado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Qualidade do Foco</span>
                  <Badge className="bg-green-100 text-green-800">Alta</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
