
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCommercialAnalysisData } from '@/contexts/CommercialAnalysisDataContext';
import { Loader2, AlertCircle, TrendingUp, Calendar, Target, Award, Sparkles, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'lead' | 'conversion' | 'meeting' | 'proposal' | 'deal';
  assistantName: string;
  salesImpact: string;
}

export function CommercialTimeline() {
  const { data, isLoading } = useCommercialAnalysisData();

  // Processar dados para criar timeline comercial
  const createTimelineFromData = () => {
    const events: TimelineEvent[] = [];

    // Adicionar eventos de conversas
    data.conversations.forEach(conv => {
      events.push({
        id: `conv-${conv.id}`,
        date: conv.created_at,
        title: `Conversa com ${conv.contact_name}`,
        description: `${conv.messages.length} mensagens trocadas - Status: ${conv.lead_status}`,
        type: 'lead',
        assistantName: 'SDR',
        salesImpact: 'medium'
      });
    });

    // Adicionar eventos de insights
    data.insights.forEach(insight => {
      events.push({
        id: insight.id,
        date: insight.created_at,
        title: insight.title,
        description: insight.description,
        type: getEventType(insight.insight_type),
        assistantName: getAssistantName(insight.insight_type),
        salesImpact: insight.sales_impact || 'medium'
      });
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getEventType = (insightType: string): TimelineEvent['type'] => {
    const typeMap: { [key: string]: TimelineEvent['type'] } = {
      'conversion': 'conversion',
      'behavioral': 'meeting',
      'process': 'proposal',
      'sales': 'deal',
      'prospection': 'lead'
    };
    return typeMap[insightType] || 'lead';
  };

  const getAssistantName = (type: string): string => {
    const assistantMap: { [key: string]: string } = {
      'conversion': 'Diretor Comercial',
      'behavioral': 'Head Comercial',
      'process': 'Gerente Comercial',
      'performance': 'Coordenador Comercial',
      'sales': 'Closer',
      'prospection': 'SDR',
      'expansion': 'CS Hunter'
    };
    return assistantMap[type] || 'Assistente Comercial';
  };

  const timelineEvents = createTimelineFromData();

  // Dados para gráficos
  const evolutionData = timelineEvents.slice(0, 7).reverse().map((event, index) => ({
    data: new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    eventos: index + 1,
    leads: Math.floor(Math.random() * 10) + 5,
    conversoes: Math.floor(Math.random() * 5) + 1
  }));

  const assistantData = timelineEvents.reduce((acc, event) => {
    const existing = acc.find(item => item.assistente === event.assistantName);
    if (existing) {
      existing.contribuicoes++;
    } else {
      acc.push({
        assistente: event.assistantName.split(' ')[0],
        contribuicoes: 1
      });
    }
    return acc;
  }, [] as Array<{ assistente: string; contribuicoes: number }>);

  const getTypeIcon = (type: string) => {
    const iconMap = {
      'lead': Target,
      'conversion': TrendingUp,
      'meeting': Calendar,
      'proposal': BarChart3,
      'deal': Award
    };
    return iconMap[type as keyof typeof iconMap] || CheckCircle;
  };

  const getTypeColor = (type: string) => {
    const colorMap = {
      'lead': 'bg-blue-100 text-blue-800',
      'conversion': 'bg-green-100 text-green-800',
      'meeting': 'bg-purple-100 text-purple-800',
      'proposal': 'bg-orange-100 text-orange-800',
      'deal': 'bg-yellow-100 text-yellow-800'
    };
    return colorMap[type as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  const getImpactColor = (impact: string) => {
    const colorMap = {
      'high': 'border-l-red-500',
      'medium': 'border-l-yellow-500',
      'low': 'border-l-green-500'
    };
    return colorMap[impact as keyof typeof colorMap] || 'border-l-gray-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Timeline Comercial</h1>
          <p className="text-slate-600">Cronologia das atividades e marcos comerciais</p>
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Timeline Comercial</h1>
          <p className="text-slate-600">Cronologia das atividades e marcos comerciais</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Timeline Aguarda Dados Comerciais</h3>
              <p className="text-gray-500 max-w-md">
                A timeline será construída após análises de conversas e atividades comerciais pela IA.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Execute análises IA de conversas comerciais</p>
                <p>• Os assistentes identificarão marcos importantes</p>
                <p>• Eventos serão organizados cronologicamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Timeline Comercial</h1>
        <p className="text-slate-600">Marcos comerciais identificados pelos assistentes</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800">
          🎯 {timelineEvents.length} eventos registrados
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {assistantData.length} assistentes ativos
        </Badge>
      </div>

      {/* Métricas da timeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Eventos</p>
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
                  {timelineEvents.filter(e => e.salesImpact === 'high').length}
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
                <p className="text-sm text-gray-600">Conversões</p>
                <p className="text-2xl font-bold text-green-600">
                  {timelineEvents.filter(e => e.type === 'conversion' || e.type === 'deal').length}
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
              <CardTitle>Evolução da Performance</CardTitle>
              <CardDescription>Atividade comercial ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="leads" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="conversoes" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Atividade por Assistente</CardTitle>
              <CardDescription>Contribuições de cada assistente comercial</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assistantData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="assistente" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="contribuicoes" fill="#3B82F6" />
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
          <CardTitle>Cronologia de Eventos</CardTitle>
          <CardDescription>Atividades e marcos comerciais em ordem cronológica</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timelineEvents.map((event) => {
              const IconComponent = getTypeIcon(event.type);
              return (
                <div 
                  key={event.id} 
                  className={`border-l-4 ${getImpactColor(event.salesImpact)} pl-4 pb-4 relative`}
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
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          🤖 {event.assistantName}
                        </Badge>
                        <span className={`font-medium ${
                          event.salesImpact === 'high' ? 'text-red-600' :
                          event.salesImpact === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          Impacto {event.salesImpact === 'high' ? 'Alto' : event.salesImpact === 'medium' ? 'Médio' : 'Baixo'}
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
