
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Eye, Lightbulb } from 'lucide-react';

interface ConsciousnessInsightsProps {
  insights: any[];
}

export function ConsciousnessInsights({ insights }: ConsciousnessInsightsProps) {
  if (insights.length === 0) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 text-blue-400 mx-auto mb-3" />
          <h3 className="font-medium text-blue-800 mb-2">Aguardando Análise de Consciência</h3>
          <p className="text-sm text-blue-600">
            Configure e analise conversas para gerar insights sobre clareza existencial e propósito.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Insights da Consciência ({insights.length})
        </CardTitle>
        <p className="text-sm text-gray-600">
          Padrões existenciais extraídos das suas conversas e reflexões
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.slice(0, 8).map((insight, index) => {
            const getPriorityIcon = (priority: string) => {
              switch (priority) {
                case 'high': return <Eye className="h-4 w-4 text-red-500" />;
                case 'medium': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
                case 'low': return <Brain className="h-4 w-4 text-blue-500" />;
                default: return <Brain className="h-4 w-4 text-gray-500" />;
              }
            };

            const getPriorityColor = (priority: string) => {
              switch (priority) {
                case 'high': return 'border-red-200 bg-red-50';
                case 'medium': return 'border-yellow-200 bg-yellow-50';
                case 'low': return 'border-blue-200 bg-blue-50';
                default: return 'border-gray-200 bg-gray-50';
              }
            };

            return (
              <div key={insight.id || index} className={`border rounded-lg p-4 ${getPriorityColor(insight.priority)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(insight.priority)}
                    <h4 className="font-medium text-slate-800">{insight.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-100 text-purple-800 text-xs">
                      {insight.assistantName || 'Sistema'}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {insight.createdAt ? new Date(insight.createdAt).toLocaleDateString('pt-BR') : 'Hoje'}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                  {insight.description}
                </p>
                
                {/* Categorias de consciência */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {insight.title?.toLowerCase().includes('clareza') && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">Clareza</Badge>
                  )}
                  {insight.title?.toLowerCase().includes('propósito') && (
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">Propósito</Badge>
                  )}
                  {insight.description?.toLowerCase().includes('sombra') && (
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700">Sombra</Badge>
                  )}
                  {insight.description?.toLowerCase().includes('alinhamento') && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Alinhamento</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Área: {insight.assistantArea || 'Consciência'}</span>
                  <span>Tipo: {insight.insight_type || 'Existencial'}</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {insights.length > 8 && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              Mostrando 8 de {insights.length} insights. Análise completa disponível no relatório detalhado.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
