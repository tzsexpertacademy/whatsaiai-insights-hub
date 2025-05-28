
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle, Brain, Lightbulb, ArrowRight } from 'lucide-react';

export function RecommendationsSection() {
  const { data, isLoading } = useAnalysisData();

  const getAssistantIcon = (area: string) => {
    const iconMap: { [key: string]: string } = {
      'psicologia': '🔮',
      'financeiro': '💰',
      'saude': '⚡',
      'estrategia': '🎯',
      'proposito': '🌟',
      'criatividade': '🎨',
      'relacionamentos': '👥',
      'geral': '🤖'
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
      'geral': 'bg-gray-100 text-gray-800'
    };
    return colorMap[area] || 'bg-gray-100 text-gray-800';
  };

  console.log('💡 RecommendationsSection - Dados recebidos:', {
    hasRealData: data.hasRealData,
    recommendations: data.recommendations?.length || 0,
    recommendationsWithAssistant: data.recommendationsWithAssistant?.length || 0,
    isLoading
  });

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          Recomendações dos Assistentes
        </CardTitle>
        <CardDescription>
          Sugestões personalizadas baseadas na análise comportamental
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Carregando recomendações...</span>
          </div>
        ) : !data.hasRealData ? (
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Nenhuma recomendação disponível ainda.
                <br />
                Configure assistentes e execute a análise por IA.
              </p>
            </div>
          </div>
        ) : data.recommendations.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Nenhuma recomendação gerada ainda.
                <br />
                Clique em "Atualizar com IA" para gerar sugestões.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {data.recommendationsWithAssistant.slice(0, 3).map((recommendation, index) => (
              <div 
                key={recommendation.id || index}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <h4 className="font-medium text-blue-900">
                      {recommendation.title || `Recomendação ${index + 1}`}
                    </h4>
                  </div>
                  {recommendation.assistantName && (
                    <Badge className={getAssistantColor(recommendation.assistantArea || 'geral')}>
                      {getAssistantIcon(recommendation.assistantArea || 'geral')} {recommendation.assistantName}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-blue-800 mb-4 leading-relaxed">
                  {recommendation.text || recommendation.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    {recommendation.category && (
                      <span className="px-2 py-1 bg-blue-100 rounded-full">
                        {recommendation.category}
                      </span>
                    )}
                    {recommendation.createdAt && (
                      <span>
                        {new Date(recommendation.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="text-blue-700 border-blue-300 hover:bg-blue-100">
                    Implementar
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {data.recommendationsWithAssistant.length > 3 && (
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-500">
                  E mais {data.recommendationsWithAssistant.length - 3} recomendações disponíveis...
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Ver Todas as Recomendações
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
