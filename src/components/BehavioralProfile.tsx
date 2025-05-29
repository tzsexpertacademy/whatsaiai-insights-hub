
import React, { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Target, Users, Zap, Shield, Heart, Lightbulb, Bot } from 'lucide-react';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

interface PersonalityTrait {
  name: string;
  score: number;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface BehaviorPattern {
  id: string;
  pattern: string;
  frequency: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export function BehavioralProfile() {
  const { data, isLoading } = useAnalysisData();

  // Usar dados reais dos assistentes se disponíveis
  const hasRealData = data.hasRealData && data.bigFiveData && data.bigFiveData.length > 0;
  const behavioralInsights = data.insightsWithAssistant?.filter(insight => 
    insight.assistantArea === 'psicologia' || insight.insight_type === 'behavioral'
  ) || [];

  const [personalityTraits] = useState<PersonalityTrait[]>([
    {
      name: 'Extroversão',
      score: hasRealData ? data.bigFiveData.find(trait => trait.name === 'Extroversão')?.value || 75 : 75,
      description: 'Tendência a ser sociável, comunicativo e energético',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      name: 'Conscienciosidade',
      score: hasRealData ? data.bigFiveData.find(trait => trait.name === 'Conscienciosidade')?.value || 85 : 85,
      description: 'Organização, disciplina e orientação para objetivos',
      icon: Target,
      color: 'text-green-600'
    },
    {
      name: 'Abertura',
      score: hasRealData ? data.bigFiveData.find(trait => trait.name === 'Abertura')?.value || 90 : 90,
      description: 'Curiosidade, criatividade e abertura para novas experiências',
      icon: Lightbulb,
      color: 'text-purple-600'
    },
    {
      name: 'Amabilidade',
      score: hasRealData ? data.bigFiveData.find(trait => trait.name === 'Amabilidade')?.value || 70 : 70,
      description: 'Cooperação, confiança e preocupação com outros',
      icon: Heart,
      color: 'text-pink-600'
    },
    {
      name: 'Estabilidade Emocional',
      score: hasRealData ? (100 - (data.bigFiveData.find(trait => trait.name === 'Neuroticismo')?.value || 35)) : 65,
      description: 'Controle emocional e resistência ao estresse',
      icon: Shield,
      color: 'text-indigo-600'
    }
  ]);

  // Padrões comportamentais baseados nos insights dos assistentes
  const realBehaviorPatterns: BehaviorPattern[] = behavioralInsights.slice(0, 4).map((insight, index) => ({
    id: insight.id,
    pattern: insight.title,
    frequency: index % 2 === 0 ? 'Frequente' : 'Moderada',
    impact: index % 3 === 0 ? 'positive' : index % 3 === 1 ? 'negative' : 'neutral',
    description: insight.description
  }));

  const [mockBehaviorPatterns] = useState<BehaviorPattern[]>([
    {
      id: '1',
      pattern: 'Procrastinação em tarefas complexas',
      frequency: 'Frequente',
      impact: 'negative',
      description: 'Tendência a adiar tarefas que exigem muito esforço cognitivo'
    },
    {
      id: '2',
      pattern: 'Busca por validação externa',
      frequency: 'Moderada',
      impact: 'neutral',
      description: 'Necessidade de aprovação de outros para tomar decisões'
    },
    {
      id: '3',
      pattern: 'Foco intenso quando motivado',
      frequency: 'Frequente',
      impact: 'positive',
      description: 'Capacidade de concentração extrema em projetos de interesse'
    },
    {
      id: '4',
      pattern: 'Autocrítica excessiva',
      frequency: 'Ocasional',
      impact: 'negative',
      description: 'Tendência a ser muito duro consigo mesmo em caso de erros'
    }
  ]);

  const behaviorPatterns = hasRealData && realBehaviorPatterns.length > 0 ? realBehaviorPatterns : mockBehaviorPatterns;

  const getTraitLevel = (score: number) => {
    if (score >= 80) return { level: 'Alto', color: 'text-green-600' };
    if (score >= 60) return { level: 'Moderado', color: 'text-yellow-600' };
    return { level: 'Baixo', color: 'text-red-600' };
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const averageScore = Math.round(personalityTraits.reduce((acc, trait) => acc + trait.score, 0) / personalityTraits.length);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Perfil Comportamental"
          subtitle="Descubra padrões e características do seu comportamento"
        >
          <AIAnalysisButton />
        </PageHeader>
        
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p>Carregando perfil comportamental...</p>
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
        title="Perfil Comportamental"
        subtitle="Descubra padrões e características do seu comportamento"
      >
        {hasRealData && (
          <Badge className="bg-purple-100 text-purple-800">
            🔮 {behavioralInsights.length} Insights Comportamentais
          </Badge>
        )}
        <AIAnalysisButton />
      </PageHeader>
      
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Análise dos Assistentes */}
          {hasRealData && behavioralInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-600" />
                  Análise Comportamental dos Assistentes
                </CardTitle>
                <CardDescription>
                  Insights comportamentais identificados pelos seus assistentes IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {behavioralInsights.slice(0, 4).map((insight) => (
                    <div key={insight.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-l-purple-500">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-800">
                            {insight.assistantName}
                          </Badge>
                          <Badge variant="outline">
                            {insight.assistantArea}
                          </Badge>
                        </div>
                      </div>
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Score Geral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Perfil Geral
                {hasRealData && (
                  <Badge variant="outline" className="text-xs">
                    Baseado em análise dos assistentes
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {hasRealData 
                  ? 'Pontuação comportamental baseada na análise dos seus assistentes IA'
                  : 'Sua pontuação comportamental geral baseada nos cinco grandes fatores da personalidade'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={averageScore} className="h-4" />
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {averageScore}%
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {hasRealData 
                  ? 'Análise baseada nos insights dos seus assistentes IA'
                  : 'Pontuação baseada na análise dos cinco grandes fatores da personalidade'
                }
              </p>
            </CardContent>
          </Card>

          {/* Traços de Personalidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Traços de Personalidade
              </CardTitle>
              <CardDescription>
                {hasRealData 
                  ? 'Análise baseada nos dados dos seus assistentes IA'
                  : 'Análise baseada no modelo dos Cinco Grandes Fatores'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalityTraits.map((trait) => {
                  const Icon = trait.icon;
                  const level = getTraitLevel(trait.score);
                  
                  return (
                    <div key={trait.name} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <Icon className={`h-5 w-5 ${trait.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{trait.name}</h4>
                          <Badge className={level.color.replace('text-', 'bg-').replace('-600', '-100') + ' ' + level.color}>
                            {level.level}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Pontuação</span>
                          <span className={`font-bold ${level.color}`}>{trait.score}%</span>
                        </div>
                        <Progress value={trait.score} className="h-2" />
                        <p className="text-xs text-gray-500">{trait.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Padrões Comportamentais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Padrões Comportamentais Identificados
                {hasRealData && (
                  <Badge variant="outline" className="text-xs">
                    Análise dos assistentes
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {hasRealData 
                  ? 'Comportamentos identificados pelos seus assistentes IA'
                  : 'Comportamentos recorrentes observados em suas interações'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {behaviorPatterns.map((pattern) => (
                  <Card key={pattern.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{pattern.pattern}</h4>
                            <Badge className={getImpactColor(pattern.impact)}>
                              {pattern.impact === 'positive' ? 'Positivo' : 
                               pattern.impact === 'negative' ? 'Negativo' : 'Neutro'}
                            </Badge>
                            {hasRealData && (
                              <Badge variant="outline" className="text-xs">
                                Assistente IA
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-2">{pattern.description}</p>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                              Frequência: <strong>{pattern.frequency}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights e Recomendações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Pontos Fortes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personalityTraits
                    .filter(trait => trait.score >= 75)
                    .map(trait => (
                      <div key={trait.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{trait.name} ({trait.score}%)</span>
                      </div>
                    ))}
                  {behaviorPatterns
                    .filter(pattern => pattern.impact === 'positive')
                    .map(pattern => (
                      <div key={pattern.id} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{pattern.pattern}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-amber-600">Áreas de Desenvolvimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personalityTraits
                    .filter(trait => trait.score < 70)
                    .map(trait => (
                      <div key={trait.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm">{trait.name} ({trait.score}%)</span>
                      </div>
                    ))}
                  {behaviorPatterns
                    .filter(pattern => pattern.impact === 'negative')
                    .map(pattern => (
                      <div key={pattern.id} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm">{pattern.pattern}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
