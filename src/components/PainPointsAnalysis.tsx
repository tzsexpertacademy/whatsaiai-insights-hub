
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

  // Filtrar insights relacionados a problemas e desafios
  const painPointInsights = data.insightsWithAssistant?.filter(insight => 
    insight.insight_type === 'weakness' || 
    insight.priority === 'high' ||
    insight.description.toLowerCase().includes('problema') ||
    insight.description.toLowerCase().includes('desafio') ||
    insight.description.toLowerCase().includes('dificuldade')
  ) || [];

  const hasRealData = data.hasRealData && painPointInsights.length > 0;

  // Mock data como fallback
  const mockPainPoints = [
    {
      id: '1',
      title: 'Procrastinação em Tarefas Complexas',
      description: 'Tendência a adiar projetos que exigem planejamento detalhado',
      severity: 'Alta',
      frequency: 85,
      impact: 'Produtividade',
      assistantName: 'Oráculo das Sombras',
      suggestions: [
        'Dividir tarefas complexas em etapas menores',
        'Usar técnica Pomodoro para foco',
        'Definir deadlines intermediários'
      ]
    },
    {
      id: '2',
      title: 'Ansiedade em Apresentações',
      description: 'Nervosismo excessivo antes de falar em público',
      severity: 'Média',
      frequency: 60,
      impact: 'Carreira',
      assistantName: 'Tecelão da Alma',
      suggestions: [
        'Praticar técnicas de respiração',
        'Ensaiar apresentações com antecedência',
        'Visualizar cenários positivos'
      ]
    },
    {
      id: '3',
      title: 'Dificuldade em Dizer Não',
      description: 'Aceita compromissos além da capacidade',
      severity: 'Média',
      frequency: 70,
      impact: 'Relacionamentos',
      assistantName: 'Espelho Social',
      suggestions: [
        'Estabelecer limites claros',
        'Praticar frases de recusa gentil',
        'Avaliar comprometimentos existentes antes de aceitar novos'
      ]
    }
  ];

  const painPoints = hasRealData ? 
    painPointInsights.map((insight, index) => ({
      id: insight.id,
      title: insight.title,
      description: insight.description,
      severity: insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa',
      frequency: 70 + (index * 5),
      impact: insight.assistantArea || 'Geral',
      assistantName: insight.assistantName,
      suggestions: [`Baseado na análise do ${insight.assistantName}`, 'Implementar estratégias específicas', 'Monitorar progresso regularmente']
    })) : mockPainPoints;

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
                  <p>Carregando análise de pontos de dor...</p>
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
        {hasRealData && (
          <Badge className="bg-red-100 text-red-800">
            🔮 {painPointInsights.length} Pontos Identificados
          </Badge>
        )}
        <AIAnalysisButton />
      </PageHeader>
      
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Análise dos Assistentes */}
          {hasRealData && (
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
                            {insight.assistantArea}
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
          )}

          {/* Estatísticas Gerais */}
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
                      {Math.round(painPoints.reduce((acc, p) => acc + p.frequency, 0) / painPoints.length)}%
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
                      {hasRealData ? data.metrics.assistantsActive : 3}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Pontos de Dor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Análise Detalhada dos Pontos de Dor
              </CardTitle>
              <CardDescription>
                {hasRealData 
                  ? 'Desafios identificados pelos seus assistentes IA com estratégias de superação'
                  : 'Principais desafios identificados e estratégias para superação'
                }
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
                            {hasRealData && (
                              <Badge className="bg-purple-100 text-purple-800">
                                {painPoint.assistantName}
                              </Badge>
                            )}
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
                          Estratégias de Superação
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

          {/* Resumo de Ações */}
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
                      </div>
                    ))}
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
                    <span className="text-sm">Focar nos pontos de alta severidade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Implementar estratégias sugeridas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Monitorar progresso semanalmente</span>
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
