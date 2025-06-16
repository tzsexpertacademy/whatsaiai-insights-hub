
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

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Badge className="bg-purple-100 text-purple-800">
        🧠 {consciousnessInsights.length} Insights Ativos
      </Badge>
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
                  <p className="text-xl font-bold text-purple-700">Em Análise</p>
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
                  <p className="text-xl font-bold text-blue-700">Moderado</p>
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
                  <p className="text-xl font-bold text-green-700">Crescendo</p>
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
                  <p className="text-xl font-bold text-orange-700">Estável</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights da Consciência */}
        {consciousnessInsights.length > 0 && (
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
                  <Badge variant="outline">3 ativos</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nível de Consciência</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Expandindo</Badge>
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
                  <Badge className="bg-blue-100 text-blue-800">Alta</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Alinhamento Ações/Valores</span>
                  <Badge className="bg-orange-100 text-orange-800">Moderado</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
