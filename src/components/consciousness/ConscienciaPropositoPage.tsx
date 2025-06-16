
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Target, Eye, Heart, Brain, TrendingUp } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function ConscienciaPropositoPage() {
  const { data } = useAnalysisData();

  // Filtrar insights relacionados a consciência e propósito
  const consciousnessInsights = data.insightsWithAssistant?.filter(
    insight => insight.assistantArea?.toLowerCase().includes('consciência') ||
               insight.assistantArea?.toLowerCase().includes('propósito') ||
               insight.assistantArea?.toLowerCase().includes('sentido') ||
               insight.title?.toLowerCase().includes('propósito') ||
               insight.description?.toLowerCase().includes('consciência')
  ) || [];

  // Métricas baseadas em dados reais
  const consciousnessMetrics = {
    clarity: consciousnessInsights.length > 0 ? "Em Evolução" : "Aguardando análise",
    alignment: data.insights.length > 2 ? "Moderado" : "Inicial",
    awareness: consciousnessInsights.length > 1 ? "Crescendo" : "Emergente",
    coherence: data.hasRealData ? "Estável" : "Em formação"
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Badge className="bg-purple-100 text-purple-800">
        🧠 {consciousnessInsights.length} Insights Ativos
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
      title="Consciência e Propósito"
      description="Explore sua clareza de propósito, coerência interna e busca de sentido"
      headerActions={headerActions}
      showBackButton={true}
    >
      <div className="space-y-6">
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
                Insights sobre Consciência e Propósito
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
              <h3 className="font-medium text-blue-800 mb-2">Aguardando Insights de Consciência</h3>
              <p className="text-sm text-blue-600">
                {data.hasRealData 
                  ? "Os assistentes estão analisando seus dados para gerar insights sobre consciência e propósito."
                  : "Configure assistentes especializados para começar a análise da sua consciência."
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Áreas de Desenvolvimento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">Sombra e Autossabotagem</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Identificação de padrões inconscientes que limitam seu crescimento e realização.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Padrões Identificados</span>
                  <Badge variant="outline">{consciousnessInsights.filter(i => i.description.toLowerCase().includes('padrão')).length} detectados</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nível de Consciência</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {consciousnessInsights.length > 2 ? "Expandindo" : "Emergindo"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Busca de Sentido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Análise da sua jornada em busca de significado e direcionamento existencial.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Clareza de Valores</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {data.insights.length > 3 ? "Alta" : "Desenvolvendo"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Alinhamento Ações/Valores</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {consciousnessInsights.length > 1 ? "Moderado" : "Inicial"}
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
