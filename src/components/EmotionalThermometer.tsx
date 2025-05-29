
import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, TrendingUp, Heart, Brain, Calendar, Bot } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function EmotionalThermometer() {
  const { data, isLoading } = useAnalysisData();

  // Usar APENAS dados reais dos assistentes
  const hasRealData = data.hasRealData && data.emotionalData && data.emotionalData.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Termômetro Emocional"
          subtitle="Monitore seus padrões e estados emocionais"
        >
          <AIAnalysisButton />
        </PageHeader>
        
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p>Carregando análise emocional dos assistentes...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!hasRealData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Termômetro Emocional"
          subtitle="Monitore seus padrões e estados emocionais"
        >
          <AIAnalysisButton />
        </PageHeader>
        
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-orange-600" />
                  Termômetro Emocional Aguarda Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aguardando Análise Emocional dos Assistentes</h3>
                  <p className="text-gray-600 mb-6">
                    Os padrões emocionais serão identificados após análises dos assistentes IA
                  </p>
                  <div className="text-left max-w-md mx-auto space-y-2 mb-6">
                    <p className="text-sm text-gray-600">• Execute análises IA das suas conversas</p>
                    <p className="text-sm text-gray-600">• Os assistentes identificarão padrões emocionais</p>
                    <p className="text-sm text-gray-600">• Relatórios de bem-estar serão gerados</p>
                  </div>
                  <AIAnalysisButton />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Calcular métricas emocionais baseadas nos dados reais
  const currentEmotionalState = data.emotionalState || "Equilibrado";
  const emotionalTrend = data.emotionalData.length >= 2 ? 
    (data.emotionalData[data.emotionalData.length - 1].value > data.emotionalData[0].value ? "crescente" : "estável") : "estável";

  const averageEmotionalScore = Math.round(
    data.emotionalData.reduce((acc, item) => acc + item.value, 0) / data.emotionalData.length
  );

  // Insights emocionais dos assistentes
  const emotionalInsights = data.insightsWithAssistant?.filter(insight => 
    insight.assistantArea === 'psicologia' || 
    insight.description.toLowerCase().includes('emocional') ||
    insight.description.toLowerCase().includes('sentimento') ||
    insight.description.toLowerCase().includes('humor')
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Termômetro Emocional"
        subtitle="Monitore seus padrões e estados emocionais"
      >
        <Badge className="bg-orange-100 text-orange-800">
          🔮 Análise Emocional dos Assistentes
        </Badge>
        <AIAnalysisButton />
      </PageHeader>
      
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Estado Emocional Atual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Thermometer className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado Atual</p>
                    <p className="text-xl font-bold text-orange-600">{currentEmotionalState}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tendência</p>
                    <p className="text-xl font-bold text-blue-600 capitalize">{emotionalTrend}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Score Médio</p>
                    <p className="text-xl font-bold text-purple-600">{averageEmotionalScore}/100</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Evolução Emocional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Evolução Emocional Semanal
              </CardTitle>
              <CardDescription>
                Baseado na análise dos assistentes IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.emotionalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      strokeWidth={3}
                      dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Insights Emocionais dos Assistentes */}
          {emotionalInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Insights Emocionais dos Assistentes
                </CardTitle>
                <CardDescription>
                  Análises psicológicas baseadas nos seus assistentes IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emotionalInsights.slice(0, 3).map((insight) => (
                    <div key={insight.id} className="p-4 bg-purple-50 rounded-lg border-l-4 border-l-purple-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-100 text-purple-800">
                              {insight.assistantName}
                            </Badge>
                            <Badge variant="outline">
                              Análise Emocional
                            </Badge>
                          </div>
                          <h4 className="font-semibold mb-1">{insight.title}</h4>
                          <p className="text-sm text-gray-600">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Distribuição de Estados Emocionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Estados Emocionais da Semana
              </CardTitle>
              <CardDescription>
                Distribuição dos estados identificados pelos assistentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.emotionalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Resumo e Recomendações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Pontos Positivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Estado emocional: {currentEmotionalState}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Tendência: {emotionalTrend}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Score médio: {averageEmotionalScore}/100</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Recomendações dos Assistentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Manter rotina de auto-reflexão</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Continuar análises com assistentes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Monitorar padrões semanalmente</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
