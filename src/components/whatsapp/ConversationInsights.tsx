
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain,
  MessageSquare,
  TrendingUp,
  User,
  AlertTriangle,
  Star,
  Heart,
  Target
} from 'lucide-react';

interface ConversationInsightsProps {
  insights: any[];
  conversations: any[];
}

export function ConversationInsights({ insights, conversations }: ConversationInsightsProps) {
  // Validar se insights é um array
  const validInsights = Array.isArray(insights) ? insights : [];
  const validConversations = Array.isArray(conversations) ? conversations : [];

  console.log('ConversationInsights - Insights recebidos:', validInsights);
  console.log('ConversationInsights - Conversas recebidas:', validConversations);

  const getInsightIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'emotional': return <Heart className="h-4 w-4" />;
      case 'behavioral': return <User className="h-4 w-4" />;
      case 'strategic': return <Target className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const groupedInsights = validInsights.reduce((groups, insight) => {
    const assistant = insight.assistantName || 'Assistente Desconhecido';
    if (!groups[assistant]) {
      groups[assistant] = [];
    }
    groups[assistant].push(insight);
    return groups;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Resumo da Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Brain className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{validInsights.length}</p>
              <p className="text-sm text-blue-700">Insights Gerados</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{validConversations.length}</p>
              <p className="text-sm text-green-700">Conversas Analisadas</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <User className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{Object.keys(groupedInsights).length}</p>
              <p className="text-sm text-purple-700">Assistentes Ativos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights por Assistente */}
      {Object.entries(groupedInsights).map(([assistantName, assistantInsights]) => (
        <Card key={assistantName}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              {assistantName}
              <Badge variant="outline">{assistantInsights.length} insights</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assistantInsights.map((insight: any, index: number) => (
                <div key={insight.id || index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.insight_type)}
                      <h3 className="font-medium">{insight.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority || 'medium'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {insight.assistantArea}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Tipo: {insight.insight_type}</span>
                    <span>{new Date(insight.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {validInsights.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum insight disponível</h3>
            <p className="text-gray-500 mb-4">
              Execute uma análise de IA nas conversas marcadas para gerar insights
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
