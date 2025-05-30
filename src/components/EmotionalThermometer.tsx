
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Thermometer, TrendingUp, TrendingDown, Minus, AlertCircle, Bot, Clock } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { PageLayout } from '@/components/layout/PageLayout';

export function EmotionalThermometer() {
  const { data } = useAnalysisData();
  const [currentEmotion, setCurrentEmotion] = useState(5);

  console.log('🌡️ EmotionalThermometer - Dados dos assistentes:', {
    hasRealData: data.hasRealData,
    insightsWithAssistant: data.insightsWithAssistant?.length || 0,
    emotionalData: data.emotionalData?.length || 0
  });

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Badge className="bg-red-100 text-red-800 text-xs sm:text-sm">
        🌡️ Estado Emocional
      </Badge>
      {data.hasRealData && (
        <Badge className="bg-purple-100 text-purple-800 text-xs sm:text-sm">
          🤖 {data.metrics.assistantsActive} Assistentes Ativos
        </Badge>
      )}
      <AIAnalysisButton />
    </div>
  );

  const emotionColors = {
    1: 'bg-red-500',
    2: 'bg-orange-500', 
    3: 'bg-yellow-500',
    4: 'bg-blue-500',
    5: 'bg-green-500'
  };

  const emotionLabels = {
    1: 'Muito Baixo',
    2: 'Baixo',
    3: 'Neutro', 
    4: 'Alto',
    5: 'Muito Alto'
  };

  if (!data.hasRealData) {
    return (
      <PageLayout
        title="Termômetro Emocional"
        description="Monitore seu estado emocional baseado na análise dos assistentes"
        showBackButton={true}
        headerActions={headerActions}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Termômetro Emocional Vazio
            </CardTitle>
            <CardDescription>
              Para monitorar suas emoções, os assistentes precisam analisar suas conversas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Thermometer className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">• Execute a análise por IA no dashboard</p>
                <p className="text-sm text-gray-600">• Os assistentes irão mapear suas emoções</p>
                <p className="text-sm text-gray-600">• Dados serão atualizados automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // Filtrar insights emocionais REAIS dos assistentes
  const emotionalInsights = data.insightsWithAssistant?.filter(insight => 
    insight.insight_type === 'emotional' || 
    insight.assistantArea === 'emocional' ||
    insight.assistantArea === 'psicologia' ||
    insight.description.toLowerCase().includes('emocional') ||
    insight.description.toLowerCase().includes('sentimento')
  ) || [];

  // Calcular nível emocional baseado nos insights reais
  const emotionalLevel = emotionalInsights.length > 0 ? 
    Math.min(5, Math.max(1, Math.round(emotionalInsights.length / 2) + 2)) : 3;

  return (
    <PageLayout
      title="Termômetro Emocional"
      description="Monitore seu estado emocional baseado na análise dos assistentes"
      showBackButton={true}
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Termômetro Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-blue-500" />
              Estado Atual dos Assistentes
            </CardTitle>
            <CardDescription>
              Nível emocional baseado na análise REAL de {data.metrics.assistantsActive} assistentes especializados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              <div className="relative w-32 h-64 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`absolute bottom-0 w-full transition-all duration-500 ${emotionColors[emotionalLevel]}`}
                  style={{ height: `${(emotionalLevel / 5) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white font-bold text-xl">
                    {emotionalLevel}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  {emotionLabels[emotionalLevel]}
                </div>
                <p className="text-gray-600 mb-2">
                  Baseado em {emotionalInsights.length} análises reais
                </p>
                {data.metrics.lastAnalysis && (
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    Última análise: {new Date(data.metrics.lastAnalysis).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    variant={emotionalLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentEmotion(level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Análises dos Assistentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Análises Emocionais dos Assistentes
            </CardTitle>
            <CardDescription>
              Insights emocionais REAIS gerados pelos assistentes especializados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emotionalInsights.length > 0 ? (
                emotionalInsights.slice(0, 5).map((insight, index) => {
                  const createdAt = new Date(insight.createdAt);
                  const formattedDate = createdAt.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div key={insight.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-sm">{insight.title}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {insight.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-800 text-xs flex items-center gap-1">
                            <Bot className="h-3 w-3" />
                            {insight.assistantName}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formattedDate}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ml-2 ${
                          insight.priority === 'high' ? 'border-red-300 text-red-700' :
                          insight.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                          'border-green-300 text-green-700'
                        }`}
                      >
                        {insight.priority === 'high' ? 'Alta' :
                         insight.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Thermometer className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Nenhuma análise emocional encontrada
                  </h3>
                  <p className="text-xs text-gray-600">
                    Os assistentes ainda não geraram insights emocionais específicos
                  </p>
                </div>
              )}
            </div>

            {/* Resumo dos Assistentes */}
            {emotionalInsights.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Resumo da Análise</h4>
                <div className="text-xs text-blue-600 space-y-1">
                  <p>🤖 {data.metrics.assistantsActive} assistentes especializados</p>
                  <p>🧠 {emotionalInsights.length} insights emocionais gerados</p>
                  <p>📊 Nível emocional calculado: {emotionLabels[emotionalLevel]}</p>
                  {data.metrics.lastAnalysis && (
                    <p>⏰ Última atualização: {new Date(data.metrics.lastAnalysis).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
