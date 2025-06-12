
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Brain,
  MessageSquare
} from 'lucide-react';

interface ConversationMetricsProps {
  conversations: any[];
  insights: any[];
  protectedStats: any;
}

export function ConversationMetrics({ conversations, insights, protectedStats }: ConversationMetricsProps) {
  const totalConversations = conversations.length;
  const completedAnalyses = conversations.filter(c => c.analysis_status === 'completed').length;
  const analysisCompletionRate = totalConversations > 0 ? (completedAnalyses / totalConversations) * 100 : 0;

  const priorityDistribution = conversations.reduce((acc, conv) => {
    acc[conv.priority] = (acc[conv.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const insightTypeDistribution = insights.reduce((acc, insight) => {
    const type = insight.insight_type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const assistantDistribution = insights.reduce((acc, insight) => {
    const assistant = insight.assistantName || 'Desconhecido';
    acc[assistant] = (acc[assistant] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-green-600" />
              Taxa de Conclusão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Análises Concluídas</span>
                <span>{Math.round(analysisCompletionRate)}%</span>
              </div>
              <Progress value={analysisCompletionRate} className="h-2" />
              <p className="text-xs text-gray-500">
                {completedAnalyses} de {totalConversations} conversas analisadas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4 text-purple-600" />
              Insights por Conversa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">
                {completedAnalyses > 0 ? (insights.length / completedAnalyses).toFixed(1) : '0'}
              </p>
              <p className="text-xs text-gray-500">
                Média de insights gerados por conversa analisada
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Assistentes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{protectedStats.assistantsActive}</p>
              <p className="text-xs text-gray-500">
                Assistentes gerando insights ativamente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Prioridade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribuição por Prioridade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(priorityDistribution).map(([priority, count]) => {
              const percentage = totalConversations > 0 ? (count / totalConversations) * 100 : 0;
              const colorClass = priority === 'high' ? 'bg-red-500' : 
                                priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500';
              
              return (
                <div key={priority} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{priority}</span>
                    <span>{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${colorClass}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por Tipo de Insight */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Tipos de Insights Gerados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(insightTypeDistribution).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="capitalize font-medium">{type}</span>
                <span className="text-lg font-bold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por Assistente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Performance dos Assistentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(assistantDistribution).map(([assistant, count]) => {
              const percentage = insights.length > 0 ? (count / insights.length) * 100 : 0;
              
              return (
                <div key={assistant} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{assistant}</span>
                    <span>{count} insights ({Math.round(percentage)}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
