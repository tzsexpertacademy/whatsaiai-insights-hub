
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { AlertTriangle, CheckCircle, Info, Zap, Brain, Clock, Bot, TrendingUp, Target, Award, BarChart3, Activity } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export function InsightsAlerts() {
  const { data, isLoading } = useAnalysisData();

  console.log('🚨 InsightsAlerts - Dados REAIS atualizados:', {
    hasRealData: data.hasRealData,
    totalInsights: data.insightsWithAssistant?.length || 0,
    assistantsActive: data.metrics.assistantsActive,
    lastAnalysis: data.metrics.lastAnalysis,
    insightsBreakdown: data.insightsWithAssistant?.reduce((acc, insight) => {
      acc[insight.assistantName] = (acc[insight.assistantName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
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

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.hasRealData || !data.insightsWithAssistant || data.insightsWithAssistant.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Central de Insights dos Assistentes
          </CardTitle>
          <CardDescription>
            Aguardando análises reais dos assistentes especializados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum insight gerado ainda</h3>
            <p className="text-gray-600 mb-4">
              Os assistentes especializados ainda não analisaram seus dados
            </p>
            <div className="text-left max-w-md mx-auto space-y-2">
              <p className="text-sm text-gray-600">• Execute análise por IA no dashboard</p>
              <p className="text-sm text-gray-600">• Converse com os assistentes no chat</p>
              <p className="text-sm text-gray-600">• Aguarde processamento dos insights</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Categorizar insights REAIS por prioridade
  const highPriorityInsights = data.insightsWithAssistant.filter(insight => 
    insight.priority === 'high'
  );

  const mediumPriorityInsights = data.insightsWithAssistant.filter(insight => 
    insight.priority === 'medium'
  );

  const lowPriorityInsights = data.insightsWithAssistant.filter(insight => 
    insight.priority === 'low'
  );

  // Insights mais recentes (últimos 7 dias)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentInsights = data.insightsWithAssistant
    .filter(insight => new Date(insight.createdAt) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  // Dados para gráfico de prioridades (apenas se houver dados)
  const priorityData = [
    { prioridade: 'Alta', quantidade: highPriorityInsights.length, cor: '#EF4444' },
    { prioridade: 'Média', quantidade: mediumPriorityInsights.length, cor: '#F59E0B' },
    { prioridade: 'Baixa', quantidade: lowPriorityInsights.length, cor: '#10B981' }
  ].filter(item => item.quantidade > 0);

  // Distribuição REAL por assistente
  const assistantData = data.insightsWithAssistant.reduce((acc, insight) => {
    const assistant = insight.assistantName || 'Não identificado';
    const existing = acc.find(item => item.assistente === assistant);
    if (existing) {
      existing.insights++;
      existing.detalhes.push({
        tipo: insight.insight_type,
        prioridade: insight.priority,
        data: insight.createdAt
      });
    } else {
      acc.push({
        assistente: assistant.split(' ')[0], // Primeiro nome para o gráfico
        assistenteCompleto: assistant,
        insights: 1,
        area: insight.assistantArea,
        detalhes: [{
          tipo: insight.insight_type,
          prioridade: insight.priority,
          data: insight.createdAt
        }]
      });
    }
    return acc;
  }, [] as Array<{ 
    assistente: string; 
    assistenteCompleto: string;
    insights: number; 
    area: string;
    detalhes: Array<{tipo: string, prioridade: string, data: string}>;
  }>);

  // Evolução temporal dos insights (últimos 7 insights)
  const timelineData = data.insightsWithAssistant
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-7)
    .map((insight, index) => {
      const date = new Date(insight.createdAt);
      return {
        data: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        dataCompleta: date.toLocaleDateString('pt-BR'),
        total: index + 1,
        assistente: insight.assistantName,
        tipo: insight.insight_type,
        hora: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
    });

  // Análise de tipos de insights mais comuns
  const insightTypesData = data.insightsWithAssistant.reduce((acc, insight) => {
    const tipo = insight.insight_type || 'indefinido';
    const existing = acc.find(item => item.tipo === tipo);
    if (existing) {
      existing.quantidade++;
    } else {
      acc.push({
        tipo: tipo,
        quantidade: 1,
        assistentes: [insight.assistantName]
      });
    }
    return acc;
  }, [] as Array<{tipo: string, quantidade: number, assistentes: string[]}>)
  .sort((a, b) => b.quantidade - a.quantidade)
  .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header com métricas REAIS */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Central de Insights dos Assistentes
          </CardTitle>
          <CardDescription>
            Análises REAIS geradas por {data.metrics.assistantsActive} assistentes especializados
            {lastUpdate && ` • Última análise: ${lastUpdate}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total de Insights */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Total</span>
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                  {data.insightsWithAssistant.length}
                </Badge>
              </div>
              <p className="text-sm text-blue-600">Insights gerados pelos assistentes</p>
            </div>

            {/* Alta Prioridade */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Alta Prioridade</span>
                <Badge className="bg-red-100 text-red-800 text-xs">
                  {highPriorityInsights.length}
                </Badge>
              </div>
              <p className="text-sm text-red-600">Requerem atenção imediata</p>
            </div>

            {/* Insights Recentes */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Recentes</span>
                <Badge className="bg-green-100 text-green-800 text-xs">
                  {recentInsights.length}
                </Badge>
              </div>
              <p className="text-sm text-green-600">Últimos 7 dias</p>
            </div>

            {/* Assistentes Ativos */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-800">Assistentes</span>
                <Badge className="bg-purple-100 text-purple-800 text-xs">
                  {assistantData.length}
                </Badge>
              </div>
              <p className="text-sm text-purple-600">Gerando insights ativamente</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos de Análise REAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Assistente */}
        {assistantData.length > 0 && (
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Bot className="h-5 w-5" />
                Por Assistente
              </CardTitle>
              <CardDescription>Contribuições reais de cada assistente especializado</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assistantData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="assistente" 
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis fontSize={10} />
                    <ChartTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="font-medium">{data.assistenteCompleto}</p>
                              <p className="text-sm text-gray-600">Área: {data.area}</p>
                              <p className="text-sm">Insights: {data.insights}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="insights" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Distribuição por Prioridade */}
        {priorityData.length > 0 && (
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Target className="h-5 w-5" />
                Por Prioridade
              </CardTitle>
              <CardDescription>Distribuição real por nível de importância</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="quantidade"
                      label={({ prioridade, quantidade }) => `${prioridade}: ${quantidade}`}
                      fontSize={10}
                    >
                      {priorityData.map((entry, index) => (
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

        {/* Evolução Temporal */}
        {timelineData.length > 0 && (
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <TrendingUp className="h-5 w-5" />
                Evolução Temporal
              </CardTitle>
              <CardDescription>Crescimento real de insights ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="data" fontSize={10} />
                    <YAxis fontSize={10} />
                    <ChartTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="font-medium">Data: {data.dataCompleta}</p>
                              <p className="text-sm">Hora: {data.hora}</p>
                              <p className="text-sm">Assistente: {data.assistente}</p>
                              <p className="text-sm">Tipo: {data.tipo}</p>
                              <p className="text-sm">Total acumulado: {data.total}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tipos de Insights Mais Comuns */}
      {insightTypesData.length > 0 && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Tipos de Insights Mais Comuns
            </CardTitle>
            <CardDescription>
              Categorias de análise mais frequentes dos assistentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {insightTypesData.map((item, index) => (
                <div key={item.tipo} className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-800 capitalize">
                      {item.tipo.replace('_', ' ')}
                    </span>
                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                      {item.quantidade}
                    </Badge>
                  </div>
                  <p className="text-xs text-orange-600">
                    {item.quantidade} insight{item.quantidade > 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Recentes REAIS */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Insights Mais Recentes
          </CardTitle>
          <CardDescription>
            Últimas análises geradas pelos assistentes especializados
            {lastUpdate && ` • Atualizado em ${lastUpdate}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInsights.length > 0 ? (
              recentInsights.map((insight, index) => {
                const createdAt = new Date(insight.createdAt);
                const formattedDate = createdAt.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                const timeAgo = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60));
                const timeAgoText = timeAgo < 1 ? 'Há menos de 1 hora' : 
                                  timeAgo < 24 ? `Há ${timeAgo} hora${timeAgo > 1 ? 's' : ''}` :
                                  `Há ${Math.floor(timeAgo / 24)} dia${Math.floor(timeAgo / 24) > 1 ? 's' : ''}`;

                const getPriorityIcon = (priority: string) => {
                  switch (priority) {
                    case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
                    case 'medium': return <Info className="h-4 w-4 text-yellow-500" />;
                    case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
                    default: return <Info className="h-4 w-4 text-blue-500" />;
                  }
                };

                const getPriorityColor = (priority: string) => {
                  switch (priority) {
                    case 'high': return 'border-red-200 bg-red-50';
                    case 'medium': return 'border-yellow-200 bg-yellow-50';
                    case 'low': return 'border-green-200 bg-green-50';
                    default: return 'border-blue-200 bg-blue-50';
                  }
                };

                return (
                  <div key={insight.id} className={`border rounded-lg p-4 ${getPriorityColor(insight.priority)} hover:shadow-md transition-shadow`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(insight.priority)}
                        <h4 className="font-medium text-slate-800 text-sm">{insight.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-800 text-xs flex items-center gap-1">
                          <Bot className="h-3 w-3" />
                          {insight.assistantName}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {insight.assistantArea}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formattedDate}
                        </span>
                        <span className="text-slate-400">
                          {timeAgoText}
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          insight.priority === 'high' ? 'border-red-300 text-red-700' :
                          insight.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                          'border-green-300 text-green-700'
                        }`}
                      >
                        {insight.priority === 'high' ? 'Alta' :
                         insight.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Nenhum insight recente encontrado
                </h3>
                <p className="text-xs text-gray-600">
                  Aguardando novas análises dos assistentes especializados
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo dos Insights REAIS */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Resumo Analítico dos Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-600">
            <div className="space-y-1">
              <p>🔮 <strong>{data.metrics.assistantsActive} assistentes especializados</strong> gerando insights ativamente</p>
              <p>📊 <strong>{data.insightsWithAssistant.length} insights totais</strong> • {highPriorityInsights.length} alta prioridade • {mediumPriorityInsights.length} média • {lowPriorityInsights.length} baixa</p>
              <p>🎯 <strong>{assistantData.length} assistentes</strong> contribuindo com análises especializadas</p>
              <p>📈 <strong>{recentInsights.length} insights</strong> gerados nos últimos 7 dias</p>
            </div>
            <div className="space-y-1">
              <p>🏆 <strong>Tipos mais comuns:</strong> {insightTypesData.slice(0, 3).map(t => t.tipo).join(', ')}</p>
              <p>⭐ <strong>Assistente mais ativo:</strong> {assistantData.sort((a, b) => b.insights - a.insights)[0]?.assistenteCompleto || 'N/A'}</p>
              {lastUpdate && (
                <p>⏰ <strong>Última análise:</strong> {lastUpdate}</p>
              )}
              <p>🧠 <strong>Sistema baseado em dados reais</strong> dos assistentes IA</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
