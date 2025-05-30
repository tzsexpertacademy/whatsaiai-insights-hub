
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertTriangle, Bot, Clock, TrendingDown, Target, BarChart3, Activity, Brain, Zap } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";

export function PainPointsAnalysis() {
  const { data, isLoading } = useAnalysisData();

  console.log('⚠️ PainPointsAnalysis - Dados REAIS:', {
    hasRealData: data.hasRealData,
    insightsWithAssistant: data.insightsWithAssistant?.length || 0,
    assistantsActive: data.metrics.assistantsActive,
    lastAnalysis: data.metrics.lastAnalysis
  });

  // Formatação da data da última análise
  const lastUpdate = data.metrics.lastAnalysis ? 
    new Date(data.metrics.lastAnalysis).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : null;

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Badge className="bg-red-100 text-red-800 text-xs sm:text-sm">
        ⚠️ Pontos de Dor
      </Badge>
      {data.hasRealData && (
        <>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
            🤖 {data.metrics.assistantsActive} assistentes
          </Badge>
          {lastUpdate && (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 text-xs hidden sm:flex">
              <Clock className="h-3 w-3 mr-1" />
              {lastUpdate}
            </Badge>
          )}
        </>
      )}
      <AIAnalysisButton />
    </div>
  );

  if (isLoading) {
    return (
      <PageLayout
        title="Pontos de Dor"
        description="Áreas de atenção identificadas pelos assistentes"
        showBackButton={true}
        headerActions={headerActions}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </PageLayout>
    );
  }

  if (!data.hasRealData || !data.insightsWithAssistant || data.insightsWithAssistant.length === 0) {
    return (
      <PageLayout
        title="Pontos de Dor"
        description="Áreas de atenção identificadas pelos assistentes"
        showBackButton={true}
        headerActions={headerActions}
      >
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Pontos de dor aguardam análise
            </CardTitle>
            <CardDescription className="text-orange-600">
              Para identificar áreas de atenção, os assistentes precisam analisar suas conversas.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-16 w-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-orange-800 mb-2">Nenhum ponto crítico identificado</h3>
            <p className="text-orange-700 mb-4">
              Os assistentes ainda não identificaram áreas problemáticas em suas análises
            </p>
            <div className="text-left max-w-md mx-auto space-y-2">
              <p className="text-sm text-orange-600">• Execute a análise por IA no dashboard</p>
              <p className="text-sm text-orange-600">• Os assistentes identificarão pontos de melhoria</p>
              <p className="text-sm text-orange-600">• Dados serão atualizados automaticamente</p>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // Filtrar insights REAIS que são pontos de dor ou alta prioridade
  const painPointInsights = data.insightsWithAssistant.filter(insight => 
    insight.priority === 'high' || 
    insight.insight_type === 'warning' ||
    insight.title.toLowerCase().includes('problema') ||
    insight.title.toLowerCase().includes('dificuldade') ||
    insight.title.toLowerCase().includes('atenção') ||
    insight.description.toLowerCase().includes('atenção') ||
    insight.description.toLowerCase().includes('problema') ||
    insight.description.toLowerCase().includes('dificuldade')
  );

  // Categorizar pontos de dor por prioridade
  const highPriorityPains = painPointInsights.filter(insight => insight.priority === 'high');
  const mediumPriorityPains = painPointInsights.filter(insight => insight.priority === 'medium');
  const lowPriorityPains = painPointInsights.filter(insight => insight.priority === 'low');

  // Dados para gráfico de distribuição por severidade
  const severityData = [
    { severidade: 'Crítica', quantidade: highPriorityPains.length, cor: '#EF4444' },
    { severidade: 'Moderada', quantidade: mediumPriorityPains.length, cor: '#F59E0B' },
    { severidade: 'Leve', quantidade: lowPriorityPains.length, cor: '#10B981' }
  ].filter(item => item.quantidade > 0);

  // Distribuição por assistente
  const assistantPainData = painPointInsights.reduce((acc, insight) => {
    const assistant = insight.assistantName || 'Assistente';
    const existing = acc.find(item => item.assistente === assistant);
    if (existing) {
      existing.pontos++;
    } else {
      acc.push({
        assistente: assistant.split(' ')[0], // Apenas primeiro nome
        pontos: 1
      });
    }
    return acc;
  }, [] as Array<{ assistente: string; pontos: number }>);

  // Distribuição por área/categoria
  const categoryData = painPointInsights.reduce((acc, insight) => {
    const area = insight.assistantArea || 'Geral';
    const existing = acc.find(item => item.area === area);
    if (existing) {
      existing.identificados++;
    } else {
      acc.push({
        area: area,
        identificados: 1
      });
    }
    return acc;
  }, [] as Array<{ area: string; identificados: number }>);

  // Evolução temporal dos pontos de dor
  const timelineData = painPointInsights
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-6)
    .map((pain, index) => {
      const date = new Date(pain.createdAt);
      return {
        data: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        total: index + 1,
        criticos: painPointInsights.slice(0, index + 1).filter(p => p.priority === 'high').length
      };
    });

  return (
    <PageLayout
      title="Pontos de Dor"
      description="Áreas de atenção identificadas pelos assistentes"
      showBackButton={true}
      headerActions={headerActions}
    >
      {/* Header com status */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-red-600" />
            Análise de Pontos de Dor pelos Assistentes
          </CardTitle>
          <CardDescription>
            {painPointInsights.length} pontos de atenção identificados por {data.metrics.assistantsActive} assistentes especializados
            {lastUpdate && ` • Última análise: ${lastUpdate}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total de Pontos */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Total</span>
                <Badge className="bg-red-100 text-red-800 text-xs">
                  {painPointInsights.length}
                </Badge>
              </div>
              <p className="text-sm text-red-600">Pontos de atenção identificados</p>
            </div>

            {/* Críticos */}
            <div className="bg-red-100 border border-red-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-red-700" />
                <span className="font-medium text-red-900">Críticos</span>
                <Badge className="bg-red-200 text-red-900 text-xs">
                  {highPriorityPains.length}
                </Badge>
              </div>
              <p className="text-sm text-red-700">Requerem ação imediata</p>
            </div>

            {/* Moderados */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Moderados</span>
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                  {mediumPriorityPains.length}
                </Badge>
              </div>
              <p className="text-sm text-yellow-600">Monitoramento necessário</p>
            </div>

            {/* Áreas Afetadas */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Áreas</span>
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                  {categoryData.length}
                </Badge>
              </div>
              <p className="text-sm text-blue-600">Categorias identificadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {painPointInsights.length === 0 ? (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-8">
            <div className="text-center">
              <TrendingDown className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-800 mb-2">Nenhum ponto crítico identificado!</h3>
              <p className="text-green-700">
                Os assistentes não identificaram áreas de alta prioridade para atenção imediata.
              </p>
              <div className="mt-4 flex items-center justify-center">
                <Bot className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">Análise por {data.metrics.assistantsActive} assistentes IA</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Gráficos de Análise */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Severidade */}
            {severityData.length > 0 && (
              <Card className="bg-white border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <Target className="h-5 w-5" />
                    Distribuição por Severidade
                  </CardTitle>
                  <CardDescription>Classificação dos pontos de dor por criticidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={severityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="quantidade"
                          label={({ severidade, quantidade }) => `${severidade}: ${quantidade}`}
                          fontSize={10}
                        >
                          {severityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cor} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Pontos por Assistente */}
            {assistantPainData.length > 0 && (
              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <Bot className="h-5 w-5" />
                    Identificação por Assistente
                  </CardTitle>
                  <CardDescription>Pontos de dor identificados por cada assistente</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={assistantPainData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="assistente" fontSize={10} />
                        <YAxis fontSize={10} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="pontos" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Distribuição por Área */}
            {categoryData.length > 0 && (
              <Card className="bg-white border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <BarChart3 className="h-5 w-5" />
                    Pontos por Área
                  </CardTitle>
                  <CardDescription>Distribuição dos problemas por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="area" fontSize={10} />
                        <YAxis fontSize={10} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="identificados" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Evolução Temporal */}
            {timelineData.length > 0 && (
              <Card className="bg-white border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Activity className="h-5 w-5" />
                    Evolução dos Pontos de Dor
                  </CardTitle>
                  <CardDescription>Identificação de problemas ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="data" fontSize={10} />
                        <YAxis fontSize={10} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="total" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="criticos" stroke="#EF4444" fill="#EF4444" fillOpacity={0.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pontos de Dor Críticos */}
          {highPriorityPains.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Pontos Críticos - Ação Imediata
                </CardTitle>
                <CardDescription>Áreas que requerem atenção urgente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {highPriorityPains.slice(0, 5).map((insight) => {
                    const createdAt = new Date(insight.createdAt);
                    const formattedDate = createdAt.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div key={insight.id} className="border border-red-300 rounded-lg p-4 bg-gradient-to-r from-red-50 to-orange-50">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-red-800">{insight.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              🤖 {insight.assistantName}
                            </Badge>
                            <Badge className="bg-red-200 text-red-900 text-xs">
                              🚨 CRÍTICO
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-red-700 mb-3">{insight.description}</p>
                        <div className="flex items-center justify-between text-xs text-red-600">
                          <span>Área: {insight.assistantArea}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formattedDate}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Todos os Pontos de Dor */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Análise Completa dos Pontos de Dor
              </CardTitle>
              <CardDescription>
                Identificação detalhada pelos assistentes especializados
                {lastUpdate && ` • Atualizado em ${lastUpdate}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {painPointInsights.map((insight) => {
                  const createdAt = new Date(insight.createdAt);
                  const formattedDate = createdAt.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const getPriorityColor = (priority: string) => {
                    switch (priority) {
                      case 'high': return 'border-red-200 bg-red-50';
                      case 'medium': return 'border-yellow-200 bg-yellow-50';
                      case 'low': return 'border-green-200 bg-green-50';
                      default: return 'border-gray-200 bg-gray-50';
                    }
                  };

                  const getPriorityBadge = (priority: string) => {
                    switch (priority) {
                      case 'high': return '🚨 Crítico';
                      case 'medium': return '⚠️ Moderado';
                      case 'low': return '📋 Leve';
                      default: return '📝 Normal';
                    }
                  };

                  return (
                    <div key={insight.id} className={`border rounded-lg p-4 ${getPriorityColor(insight.priority)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-slate-800">{insight.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            🤖 {insight.assistantName}
                          </Badge>
                          <Badge 
                            className={`text-xs ${
                              insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                              insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            {getPriorityBadge(insight.priority)}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                        {insight.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <Bot className="h-3 w-3" />
                          <span>Área: {insight.assistantArea}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Resumo dos Pontos de Dor */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Resumo da Análise de Pontos de Dor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-red-600 space-y-1">
            <p>⚠️ {painPointInsights.length} pontos de atenção identificados pelos assistentes</p>
            <p>🚨 {highPriorityPains.length} críticos • ⚠️ {mediumPriorityPains.length} moderados • 📋 {lowPriorityPains.length} leves</p>
            <p>🤖 {data.metrics.assistantsActive} assistentes especializados monitorando • {categoryData.length} áreas afetadas</p>
            {lastUpdate && (
              <p>⏰ Última análise: {lastUpdate}</p>
            )}
            <p>🎯 Sistema baseado em dados reais dos assistentes IA</p>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
