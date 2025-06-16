
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Moon, Shield, Thermometer, Zap } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function CorpoVitalidadePage() {
  const { data } = useAnalysisData();

  // Filtrar insights relacionados a corpo e vitalidade
  const vitalityInsights = data.insightsWithAssistant?.filter(
    insight => insight.assistantArea?.toLowerCase().includes('saúde') ||
               insight.assistantArea?.toLowerCase().includes('corpo') ||
               insight.assistantArea?.toLowerCase().includes('vitalidade') ||
               insight.title?.toLowerCase().includes('saúde') ||
               insight.description?.toLowerCase().includes('estresse')
  ) || [];

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Badge className="bg-red-100 text-red-800">
        ❤️ {vitalityInsights.length} Insights Ativos
      </Badge>
    </div>
  );

  return (
    <PageLayout
      title="Corpo e Vitalidade"
      description="Monitore sua saúde física, ritmo biológico e autocuidado"
      headerActions={headerActions}
      showBackButton={true}
    >
      <div className="space-y-6">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Saúde Geral</p>
                  <p className="text-xl font-bold text-red-700">Boa</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Moon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Qualidade do Sono</p>
                  <p className="text-xl font-bold text-blue-700">Regular</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Atividade Física</p>
                  <p className="text-xl font-bold text-green-700">Moderada</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Thermometer className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nível de Estresse</p>
                  <p className="text-xl font-bold text-orange-700">Controlado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights de Vitalidade */}
        {vitalityInsights.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Insights sobre Corpo e Vitalidade
              </CardTitle>
              <p className="text-sm text-gray-600">
                Análises especializadas em saúde física e bem-estar
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vitalityInsights.slice(0, 5).map((insight) => {
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
                        <Badge className="bg-red-100 text-red-800 text-xs">
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

        {/* Análise Detalhada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Ritmo Biológico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Análise dos seus padrões circadianos e sincronização com ritmos naturais.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Horário de Sono</span>
                  <Badge className="bg-blue-100 text-blue-800">22:30-06:30</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pico de Energia</span>
                  <Badge className="bg-green-100 text-green-800">09:00-11:00</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Regularidade</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Moderada</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-800">Sinais de Alerta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Monitoramento de sinais de esgotamento e necessidades de autocuidado.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fadiga Mental</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Baixa</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tensão Muscular</span>
                  <Badge className="bg-orange-100 text-orange-800">Moderada</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Necessidade de Pausa</span>
                  <Badge className="bg-green-100 text-green-800">Baixa</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
