
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock,
  MessageSquare,
  Brain,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface ConversationTimelineProps {
  conversations: any[];
  insights: any[];
}

export function ConversationTimeline({ conversations, insights }: ConversationTimelineProps) {
  // Criar timeline combinando conversas e insights
  const timelineEvents = [
    ...conversations.map(conv => ({
      id: `conv-${conv.id}`,
      type: 'conversation',
      title: `Conversa marcada: ${conv.contact_name}`,
      description: `Prioridade: ${conv.priority} | Status: ${conv.analysis_status}`,
      timestamp: conv.marked_at,
      status: conv.analysis_status,
      data: conv
    })),
    ...insights.map(insight => ({
      id: `insight-${insight.id}`,
      type: 'insight',
      title: insight.title,
      description: `${insight.assistantName} - ${insight.assistantArea}`,
      timestamp: insight.created_at,
      status: 'completed',
      data: insight
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getEventIcon = (type: string, status?: string) => {
    if (type === 'conversation') {
      switch (status) {
        case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'processing': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
        case 'failed': return <AlertCircle className="h-5 w-5 text-red-500" />;
        default: return <Clock className="h-5 w-5 text-gray-500" />;
      }
    }
    return <Brain className="h-5 w-5 text-purple-500" />;
  };

  const getEventColor = (type: string, status?: string) => {
    if (type === 'conversation') {
      switch (status) {
        case 'completed': return 'border-green-200 bg-green-50';
        case 'processing': return 'border-blue-200 bg-blue-50';
        case 'failed': return 'border-red-200 bg-red-50';
        default: return 'border-gray-200 bg-gray-50';
      }
    }
    return 'border-purple-200 bg-purple-50';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 dias
      return date.toLocaleDateString('pt-BR', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline de Análises
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timelineEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma atividade de análise registrada</p>
            <p className="text-sm mt-2">Marque conversas e execute análises para ver a timeline</p>
          </div>
        ) : (
          <div className="relative">
            {/* Linha vertical da timeline */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-4">
              {timelineEvents.map((event, index) => (
                <div key={event.id} className="relative flex items-start gap-4">
                  {/* Ícone do evento */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getEventColor(event.type, event.status)}`}>
                    {getEventIcon(event.type, event.status)}
                  </div>
                  
                  {/* Conteúdo do evento */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {event.type === 'conversation' ? 'Conversa' : 'Insight'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600">{event.description}</p>
                    
                    {event.type === 'conversation' && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge 
                          variant={
                            event.status === 'completed' ? 'default' :
                            event.status === 'processing' ? 'secondary' :
                            event.status === 'failed' ? 'destructive' : 
                            'outline'
                          }
                          className="text-xs"
                        >
                          {event.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {event.data.contact_phone}
                        </span>
                      </div>
                    )}
                    
                    {event.type === 'insight' && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {event.data.insight_type}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
