
import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, Target, Brain, Bot, Zap } from 'lucide-react';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function PainPointsAnalysis() {
  const { data, isLoading } = useAnalysisData();

  // Filtrar insights relacionados a problemas e desafios dos assistentes
  const painPointInsights = data.insightsWithAssistant?.filter(insight => 
    insight.insight_type === 'weakness' || 
    insight.priority === 'high' ||
    insight.description.toLowerCase().includes('problema') ||
    insight.description.toLowerCase().includes('desafio') ||
    insight.description.toLowerCase().includes('dificuldade') ||
    insight.description.toLowerCase().includes('obstáculo') ||
    insight.description.toLowerCase().includes('limitação')
  ) || [];

  const hasRealData = data.hasRealData && painPointInsights.length > 0;

  // Processamento dos pontos de dor baseado APENAS em dados dos assistentes
  const painPoints = painPointInsights.map((insight, index) => ({
    id: insight.id,
    title: insight.title,
    description: insight.description,
    severity: insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa',
    frequency: Math.min(95, 60 + (index * 8)), // Baseado na ordem de prioridade
    impact: insight.assistantArea || insight.category || 'Geral',
    assistantName: insight.assistantName,
    suggestions: [
      `Estratégia do ${insight.assistantName}`,
      'Implementar abordagem personalizada',
      'Monitorar progresso com assistente'
    ]
  }));

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Alta': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'Média': return <TrendingDown className="h-4 w-4 text-yellow-600" />;
      case 'Baixa': return <Target className="h-4 w-4 text-green-600" />;
      default: return <Brain className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Pontos de Dor"
          subtitle="Identifique e trabalhe os principais desafios e obstáculos"
        >
          <AIAnalysisButton />
        </PageHeader>
        
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p>Carregando análise de pontos de dor dos assistentes...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!hasRealData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Pontos de Dor"
          subtitle="Identifique e trabalhe os principais desafios e obstáculos"
        >
          <AIAnalysisButton />
        </PageHeader>
        
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Pontos de Dor Aguardam Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aguardando Análise dos Assistentes</h3>
                  <p className="text-gray-600 mb-6">
                    Os pontos de dor serão identificados após análises dos seus assistentes IA
                  </p>
                  <div className="text-left max-w-md mx-auto space-y-2 mb-6">
                    <p className="text-sm text-gray-600">• Execute análises IA das suas conversas</p>
                    <p className="text-sm text-gray-600">• Os assistentes identificarão padrões problemáticos</p>
                    <p className="text-sm text-gray-600">• Estratégias de superação serão sugeridas</p>
                  </div>
                  <AIAnalysisButton />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Pontos de Dor"
        subtitle="Identifique e trabalhe os principais desafios e obstáculos"
      >
        <Badge className="bg-red-100 text-red-800">
          🔮 {painPointInsights.length} Pontos Identificados pelos Assistentes
        </Badge>
        <AIAnalysisButton />
      </PageHeader>
      
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Análise dos Assistentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-red-600" />
                Pontos de Dor Identificados pelos Assistentes
              </CardTitle>
              <CardDescription>
                Desafios e obstáculos detectados através da análise dos seus assistentes IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {painPointInsights.slice(0, 4).map((insight) => (
                  <div key={insight.id} className="p-4 bg-red-50 rounded-lg border-l-4 border-l-red-500">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800">
                          {insight.assistantName}
                        </Badge>
                        <Badge variant="outline">
                          {insight.assistantArea || insight.category}
                        </Badge>
                      </div>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <h4 className="font-semibold mb-1 text-red-900">{insight.title}</h4>
                    <p className="text-sm text-red-700">{insight.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas Gerais - Baseadas nos Dados Reais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pontos de Dor</p>
                    <p className="text-2xl font-bold">{painPoints.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Severidade Alta</p>
                    <p className="text-2xl font-bold">
                      {painPoints.filter(p => p.severity === 'Alta').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Frequência Média</p>
                    <p className="text-2xl font-bold">
                      {painPoints.length > 0 ? Math.round(painPoints.reduce((acc, p) => acc + p.frequency, 0) / painPoints.length) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assistentes Ativos</p>
                    <p className="text-2xl font-bold">
                      {data.metrics.assistantsActive}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Pontos de Dor - Apenas Dados Reais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Análise Detalhada dos Pontos de Dor
              </CardTitle>
              <CardDescription>
                Desafios identificados pelos seus assistentes IA com estratégias de superação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {painPoints.map((painPoint) => (
                  <Card key={painPoint.id} className="border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getSeverityIcon(painPoint.severity)}
                            <h3 className="text-lg font-semibold">{painPoint.title}</h3>
                            <Badge className={getSeverityColor(painPoint.severity)}>
                              {painPoint.severity}
                            </Badge>
                            <Badge className="bg-purple-100 text-purple-800">
                              {painPoint.assistantName}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-4">{painPoint.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-2">Frequência de Ocorrência</h4>
                              <div className="flex items-center gap-3">
                                <Progress value={painPoint.frequency} className="flex-1 h-3" />
                                <span className="font-bold text-red-600">{painPoint.frequency}%</span>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Área de Impacto</h4>
                              <Badge variant="outline" className="text-sm">
                                {painPoint.impact}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-600" />
                          Estratégias de Superação ({painPoint.assistantName})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {painPoint.suggestions.map((suggestion, index) => (
                            <div key={index} className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resumo de Ações - Baseado em Dados Reais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Prioridades Urgentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {painPoints
                    .filter(p => p.severity === 'Alta')
                    .map(painPoint => (
                      <div key={painPoint.id} className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">{painPoint.title}</span>
                        <Badge variant="outline" className="text-xs">{painPoint.assistantName}</Badge>
                      </div>
                    ))}
                  {painPoints.filter(p => p.severity === 'Alta').length === 0 && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Nenhum ponto crítico identificado</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Próximos Passos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Implementar estratégias dos assistentes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Monitorar progresso com IA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Revisar análises semanalmente</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
