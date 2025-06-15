
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock,
  MessageSquare,
  Brain,
  User,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react';

interface ConversationTimelineProps {
  conversations: any[];
  insights: any[];
}

export function ConversationTimeline({ conversations, insights }: ConversationTimelineProps) {
  // Combinar conversas e insights em uma timeline única
  const timelineItems = [
    ...conversations.map(conv => ({
      id: conv.id,
      type: 'conversation',
      title: `Conversa marcada: ${conv.contact_name}`,
      description: `Telefone: ${conv.contact_phone}`,
      timestamp: conv.marked_at,
      status: conv.analysis_status,
      priority: conv.priority,
      data: conv
    })),
    ...insights.map(insight => ({
      id: insight.id,
      type: 'insight',
      title: insight.title,
      description: insight.description,
      timestamp: insight.created_at,
      status: 'completed',
      priority: insight.priority || 'medium',
      data: insight
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getIcon = (type: string, status?: string) => {
    if (type === 'conversation') {
      switch (status) {
        case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'processing': return <Clock className="h-5 w-5 text-blue-500" />;
        case 'failed': return <AlertTriangle className="h-5 w-5 text-red-500" />;
        default: return <MessageSquare className="h-5 w-5 text-yellow-500" />;
      }
    } else {
      return <Brain className="h-5 w-5 text-purple-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Timeline de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timelineItems.length > 0 ? (
          <div className="space-y-4">
            {timelineItems.map((item, index) => (
              <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {getIcon(item.type, item.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                      {item.type === 'conversation' && (
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{new Date(item.timestamp).toLocaleString('pt-BR')}</span>
                    <span className="flex items-center gap-1">
                      {item.type === 'conversation' ? (
                        <>
                          <User className="h-3 w-3" />
                          Conversa
                        </>
                      ) : (
                        <>
                          <Star className="h-3 w-3" />
                          Insight
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhuma atividade ainda</h3>
            <p className="text-sm">Marque conversas para análise para ver a timeline de atividades</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
