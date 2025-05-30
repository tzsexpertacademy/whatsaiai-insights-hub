
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Bot, AlertCircle, TrendingUp, Calendar, Target, Award, Sparkles, CheckCircle, BarChart3, Activity } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { PageLayout } from '@/components/layout/PageLayout';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export function ObservatoryTimeline() {
  const { data, isLoading } = useAnalysisData();

  console.log('🕒 ObservatoryTimeline - Dados disponíveis:', {
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

  // Processar insights para timeline cronológica
  const timelineEvents = data.insightsWithAssistant?.map(insight => ({
    ...insight,
    date: insight.created_at,
    type: getEventType(insight.insight_type),
    icon: getEventIcon(insight.insight_type),
    color: getEventColor(insight.insight_type)
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  // Dados para gráfico de evolução temporal
  const evolutionData = timelineEvents.slice(0, 10).reverse().map((event, index) => {
    const date = new Date(event.date);
    return {
      data: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      insights: index + 1,
      assistente: event.assistantName?.split(' ')[0] || 'IA',
      tipo: event.insight_type
    };
  });

  // Dados para gráfico de distribuição por assistente
  const assistantData = timelineEvents.reduce((acc, event) => {
    const assistant = event.assistantName || 'Assistente';
    const existing = acc.find(item => item.assistente === assistant);
    if (existing) {
      existing.contribuicoes++;
    } else {
      acc.push({
        assistente: assistant.split(' ')[0], // Apenas primeiro nome
        contribuicoes: 1,
        cor: getAssistantColor(assistant)
      });
    }
    return acc;
  }, [] as Array<{ assistente: string; contribuicoes: number; cor: string }>);

  // Dados para gráfico de tipos de insight
  const insightTypesData = timelineEvents.reduce((acc, event) => {
    const type = event.insight_type || 'outros';
    const existing = acc.find(item => item.tipo === type);
    if (existing) {
      existing.quantidade++;
    } else {
      acc.push({
        tipo: type,
        quantidade: 1,
        cor: getTypeColor(type)
      });
    }
    return acc;
  }, [] as Array<{ tipo: string; quantidade: number; cor: string }>);

  // Dados para gráfico de atividade por período
  const activityData = timelineEvents.reduce((acc, event) => {
    const date = new Date(event.date);
    const dayKey = date.toLocaleDateString('pt-BR', { 
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    });
    
    const existing = acc.find(item => item.periodo === dayKey);
    if (existing) {
      existing.atividade++;
    } else {
      acc.push({
        periodo: dayKey,
        atividade: 1
      });
    }
    return acc;
  }, [] as Array<{ periodo: string; atividade: number }>).slice(-7);

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Badge className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
        ⏰ {timelineEvents.length} Eventos Reais
      </Badge>
      {data.hasRealData && (
        <>
          <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
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
        title="Linha do Tempo"
        description="Histórico completo de insights e análises dos assistentes"
        showBackButton={true}
        headerActions={headerActions}
      >
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  if (!data.hasRealData || timelineEvents.length === 0) {
    return (
      <PageLayout
        title="Linha do Tempo"
        description="Histórico completo de insights e análises dos assistentes"
        showBackButton={true}
        headerActions={headerActions}
      >
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              Linha do Tempo Aguarda Dados
            </CardTitle>
            <CardDescription className="text-orange-600">
              Para visualizar sua linha do tempo, os assistentes precisam gerar insights reais.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Clock className="h-16 w-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-orange-700 mb-2">
              Timeline Vazia
            </h3>
            <p className="text-sm text-orange-600 mb-4">
              Execute a análise por IA no dashboard para construir sua timeline.
            </p>
            <div className="text-xs text-orange-600 space-y-1 text-left max-w-sm mx-auto">
              <p>• Execute a análise por IA no dashboard</p>
              <p>• Os assistentes irão gerar insights históricos reais</p>
              <p>• Timeline será construída com dados reais</p>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Linha do Tempo"
      description="Histórico completo de insights e análises dos assistentes"
      showBackButton={true}
      headerActions={headerActions}
    >
      {/* Métricas da Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total de Eventos</p>
                <p className="text-2xl font-bold text-blue-800">{timelineEvents.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Assistentes Ativos</p>
                <p className="text-2xl font-bold text-green-800">{data.metrics.assistantsActive}</p>
              </div>
              <Bot className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Alta Prioridade</p>
                <p className="text-2xl font-bold text-purple-800">
                  {timelineEvents.filter(e => e.priority === 'high').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Últimos 7 dias</p>
                <p className="text-2xl font-bold text-orange-800">
                  {timelineEvents.filter(e => {
                    const eventDate = new Date(e.date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return eventDate >= weekAgo;
                  }).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Análise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Temporal */}
        {evolutionData.length > 0 && (
          <Card className="bg-white border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <TrendingUp className="h-5 w-5" />
                Evolução dos Insights
              </CardTitle>
              <CardDescription>Geração de insights ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="data" fontSize={12} />
                    <YAxis fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="insights" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Atividade por Assistente */}
        {assistantData.length > 0 && (
          <Card className="bg-white border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Bot className="h-5 w-5" />
                Contribuições por Assistente
              </CardTitle>
              <CardDescription>Atividade de cada assistente especializado</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assistantData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="assistente" fontSize={12} />
                    <YAxis fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="contribuicoes" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Distribuição por Tipo */}
        {insightTypesData.length > 0 && (
          <Card className="bg-white border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <BarChart3 className="h-5 w-5" />
                Tipos de Insight
              </CardTitle>
              <CardDescription>Distribuição por categoria de análise</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={insightTypesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="quantidade"
                      label={({ tipo, quantidade }) => `${tipo}: ${quantidade}`}
                      fontSize={10}
                    >
                      {insightTypesData.map((entry, index) => (
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

        {/* Atividade Semanal */}
        {activityData.length > 0 && (
          <Card className="bg-white border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Activity className="h-5 w-5" />
                Atividade Semanal
              </CardTitle>
              <CardDescription>Frequência de insights nos últimos dias</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="periodo" fontSize={12} />
                    <YAxis fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="atividade" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timeline de Eventos */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Cronologia de Eventos
          </CardTitle>
          <CardDescription>
            Histórico detalhado de insights gerados pelos assistentes IA
            {lastUpdate && ` • Última análise: ${lastUpdate}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timelineEvents.slice(0, 15).map((event, index) => {
              const IconComponent = event.icon;
              const createdAt = new Date(event.created_at);
              const formattedDate = createdAt.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={event.id} className="relative">
                  {/* Linha conectora */}
                  {index < timelineEvents.slice(0, 15).length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-12 bg-gray-200" />
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 ${event.color} rounded-full flex items-center justify-center shadow-md`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{event.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {event.assistantName}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              event.priority === 'high' ? 'border-red-300 text-red-700' :
                              event.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                              'border-green-300 text-green-700'
                            }`}
                          >
                            {event.priority === 'high' ? 'Alta' :
                             event.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <Bot className="h-3 w-3" />
                          <span>Área: {event.assistantArea}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumo da Timeline */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Resumo da Timeline de Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-blue-600 space-y-1">
            <p>🕒 {timelineEvents.length} eventos cronológicos registrados pelos assistentes</p>
            <p>🤖 {data.metrics.assistantsActive} assistentes IA ativos gerando insights</p>
            <p>📊 {assistantData.length} assistentes contribuindo • {insightTypesData.length} tipos de análise diferentes</p>
            {lastUpdate && (
              <p>⏰ Última análise: {lastUpdate}</p>
            )}
            <p>📈 Timeline construída com dados reais dos assistentes IA</p>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

// Funções auxiliares
function getEventType(insightType: string) {
  const typeMap: { [key: string]: string } = {
    'psychological': 'psicologia',
    'emotional': 'emocional',
    'behavioral': 'comportamental',
    'recommendation': 'recomendacao',
    'analysis': 'analise',
    'insight': 'insight'
  };
  return typeMap[insightType] || insightType;
}

function getEventIcon(insightType: string) {
  const iconMap: { [key: string]: any } = {
    'psychological': Bot,
    'emotional': Target,
    'behavioral': Activity,
    'recommendation': Award,
    'analysis': BarChart3,
    'insight': Sparkles
  };
  return iconMap[insightType] || CheckCircle;
}

function getEventColor(insightType: string) {
  const colorMap: { [key: string]: string } = {
    'psychological': 'bg-purple-500',
    'emotional': 'bg-red-500',
    'behavioral': 'bg-blue-500',
    'recommendation': 'bg-green-500',
    'analysis': 'bg-orange-500',
    'insight': 'bg-yellow-500'
  };
  return colorMap[insightType] || 'bg-gray-500';
}

function getAssistantColor(assistantName: string) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  const hash = assistantName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return colors[Math.abs(hash) % colors.length];
}

function getTypeColor(type: string) {
  const colorMap: { [key: string]: string } = {
    'psychological': '#8B5CF6',
    'emotional': '#EF4444',
    'behavioral': '#3B82F6',
    'recommendation': '#10B981',
    'analysis': '#F59E0B',
    'insight': '#06B6D4'
  };
  return colorMap[type] || '#6B7280';
}
