
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { AlertTriangle, CheckCircle, Info, Zap, Brain, Clock, Bot } from 'lucide-react';

export function InsightsAlerts() {
  const { data, isLoading } = useAnalysisData();

  console.log('🚨 InsightsAlerts - Dados REAIS:', {
    hasRealData: data.hasRealData,
    insightsWithAssistant: data.insightsWithAssistant?.length || 0,
    assistantsActive: data.metrics.assistantsActive
  });

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
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Central de Insights dos Assistentes
          </CardTitle>
          <CardDescription>
            Análises REAIS geradas por {data.metrics.assistantsActive} assistentes especializados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Alta Prioridade */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Alta Prioridade</span>
                <Badge className="bg-red-100 text-red-800 text-xs">
                  {highPriorityInsights.length}
                </Badge>
              </div>
              <p className="text-sm text-red-600">
                Insights que requerem atenção imediata dos assistentes
              </p>
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
              <p className="text-sm text-yellow-600">
                Descobertas importantes para desenvolvimento
              </p>
            </div>

            {/* Baixa Prioridade */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Observações</span>
                <Badge className="bg-green-100 text-green-800 text-xs">
                  {lowPriorityInsights.length}
                </Badge>
              </div>
              <p className="text-sm text-green-600">
                Insights informativos dos assistentes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Recentes REAIS */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Insights Mais Recentes
          </CardTitle>
          <CardDescription>
            Últimas análises geradas pelos assistentes especializados
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
    </div>
  );
}
