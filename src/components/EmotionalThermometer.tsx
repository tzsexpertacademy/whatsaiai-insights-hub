
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Thermometer, TrendingUp, AlertCircle, Bot, Clock, Activity, Brain } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { PageLayout } from '@/components/layout/PageLayout';
import { EmotionalChart } from '@/components/dashboard/EmotionalChart';

export function EmotionalThermometer() {
  const { data } = useAnalysisData();

  console.log('🌡️ EmotionalThermometer - Dados REAIS dos assistentes:', {
    hasRealData: data.hasRealData,
    totalInsights: data.insightsWithAssistant?.length || 0,
    emotionalInsights: data.insightsWithAssistant?.filter(i => 
      i.insight_type === 'emotional' || 
      i.assistantArea === 'psicologia' ||
      i.description.toLowerCase().includes('emocional')
    ).length || 0,
    assistantsActive: data.metrics.assistantsActive,
    lastAnalysis: data.metrics.lastAnalysis
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

  if (!data.hasRealData) {
    return (
      <PageLayout
        title="Termômetro Emocional"
        description="Monitore seu estado emocional baseado na análise dos assistentes especializados"
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
              Para monitorar suas emoções, os assistentes precisam analisar suas conversas e comportamentos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Thermometer className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado emocional disponível</h3>
                <p className="text-sm text-gray-600 mb-4">Para começar a análise emocional:</p>
                <div className="text-left max-w-md mx-auto space-y-2">
                  <p className="text-sm text-gray-600">• Execute a análise por IA no dashboard</p>
                  <p className="text-sm text-gray-600">• Os assistentes irão mapear suas emoções</p>
                  <p className="text-sm text-gray-600">• Dados serão atualizados automaticamente</p>
                </div>
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
    insight.assistantArea === 'psicologia' ||
    insight.assistantName === 'Oráculo das Sombras' ||
    insight.description.toLowerCase().includes('emocional') ||
    insight.description.toLowerCase().includes('sentimento') ||
    insight.description.toLowerCase().includes('humor') ||
    insight.description.toLowerCase().includes('estado')
  ) || [];

  // Calcular nível emocional baseado nos insights REAIS mais recentes
  let emotionalLevel = 50; // Base neutra
  
  if (emotionalInsights.length > 0) {
    const recentInsights = emotionalInsights.slice(0, 3); // 3 insights mais recentes
    let totalScore = 0;
    
    recentInsights.forEach(insight => {
      const description = insight.description.toLowerCase();
      let score = 50;
      
      // Análise de sentimento baseada no conteúdo REAL
      if (description.includes('positiv') || description.includes('feliz') || 
          description.includes('alegr') || description.includes('otimist') ||
          description.includes('satisfe') || description.includes('bem-estar')) {
        score = 80;
      } else if (description.includes('negativ') || description.includes('triste') || 
                 description.includes('ansied') || description.includes('estress') ||
                 description.includes('preocup') || description.includes('irritad')) {
        score = 20;
      } else if (description.includes('equilibr') || description.includes('estável') ||
                 description.includes('calm') || description.includes('neutro')) {
        score = 60;
      }
      
      totalScore += score;
    });
    
    emotionalLevel = Math.round(totalScore / recentInsights.length);
  }

  // Determinar cor e status baseado no nível
  const getEmotionalStatus = (level: number) => {
    if (level >= 70) return { color: 'bg-green-500', status: 'Muito Positivo', textColor: 'text-green-600' };
    if (level >= 55) return { color: 'bg-blue-500', status: 'Positivo', textColor: 'text-blue-600' };
    if (level >= 45) return { color: 'bg-yellow-500', status: 'Neutro', textColor: 'text-yellow-600' };
    if (level >= 30) return { color: 'bg-orange-500', status: 'Baixo', textColor: 'text-orange-600' };
    return { color: 'bg-red-500', status: 'Muito Baixo', textColor: 'text-red-600' };
  };

  const emotionalStatus = getEmotionalStatus(emotionalLevel);

  return (
    <PageLayout
      title="Termômetro Emocional"
      description="Monitore seu estado emocional baseado na análise REAL dos assistentes especializados"
      showBackButton={true}
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Termômetro Principal */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-blue-500" />
              Estado Atual
            </CardTitle>
            <CardDescription>
              Baseado em {emotionalInsights.length} análises REAIS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              {/* Termômetro Visual */}
              <div className="relative w-24 h-48 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`absolute bottom-0 w-full transition-all duration-1000 ${emotionalStatus.color}`}
                  style={{ height: `${emotionalLevel}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white font-bold text-lg drop-shadow-lg">
                    {emotionalLevel}
                  </div>
                </div>
                {/* Marcações do termômetro */}
                <div className="absolute right-0 top-0 h-full flex flex-col justify-between py-2 pr-1">
                  {[100, 75, 50, 25, 0].map(mark => (
                    <div key={mark} className="text-xs text-gray-500 text-right">
                      {mark}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Status Emocional */}
              <div className="text-center">
                <div className={`text-2xl font-bold mb-2 ${emotionalStatus.textColor}`}>
                  {emotionalStatus.status}
                </div>
                <p className="text-gray-600 mb-2">
                  Nível: {emotionalLevel}/100
                </p>
                {data.metrics.lastAnalysis && (
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    Última análise: {new Date(data.metrics.lastAnalysis).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>

              {/* Métricas Rápidas */}
              <div className="w-full grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Activity className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                  <div className="text-sm font-medium">{emotionalInsights.length}</div>
                  <div className="text-xs text-gray-500">Análises</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Brain className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                  <div className="text-sm font-medium">{data.metrics.assistantsActive}</div>
                  <div className="text-xs text-gray-500">Assistentes</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Evolução */}
        <div className="lg:col-span-2">
          <EmotionalChart />
        </div>

        {/* Análises Detalhadas */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Análises Emocionais REAIS dos Assistentes
            </CardTitle>
            <CardDescription>
              Insights emocionais gerados pelos assistentes especializados em psicologia e comportamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emotionalInsights.length > 0 ? (
                emotionalInsights.slice(0, 8).map((insight, index) => {
                  const createdAt = new Date(insight.createdAt);
                  const formattedDate = createdAt.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div key={insight.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-sm">{insight.title}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {insight.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-purple-100 text-purple-800 text-xs flex items-center gap-1">
                            <Bot className="h-3 w-3" />
                            {insight.assistantName}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formattedDate}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              insight.assistantArea === 'psicologia' ? 'border-purple-300 text-purple-700 bg-purple-50' :
                              insight.assistantArea === 'emocional' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                              'border-gray-300 text-gray-700'
                            }`}
                          >
                            {insight.assistantArea}
                          </Badge>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ml-4 ${
                          insight.priority === 'high' ? 'border-red-300 text-red-700 bg-red-50' :
                          insight.priority === 'medium' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                          'border-green-300 text-green-700 bg-green-50'
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
                    Nenhuma análise emocional específica encontrada
                  </h3>
                  <p className="text-xs text-gray-600">
                    Os assistentes ainda não geraram insights emocionais detalhados
                  </p>
                </div>
              )}
            </div>

            {/* Resumo Final dos Assistentes */}
            {emotionalInsights.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Resumo da Análise Emocional REAL
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-blue-600">
                  <div>
                    <p><strong>🤖 Assistentes especializados:</strong> {data.metrics.assistantsActive}</p>
                    <p><strong>🧠 Insights emocionais gerados:</strong> {emotionalInsights.length}</p>
                  </div>
                  <div>
                    <p><strong>📊 Nível emocional atual:</strong> {emotionalLevel}/100 ({emotionalStatus.status})</p>
                    <p><strong>🎯 Área especializada:</strong> Psicologia & Comportamento</p>
                  </div>
                  <div>
                    {data.metrics.lastAnalysis && (
                      <>
                        <p><strong>⏰ Última atualização:</strong></p>
                        <p>{new Date(data.metrics.lastAnalysis).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-3 p-2 bg-white/50 rounded text-xs text-blue-700">
                  <strong>ℹ️ Nota:</strong> Todos os dados são baseados em análises REAIS dos assistentes especializados. 
                  Nenhuma informação simulada é exibida.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
