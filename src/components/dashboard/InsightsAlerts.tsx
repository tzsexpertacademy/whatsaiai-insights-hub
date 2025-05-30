
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { AlertTriangle, CheckCircle, Info, Zap, Brain, Clock, Bot, TrendingUp, Target, Award, BarChart3 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export function InsightsAlerts() {
  const { data, isLoading } = useAnalysisData();

  console.log('🚨 InsightsAlerts - Dados REAIS:', {
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

  // Insights mais recentes
  const recentInsights = data.insightsWithAssistant
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Dados para gráficos
  const priorityData = [
    { prioridade: 'Alta', quantidade: highPriorityInsights.length, cor: '#EF4444' },
    { prioridade: 'Média', quantidade: mediumPriorityInsights.length, cor: '#F59E0B' },
    { prioridade: 'Baixa', quantidade: lowPriorityInsights.length, cor: '#10B981' }
  ].filter(item => item.quantidade > 0);

  // Distribuição por assistente
  const assistantData = data.insightsWithAssistant.reduce((acc, insight) => {
    const assistant = insight.assistantName || 'Assistente';
    const existing = acc.find(item => item.assistente === assistant);
    if (existing) {
      existing.insights++;
    } else {
      acc.push({
        assistente: assistant.split(' ')[0], // Apenas primeiro nome
        insights: 1
      });
    }
    return acc;
  }, [] as Array<{ assistente: string; insights: number }>);

  // Evolução temporal dos insights
  const timelineData = data.insightsWithAssistant
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-7)
    .map((insight, index) => {
      const date = new Date(insight.createdAt);
      return {
        data: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        total: index + 1
      };
    });

  return (
    <div className="space-y-6">
      {/* Header com métricas */}
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

            {/* Média Prioridade */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Média Prioridade</span>
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                  {mediumPriorityInsights.length}
                </Badge>
              </div>
              <p className="text-sm text-yellow-600">Importantes para desenvolvimento</p>
            </div>

            {/* Observações */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Observações</span>
                <Badge className="bg-green-100 text-green-800 text-xs">
                  {lowPriorityInsights.length}
                </Badge>
              </div>
              <p className="text-sm text-green-600">Insights informativos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos de Análise */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Prioridade */}
        {priorityData.length > 0 && (
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Target className="h-5 w-5" />
                Por Prioridade
              </CardTitle>
              <CardDescription>Distribuição dos insights por nível de importância</CardDescription>
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

        {/* Insights por Assistente */}
        {assistantData.length > 0 && (
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Bot className="h-5 w-5" />
                Por Assistente
              </CardTitle>
              <CardDescription>Contribuições de cada assistente especializado</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assistantData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="assistente" fontSize={10} />
                    <YAxis fontSize={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="insights" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
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
                Evolução
              </CardTitle>
              <CardDescription>Crescimento acumulado de insights</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="data" fontSize={10} />
                    <YAxis fontSize={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

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
            {recentInsights.map((insight, index) => {
              const createdAt = new Date(insight.createdAt);
              const formattedDate = createdAt.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

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
                <div key={insight.id} className={`border rounded-lg p-4 ${getPriorityColor(insight.priority)}`}>
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
                      <span>Área: {insight.assistantArea}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formattedDate}
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
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumo dos Insights */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Resumo dos Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-blue-600 space-y-1">
            <p>🔮 {data.metrics.assistantsActive} assistentes especializados gerando insights ativamente</p>
            <p>📊 {data.insightsWithAssistant.length} insights totais • {highPriorityInsights.length} alta prioridade • {mediumPriorityInsights.length} média • {lowPriorityInsights.length} baixa</p>
            <p>🎯 {assistantData.length} assistentes contribuindo com análises especializadas</p>
            {lastUpdate && (
              <p>⏰ Última análise: {lastUpdate}</p>
            )}
            <p>🧠 Sistema baseado em dados reais dos assistentes IA</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
