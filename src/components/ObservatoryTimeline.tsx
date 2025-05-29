
import React, { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, TrendingDown, Target, Award, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';

interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: 'achievement' | 'milestone' | 'insight' | 'goal' | 'challenge';
  category: 'saude' | 'carreira' | 'relacionamentos' | 'crescimento-pessoal' | 'financas';
  impact: 'positive' | 'negative' | 'neutral';
  metadata?: any;
}

export function ObservatoryTimeline() {
  const [timelineEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      title: 'Meta de Exercícios Atingida',
      description: 'Completou 5 dias consecutivos de exercícios físicos',
      type: 'achievement',
      category: 'saude',
      impact: 'positive'
    },
    {
      id: '2',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      title: 'Insight Comportamental',
      description: 'Identificado padrão de procrastinação em tarefas complexas',
      type: 'insight',
      category: 'crescimento-pessoal',
      impact: 'neutral'
    },
    {
      id: '3',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      title: 'Melhoria na Comunicação',
      description: 'Feedback positivo da equipe sobre habilidades de liderança',
      type: 'milestone',
      category: 'carreira',
      impact: 'positive'
    },
    {
      id: '4',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      title: 'Desafio Identificado',
      description: 'Dificuldades em manter o equilíbrio trabalho-vida pessoal',
      type: 'challenge',
      category: 'relacionamentos',
      impact: 'negative'
    },
    {
      id: '5',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      title: 'Nova Meta Estabelecida',
      description: 'Definiu objetivo de aprender nova habilidade técnica',
      type: 'goal',
      category: 'carreira',
      impact: 'positive'
    },
    {
      id: '6',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      title: 'Conquista Financeira',
      description: 'Atingiu meta de economia mensal estabelecida',
      type: 'achievement',
      category: 'financas',
      impact: 'positive'
    }
  ]);

  const getEventIcon = (type: string, impact: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="h-5 w-5 text-yellow-600" />;
      case 'milestone':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'insight':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'goal':
        return <Target className="h-5 w-5 text-purple-600" />;
      case 'challenge':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'saude': return 'bg-green-100 text-green-800';
      case 'carreira': return 'bg-blue-100 text-blue-800';
      case 'relacionamentos': return 'bg-pink-100 text-pink-800';
      case 'crescimento-pessoal': return 'bg-purple-100 text-purple-800';
      case 'financas': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'border-l-green-500 bg-green-50';
      case 'negative': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const positiveEvents = timelineEvents.filter(e => e.impact === 'positive').length;
  const totalEvents = timelineEvents.length;
  const progressPercentage = Math.round((positiveEvents / totalEvents) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Linha do Tempo"
        subtitle="Acompanhe sua evolução e marcos importantes ao longo do tempo"
      >
        <AIAnalysisButton 
          analysisType="timeline"
          buttonText="Analisar Evolução"
          data={{ timelineEvents }}
          className="bg-indigo-600 hover:bg-indigo-700"
        />
      </PageHeader>
      
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total de Eventos</p>
                    <p className="text-2xl font-bold">{totalEvents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Eventos Positivos</p>
                    <p className="text-2xl font-bold">{positiveEvents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Conquistas</p>
                    <p className="text-2xl font-bold">
                      {timelineEvents.filter(e => e.type === 'achievement').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Progresso Geral</p>
                    <p className="text-2xl font-bold">{progressPercentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Linha do Tempo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                Sua Jornada de Evolução
              </CardTitle>
              <CardDescription>
                Eventos importantes em ordem cronológica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Linha vertical */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6">
                  {timelineEvents.map((event, index) => (
                    <div key={event.id} className="relative flex items-start gap-4">
                      {/* Ícone do evento */}
                      <div className={`relative z-10 w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${getImpactColor(event.impact)}`}>
                        {getEventIcon(event.type, event.impact)}
                      </div>
                      
                      {/* Conteúdo do evento */}
                      <Card className={`flex-1 border-l-4 ${getImpactColor(event.impact)}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{event.title}</h4>
                                <Badge className={getCategoryColor(event.category)}>
                                  {event.category}
                                </Badge>
                                <Badge variant="outline">
                                  {event.type}
                                </Badge>
                              </div>
                              
                              <p className="text-gray-600 mb-2">{event.description}</p>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                {event.date.toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {event.impact === 'positive' && <TrendingUp className="h-4 w-4 text-green-600" />}
                              {event.impact === 'negative' && <TrendingDown className="h-4 w-4 text-red-600" />}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Área da Vida</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['saude', 'carreira', 'relacionamentos', 'crescimento-pessoal', 'financas'].map(category => {
                  const categoryEvents = timelineEvents.filter(e => e.category === category);
                  const positiveCount = categoryEvents.filter(e => e.impact === 'positive').length;
                  
                  return (
                    <div key={category} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{category.replace('-', ' ')}</h4>
                        <Badge className={getCategoryColor(category)}>
                          {categoryEvents.length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        {positiveCount} positivos
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
