
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Thermometer, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { PageLayout } from '@/components/layout/PageLayout';

export function EmotionalThermometer() {
  const { data } = useAnalysisData();
  const [currentEmotion, setCurrentEmotion] = useState(5);

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Badge className="bg-red-100 text-red-800 text-xs sm:text-sm">
        🌡️ Estado Emocional
      </Badge>
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
              Estado Atual
            </CardTitle>
            <CardDescription>
              Nível emocional baseado na análise dos assistentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              <div className="relative w-32 h-64 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`absolute bottom-0 w-full transition-all duration-500 ${emotionColors[currentEmotion]}`}
                  style={{ height: `${(currentEmotion / 5) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white font-bold text-xl">
                    {currentEmotion}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  {emotionLabels[currentEmotion]}
                </div>
                <p className="text-gray-600">
                  Baseado em {data.insightsWithAssistant?.length || 0} análises
                </p>
              </div>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    variant={currentEmotion === level ? "default" : "outline"}
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

        {/* Histórico e Tendências */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Tendências
            </CardTitle>
            <CardDescription>
              Padrões emocionais identificados pelos assistentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.emotionalMetrics?.trends?.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {trend.direction === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : trend.direction === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <Minus className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="font-medium">{trend.label}</span>
                  </div>
                  <Badge variant="outline">
                    {trend.period}
                  </Badge>
                </div>
              )) || (
                <div className="text-center py-4 text-gray-500">
                  Aguardando mais dados para identificar tendências
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
