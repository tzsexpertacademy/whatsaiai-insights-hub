
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle, Bot, Clock, Brain, TrendingUp, MessageCircle } from 'lucide-react';

export function ObservatoryTimeline() {
  const { data, isLoading } = useAnalysisData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Linha do Tempo do YumerMind</h1>
          <p className="text-slate-600">Cronologia das análises realizadas pelos assistentes</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (!data.hasRealData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Linha do Tempo do YumerMind</h1>
          <p className="text-slate-600">Cronologia das análises realizadas pelos assistentes</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Timeline Aguardando Dados</h3>
              <p className="text-gray-500 max-w-md">
                A linha do tempo será populada conforme os assistentes processarem suas conversas.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Execute análises por IA no dashboard</p>
                <p>• Os assistentes registrarão eventos na timeline</p>
                <p>• Histórico será construído automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lastUpdate = data.metrics.lastAnalysis ? 
    new Date(data.metrics.lastAnalysis).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : null;

  // Combinar insights e conversas para criar timeline
  const timelineEvents = [
    ...data.insightsWithAssistant.map(insight => ({
      id: insight.id,
      type: 'insight',
      title: insight.title,
      description: insight.description,
      assistantName: insight.assistantName,
      assistantArea: insight.assistantArea,
      timestamp: insight.createdAt,
      priority: insight.priority
    })),
    ...data.conversations.slice(0, 5).map(conv => ({
      id: conv.id,
      type: 'conversation',
      title: `Conversa com ${conv.contact_name}`,
      description: `${conv.messages?.length || 0} mensagens processadas`,
      assistantName: 'Sistema de Análise',
      assistantArea: 'geral',
      timestamp: conv.created_at,
      priority: 'medium'
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getEventIcon = (type: string) => {
    return type === 'insight' ? Brain : MessageCircle;
  };

  const getEventColor = (type: string, priority?: string) => {
    if (type === 'insight') {
      return priority === 'high' ? 'bg-red-100 text-red-800' : 
             priority === 'low' ? 'bg-green-100 text-green-800' : 
             'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Linha do Tempo do YumerMind</h1>
        <p className="text-slate-600">Cronologia das análises e insights gerados pelos assistentes</p>
      </div>

      {/* Indicadores dos assistentes */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          🔮 Timeline dos Assistentes
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          📊 {timelineEvents.length} eventos registrados
        </Badge>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          🤖 {data.metrics.assistantsActive} assistentes ativos
        </Badge>
        {lastUpdate && (
          <Badge variant="outline" className="bg-gray-50 text-gray-700">
            <Clock className="h-3 w-3 mr-1" />
            Última atualização: {lastUpdate}
          </Badge>
        )}
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Eventos</p>
                <p className="text-2xl font-bold text-gray-800">{timelineEvents.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Insights Gerados</p>
                <p className="text-2xl font-bold text-purple-600">{data.insightsWithAssistant.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversas</p>
                <p className="text-2xl font-bold text-green-600">{data.conversations.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assistentes</p>
                <p className="text-2xl font-bold text-orange-600">{data.metrics.assistantsActive}</p>
              </div>
              <Bot className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline dos eventos */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Cronologia de Eventos dos Assistentes</CardTitle>
          <CardDescription>Histórico ordenado das análises e insights gerados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {timelineEvents.map((event, index) => {
              const IconComponent = getEventIcon(event.type);
              return (
                <div key={event.id} className="flex items-start space-x-4 relative">
                  {/* Linha de conexão */}
                  {index < timelineEvents.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  {/* Ícone do evento */}
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  {/* Conteúdo do evento */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{event.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-800">
                          🔮 {event.assistantName}
                        </Badge>
                        <Badge className={getEventColor(event.type, event.priority)}>
                          {event.type === 'insight' ? 'Insight' : 'Conversa'}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{event.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span>Área: {event.assistantArea}</span>
                        {event.priority && (
                          <span className="capitalize">Prioridade: {event.priority}</span>
                        )}
                      </div>
                      <span>
                        {new Date(event.timestamp).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {timelineEvents.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum evento registrado ainda pelos assistentes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
