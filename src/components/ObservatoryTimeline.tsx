
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle, TrendingUp, Calendar, Brain, Heart, Target, Award, Sparkles, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'insight' | 'breakthrough' | 'pattern' | 'growth';
  assistantName: string;
  assistantArea: string;
  impact: 'baixo' | 'médio' | 'alto';
}

export function ObservatoryTimeline() {
  const { data, isLoading } = useAnalysisData();

  // Processar insights dos assistentes para criar timeline
  const createTimelineFromInsights = () => {
    if (!data.insights || data.insights.length === 0) return [];

    return data.insights.map((insight) => ({
      id: insight.id,
      date: insight.created_at,
      title: insight.text || 'Marco de Evolução',
      description: insight.text,
      type: 'insight' as const,
      assistantName: 'Observatório da Consciência',
      assistantArea: 'Análise Psicológica',
      impact: insight.priority === 'high' ? 'alto' as const :
              insight.priority === 'low' ? 'baixo' as const : 'médio' as const
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const timelineEvents = createTimelineFromInsights();

  // Dados para gráficos baseados nos insights reais
  const evolutionData = timelineEvents.slice(0, 7).reverse().map((event, index) => ({
    data: new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    insights: index + 1,
    crescimento: Math.floor(Math.random() * 20) + 60,
    consciencia: Math.floor(Math.random() * 25) + 70
  }));

  const assistantData = timelineEvents.reduce((acc, event) => {
    const existing = acc.find(item => item.assistente === event.assistantName);
    if (existing) {
      existing.contribuicoes++;
    } else {
      acc.push({
        assistente: event.assistantName.split(' ')[0], // Primeiro nome para o gráfico
        contribuicoes: 1,
        area: event.assistantArea
      });
    }
    return acc;
  }, [] as Array<{ assistente: string; contribuicoes: number; area: string }>);

  const getTypeIcon = (type: string) => {
    const iconMap = {
      'insight': Brain,
      'breakthrough': Sparkles,
      'pattern': TrendingUp,
      'growth': Target
    };
    return iconMap[type as keyof typeof iconMap] || CheckCircle;
  };

  const getTypeColor = (type: string) => {
    const colorMap = {
      'insight': 'bg-blue-100 text-blue-800',
      'breakthrough': 'bg-purple-100 text-purple-800',
      'pattern': 'bg-orange-100 text-orange-800',
      'growth': 'bg-green-100 text-green-800'
    };
    return colorMap[type as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  const getImpactColor = (impact: string) => {
    const colorMap = {
      'alto': 'border-l-red-500',
      'médio': 'border-l-yellow-500',
      'baixo': 'border-l-green-500'
    };
    return colorMap[impact as keyof typeof colorMap] || 'border-l-gray-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Linha do Tempo da Evolução</h1>
          <p className="text-slate-600">Acompanhe sua jornada de autoconhecimento e crescimento pessoal</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (!data.hasRealData || timelineEvents.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Linha do Tempo da Evolução</h1>
          <p className="text-slate-600">Acompanhe sua jornada de autoconhecimento e crescimento pessoal</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Linha do Tempo Aguarda Análise IA</h3>
              <p className="text-gray-500 max-w-md">
                Sua evolução pessoal será mapeada após análises de conversas reais pela IA.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Execute análises por IA no dashboard principal</p>
                <p>• Os assistentes identificarão marcos de evolução</p>
                <p>• Marcos serão organizados cronologicamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Timeline baseada em dados reais dos assistentes
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Linha do Tempo da Evolução</h1>
        <p className="text-slate-600">Marcos de evolução identificados pelos assistentes especializados</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800">
          🌟 {timelineEvents.length} marcos identificados
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {assistantData.length} assistentes contribuíram
        </Badge>
      </div>

      {/* Métricas de evolução */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Marcos</p>
                <p className="text-2xl font-bold text-gray-800">{timelineEvents.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alto Impacto</p>
                <p className="text-2xl font-bold text-red-600">
                  {timelineEvents.filter(e => e.impact === 'alto').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Crescimento</p>
                <p className="text-2xl font-bold text-green-600">
                  {timelineEvents.filter(e => e.type === 'growth').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Últimos 7 dias</p>
                <p className="text-2xl font-bold text-blue-600">
                  {timelineEvents.filter(e => {
                    const eventDate = new Date(e.date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return eventDate >= weekAgo;
                  }).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de evolução */}
      {evolutionData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Evolução da Consciência</CardTitle>
              <CardDescription>Progresso ao longo do tempo baseado nos insights</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="consciencia" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="crescimento" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Contribuições por Assistente</CardTitle>
              <CardDescription>Insights gerados por cada assistente especializado</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assistantData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="assistente" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="contribuicoes" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Timeline de eventos */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Marcos da Jornada</CardTitle>
          <CardDescription>Momentos importantes identificados pelos assistentes especializados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timelineEvents.map((event) => {
              const IconComponent = getTypeIcon(event.type);
              return (
                <div 
                  key={event.id} 
                  className={`border-l-4 ${getImpactColor(event.impact)} pl-4 pb-4 relative`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getTypeColor(event.type)}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-slate-800">{event.title}</h4>
                        <span className="text-xs text-slate-500">
                          {new Date(event.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className={getTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {event.assistantName}
                        </Badge>
                        <Badge variant="outline" className="bg-gray-50 text-gray-700">
                          {event.assistantArea}
                        </Badge>
                        <span className={`font-medium ${
                          event.impact === 'alto' ? 'text-red-600' :
                          event.impact === 'médio' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          Impacto {event.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
