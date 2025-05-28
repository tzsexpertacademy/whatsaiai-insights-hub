
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2, AlertCircle, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function InsightsAlerts() {
  const { data, isLoading } = useAnalysisData();

  // Debug: Log dos dados para verificar origem dos insights
  console.log('🔍 DEBUG InsightsAlerts - Dados completos:', {
    hasRealData: data.hasRealData,
    insights: data.insights,
    insightsWithAssistant: data.insightsWithAssistant,
    isLoading
  });

  // Debug: Verificar estrutura dos insights
  if (data.insightsWithAssistant.length > 0) {
    console.log('🔍 DEBUG Primeiro insight:', data.insightsWithAssistant[0]);
    console.log('🔍 DEBUG Todos os insights com assistentes:', data.insightsWithAssistant.map(insight => ({
      id: insight.id,
      assistantName: insight.assistantName,
      assistantArea: insight.assistantArea,
      category: insight.category,
      insight_type: insight.insight_type,
      title: insight.title || insight.text?.substring(0, 50)
    })));
  }

  const getAssistantIcon = (area: string) => {
    const iconMap: { [key: string]: string } = {
      'psicologia': '🔮',
      'financeiro': '💰',
      'saude': '⚡',
      'estrategia': '🎯',
      'proposito': '🌟',
      'criatividade': '🎨',
      'relacionamentos': '👥',
      'geral': '🤖',
      'emotional': '❤️',
      'behavioral': '🧠',
      'growth': '📈'
    };
    return iconMap[area] || '🤖';
  };

  const getAssistantColor = (area: string) => {
    const colorMap: { [key: string]: string } = {
      'psicologia': 'bg-purple-100 text-purple-800',
      'financeiro': 'bg-green-100 text-green-800',
      'saude': 'bg-blue-100 text-blue-800',
      'estrategia': 'bg-orange-100 text-orange-800',
      'proposito': 'bg-yellow-100 text-yellow-800',
      'criatividade': 'bg-pink-100 text-pink-800',
      'relacionamentos': 'bg-indigo-100 text-indigo-800',
      'geral': 'bg-gray-100 text-gray-800',
      'emotional': 'bg-red-100 text-red-800',
      'behavioral': 'bg-blue-100 text-blue-800',
      'growth': 'bg-green-100 text-green-800'
    };
    return colorMap[area] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Target className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Alertas e Insights dos Assistentes IA
        </CardTitle>
        <CardDescription>
          Padrões e tendências detectados pelos assistentes especializados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Carregando insights...</span>
          </div>
        ) : !data.hasRealData ? (
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Nenhum insight disponível ainda.
                <br />
                Configure assistentes e execute a análise por IA.
              </p>
            </div>
          </div>
        ) : data.insightsWithAssistant.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Nenhum insight gerado ainda.
                <br />
                Clique em "Atualizar Relatório" para gerar análises.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Debug info - Mostra origem dos insights */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
              <h4 className="font-semibold text-yellow-800 mb-2">🔍 DEBUG - Origem dos Insights:</h4>
              <div className="space-y-1 text-yellow-700">
                <p><strong>Total de insights:</strong> {data.insightsWithAssistant.length}</p>
                <p><strong>Insights únicos por assistente:</strong></p>
                {data.insightsWithAssistant.map((insight, index) => (
                  <div key={index} className="ml-4 text-xs">
                    • <strong>{insight.assistantName || 'Sem nome'}</strong> 
                    (área: {insight.assistantArea || 'não definida'}, 
                    categoria: {insight.category || insight.insight_type || 'não definida'})
                  </div>
                ))}
              </div>
            </div>

            {data.insightsWithAssistant.slice(0, 6).map((insight, index) => (
              <div 
                key={insight.id || index} 
                className={`flex items-start gap-3 p-4 rounded-lg border-l-4 ${getPriorityColor(insight.priority || 'medium')}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getPriorityIcon(insight.priority || 'medium')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 break-words">
                      {insight.title || insight.text?.substring(0, 50) || 'Insight dos Assistentes'}
                    </h4>
                    <div className="flex flex-wrap gap-1 flex-shrink-0">
                      {insight.assistantName && (
                        <Badge className={getAssistantColor(insight.assistantArea || 'geral')}>
                          {getAssistantIcon(insight.assistantArea || 'geral')} {insight.assistantName}
                        </Badge>
                      )}
                      {insight.priority && (
                        <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}>
                          {insight.priority === 'high' ? 'Alto' : insight.priority === 'medium' ? 'Médio' : 'Baixo'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 break-words mb-2">
                    {insight.text || insight.content || insight.description}
                  </p>
                  {(insight.category || insight.insight_type) && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded-full">
                        {insight.category || insight.insight_type}
                      </span>
                      {insight.createdAt && (
                        <span>
                          {new Date(insight.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {data.insightsWithAssistant.length > 6 && (
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-500">
                  E mais {data.insightsWithAssistant.length - 6} insights disponíveis...
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
