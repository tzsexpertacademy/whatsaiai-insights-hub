
import React, { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Thermometer, TrendingUp, TrendingDown, Calendar, Brain, Heart, Zap, AlertTriangle, Smile, Meh, Frown } from 'lucide-react';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

interface EmotionalEntry {
  id: string;
  date: string;
  time: string;
  emotion: string;
  intensity: number;
  trigger: string;
  notes: string;
  physicalSensations: string[];
  coping: string;
}

interface EmotionalPattern {
  emotion: string;
  frequency: number;
  avgIntensity: number;
  commonTriggers: string[];
  trend: 'up' | 'down' | 'stable';
}

export function EmotionalThermometer() {
  const { data, isLoading } = useAnalysisData();
  const [currentEmotion, setCurrentEmotion] = useState('');
  const [currentIntensity, setCurrentIntensity] = useState(5);
  const [currentTrigger, setCurrentTrigger] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Dados mockados como fallback
  const [mockEntries] = useState<EmotionalEntry[]>([
    {
      id: '1',
      date: '2024-01-15',
      time: '09:30',
      emotion: 'Ansiedade',
      intensity: 7,
      trigger: 'Reunião importante',
      notes: 'Sensação de nervosismo antes da apresentação',
      physicalSensations: ['Coração acelerado', 'Suor nas mãos'],
      coping: 'Respiração profunda'
    },
    {
      id: '2',
      date: '2024-01-15',
      time: '14:20',
      emotion: 'Alegria',
      intensity: 8,
      trigger: 'Feedback positivo',
      notes: 'Muito satisfeito com o resultado da apresentação',
      physicalSensations: ['Energia alta', 'Sorriso espontâneo'],
      coping: 'Compartilhei com a equipe'
    },
    {
      id: '3',
      date: '2024-01-14',
      time: '18:45',
      emotion: 'Frustração',
      intensity: 6,
      trigger: 'Projeto atrasado',
      notes: 'Dificuldades técnicas inesperadas',
      physicalSensations: ['Tensão nos ombros', 'Irritabilidade'],
      coping: 'Caminhada de 10 minutos'
    }
  ]);

  const [mockPatterns] = useState<EmotionalPattern[]>([
    {
      emotion: 'Ansiedade',
      frequency: 45,
      avgIntensity: 6.8,
      commonTriggers: ['Reuniões', 'Prazos', 'Apresentações'],
      trend: 'down'
    },
    {
      emotion: 'Alegria',
      frequency: 30,
      avgIntensity: 7.5,
      commonTriggers: ['Conquistas', 'Feedback positivo', 'Tempo com família'],
      trend: 'up'
    },
    {
      emotion: 'Frustração',
      frequency: 25,
      avgIntensity: 6.2,
      commonTriggers: ['Problemas técnicos', 'Comunicação falha', 'Sobrecarga'],
      trend: 'stable'
    }
  ]);

  const emotions = [
    { name: 'Alegria', icon: Smile, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Tristeza', icon: Frown, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Ansiedade', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { name: 'Raiva', icon: Zap, color: 'text-red-600', bg: 'bg-red-50' },
    { name: 'Calma', icon: Heart, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Neutro', icon: Meh, color: 'text-gray-600', bg: 'bg-gray-50' }
  ];

  // Usar dados reais dos assistentes se disponíveis
  const hasRealData = data.hasRealData && data.emotionalData && data.emotionalData.length > 0;
  const emotionalInsights = data.insightsWithAssistant?.filter(insight => 
    insight.assistantArea === 'psicologia' || insight.insight_type === 'emotional'
  ) || [];

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 8) return 'text-red-600';
    if (intensity >= 6) return 'text-yellow-600';
    if (intensity >= 4) return 'text-blue-600';
    return 'text-green-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const currentDate = new Date().toLocaleDateString('pt-BR');
  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Termômetro Emocional"
          subtitle="Monitore e analise seu estado emocional ao longo do tempo"
        >
          <AIAnalysisButton />
        </PageHeader>
        
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Carregando análise emocional...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Termômetro Emocional"
        subtitle="Monitore e analise seu estado emocional ao longo do tempo"
      >
        {hasRealData && (
          <Badge className="bg-purple-100 text-purple-800">
            🔮 {emotionalInsights.length} Insights Emocionais
          </Badge>
        )}
        <AIAnalysisButton />
      </PageHeader>
      
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Estado Emocional Atual dos Assistentes */}
          {hasRealData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Análise Emocional dos Assistentes
                </CardTitle>
                <CardDescription>
                  Estado emocional identificado pelos seus assistentes IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Estado Atual</h4>
                    <p className="text-2xl font-bold text-purple-600">{data.emotionalState}</p>
                    <p className="text-sm text-purple-700 mt-1">Consciência Relacional: {data.relationalAwareness}%</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Foco Principal</h4>
                    <p className="text-lg font-medium text-blue-600">{data.mainFocus}</p>
                    <p className="text-sm text-blue-700 mt-1">Baseado em {emotionalInsights.length} insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights Emocionais dos Assistentes */}
          {emotionalInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Insights Emocionais dos Assistentes
                </CardTitle>
                <CardDescription>
                  Análises comportamentais e emocionais dos seus assistentes IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emotionalInsights.slice(0, 3).map((insight) => (
                    <div key={insight.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-l-purple-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-100 text-purple-800">
                              {insight.assistantName}
                            </Badge>
                            <Badge variant="outline">
                              {insight.assistantArea}
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
          
          {/* Registro Rápido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-blue-600" />
                Como você está se sentindo agora?
              </CardTitle>
              <CardDescription>
                {currentDate} - {currentTime}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showAddForm ? (
                <div className="text-center space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {emotions.map((emotion) => {
                      const Icon = emotion.icon;
                      return (
                        <Button
                          key={emotion.name}
                          variant="outline"
                          className={`h-16 flex-col gap-2 ${currentEmotion === emotion.name ? emotion.bg + ' border-2' : ''}`}
                          onClick={() => setCurrentEmotion(emotion.name)}
                        >
                          <Icon className={`h-6 w-6 ${emotion.color}`} />
                          <span className="text-sm">{emotion.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                  
                  {currentEmotion && (
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Registrar {currentEmotion}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Emoção Selecionada</label>
                      <Badge className="text-base px-3 py-1">{currentEmotion}</Badge>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Intensidade: <span className={`font-bold ${getIntensityColor(currentIntensity)}`}>{currentIntensity}/10</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={currentIntensity}
                        onChange={(e) => setCurrentIntensity(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">O que desencadeou esta emoção?</label>
                    <input
                      type="text"
                      value={currentTrigger}
                      onChange={(e) => setCurrentTrigger(e.target.value)}
                      placeholder="Ex: reunião difícil, boa notícia, etc."
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        setShowAddForm(false);
                        setCurrentEmotion('');
                        setCurrentTrigger('');
                        setCurrentIntensity(5);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Salvar Registro
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Padrões Emocionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Padrões Emocionais {hasRealData ? 'dos Assistentes' : 'Identificados'}
              </CardTitle>
              <CardDescription>
                {hasRealData 
                  ? 'Análise baseada nos insights dos seus assistentes IA'
                  : 'Análise dos últimos 30 dias'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockPatterns.map((pattern) => (
                  <div key={pattern.emotion} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{pattern.emotion}</h4>
                      {getTrendIcon(pattern.trend)}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Frequência</span>
                          <span>{pattern.frequency}%</span>
                        </div>
                        <Progress value={pattern.frequency} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Intensidade Média</span>
                          <span className={getIntensityColor(pattern.avgIntensity)}>
                            {pattern.avgIntensity}/10
                          </span>
                        </div>
                        <Progress value={pattern.avgIntensity * 10} className="h-2" />
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium">Gatilhos Comuns:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pattern.commonTriggers.map((trigger, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Histórico Recente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Registros Recentes
              </CardTitle>
              <CardDescription>
                {hasRealData 
                  ? 'Histórico emocional baseado nos insights dos assistentes'
                  : 'Seus últimos registros emocionais'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEntries.map((entry) => (
                  <Card key={entry.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-blue-100 text-blue-800">
                              {entry.emotion}
                            </Badge>
                            <span className={`font-bold ${getIntensityColor(entry.intensity)}`}>
                              {entry.intensity}/10
                            </span>
                            <span className="text-sm text-gray-500">
                              {entry.date} às {entry.time}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 mb-2">{entry.notes}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Gatilho:</span>
                              <p className="text-gray-600">{entry.trigger}</p>
                            </div>
                            
                            <div>
                              <span className="font-medium">Sensações:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {entry.physicalSensations.map((sensation, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {sensation}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <span className="font-medium">Estratégia:</span>
                              <p className="text-gray-600">{entry.coping}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
