
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function InsightsAlerts() {
  const { data, isLoading } = useAnalysisData();

  const getAssistantIcon = (area: string) => {
    const iconMap: { [key: string]: string } = {
      'psicologia': '🔮',
      'financeiro': '💰',
      'saude': '⚡',
      'estrategia': '🎯',
      'proposito': '🌟',
      'criatividade': '🎨',
      'relacionamentos': '👥'
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
      'relacionamentos': 'bg-indigo-100 text-indigo-800'
    };
    return colorMap[area] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle>Alertas e Insights</CardTitle>
        <CardDescription>Padrões e tendências detectados nas suas interações</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : !data.hasRealData || data.insights.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Nenhum insight disponível ainda.
                <br />
                Crie conversas de teste e execute a análise por IA.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {data.insightsWithAssistant.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-slate-50 border border-slate-200">
                <Brain className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {insight.assistantName && (
                      <Badge className={getAssistantColor(insight.assistantArea || '')}>
                        {getAssistantIcon(insight.assistantArea || '')} {insight.assistantName}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-700">{insight.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
