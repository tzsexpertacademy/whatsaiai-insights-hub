
import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Target, Users, Zap, Shield, Heart, Lightbulb, Bot } from 'lucide-react';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function BehavioralProfile() {
  const { data, isLoading } = useAnalysisData();

  // Usar APENAS dados reais dos assistentes
  const hasRealData = data.hasRealData && data.bigFiveData && data.bigFiveData.length > 0;
  const behavioralInsights = data.insightsWithAssistant?.filter(insight => 
    insight.assistantArea === 'psicologia' || insight.insight_type === 'behavioral'
  ) || [];

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
                  <p>Carregando perfil comportamental dos assistentes...</p>
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
          title="Perfil Comportamental"
          subtitle="Descubra padrões e características do seu comportamento"
        >
          <AIAnalysisButton />
        </PageHeader>
        
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Perfil Comportamental Aguarda Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aguardando Análise Comportamental dos Assistentes</h3>
                  <p className="text-gray-600 mb-6">
                    O perfil comportamental será gerado após análises dos assistentes IA
                  </p>
                  <div className="text-left max-w-md mx-auto space-y-2 mb-6">
                    <p className="text-sm text-gray-600">• Execute análises IA das suas conversas</p>
                    <p className="text-sm text-gray-600">• Os assistentes identificarão padrões comportamentais</p>
                    <p className="text-sm text-gray-600">• Relatórios psicológicos serão gerados</p>
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

  // Calcular score médio baseado nos dados reais
  const averageScore = Math.round(data.bigFiveData.reduce((acc, trait) => acc + trait.value, 0) / data.bigFiveData.length);

  // Padrões comportamentais baseados APENAS nos insights dos assistentes
  const behaviorPatterns = behavioralInsights.map((insight) => ({
    id: insight.id,
    pattern: insight.title,
    frequency: insight.priority === 'high' ? 'Frequente' : insight.priority === 'medium' ? 'Moderada' : 'Ocasional',
    impact: insight.priority === 'high' ? 'negative' : insight.priority === 'low' ? 'positive' : 'neutral',
    description: insight.description,
    assistantName: insight.assistantName
  }));

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

  const getTraitIcon = (traitName: string) => {
    const iconMap: { [key: string]: React.ElementType } = {
      'Extroversão': Users,
      'Conscienciosidade': Target,
      'Abertura': Lightbulb,
      'Amabilidade': Heart,
      'Neuroticismo': Shield
    };
    return iconMap[traitName] || Brain;
  };

  const getTraitColor = (traitName: string) => {
    const colorMap: { [key: string]: string } = {
      'Extroversão': 'text-blue-600',
      'Conscienciosidade': 'text-green-600',
      'Abertura': 'text-purple-600',
      'Amabilidade': 'text-pink-600',
      'Neuroticismo': 'text-indigo-600'
    };
    return colorMap[traitName] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Perfil Comportamental"
        subtitle="Descubra padrões e características do seu comportamento"
      >
        <Badge className="bg-purple-100 text-purple-800">
          🔮 Análise dos Assistentes - {behavioralInsights.length} insights comportamentais
        </Badge>
        <AIAnalysisButton />
      </PageHeader>
      
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Análise dos Assistentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                Análise Comportamental dos Assistentes
                <Badge variant="outline" className="text-xs">
                  Baseado em {behavioralInsights.length} insights
                </Badge>
              </CardTitle>
              <CardDescription>
                Insights comportamentais identificados pelos seus assistentes IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {behavioralInsights.map((insight) => (
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
          
          {/* Score Geral baseado nos dados reais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Perfil Geral dos Assistentes
                <Badge variant="outline" className="text-xs">
                  Score baseado em {data.bigFiveData.length} traços analisados
                </Badge>
              </CardTitle>
              <CardDescription>
                Pontuação comportamental baseada na análise dos seus assistentes IA
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
                Análise baseada nos insights dos seus assistentes IA
              </p>
            </CardContent>
          </Card>

          {/* Traços de Personalidade - APENAS dados reais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Traços de Personalidade (Big Five)
              </CardTitle>
              <CardDescription>
                Análise baseada nos dados dos seus assistentes IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.bigFiveData.map((trait) => {
                  const Icon = getTraitIcon(trait.name);
                  const level = getTraitLevel(trait.value);
                  const color = getTraitColor(trait.name);
                  
                  return (
                    <div key={trait.name} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <Icon className={`h-5 w-5 ${color}`} />
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
                          <span className={`font-bold ${level.color}`}>{trait.value}%</span>
                        </div>
                        <Progress value={trait.value} className="h-2" />
                        <p className="text-xs text-gray-500">{trait.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Padrões Comportamentais - APENAS dos assistentes */}
          {behaviorPatterns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Padrões Comportamentais Identificados
                  <Badge variant="outline" className="text-xs">
                    {behaviorPatterns.length} padrões dos assistentes
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Comportamentos identificados pelos seus assistentes IA
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
                              <Badge className="bg-blue-100 text-blue-800">
                                {pattern.assistantName}
                              </Badge>
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
          )}

          {/* Insights e Recomendações baseados APENAS em dados reais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Pontos Fortes (Assistentes)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.bigFiveData
                    .filter(trait => trait.value >= 75)
                    .map(trait => (
                      <div key={trait.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{trait.name} ({trait.value}%)</span>
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
                  {data.bigFiveData.filter(trait => trait.value >= 75).length === 0 && 
                   behaviorPatterns.filter(pattern => pattern.impact === 'positive').length === 0 && (
                    <p className="text-sm text-gray-500">Aguardando mais análises dos assistentes</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-amber-600">Áreas de Desenvolvimento (Assistentes)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.bigFiveData
                    .filter(trait => trait.value < 70)
                    .map(trait => (
                      <div key={trait.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm">{trait.name} ({trait.value}%)</span>
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
                  {data.bigFiveData.filter(trait => trait.value < 70).length === 0 && 
                   behaviorPatterns.filter(pattern => pattern.impact === 'negative').length === 0 && (
                    <p className="text-sm text-gray-500">Nenhuma área crítica identificada pelos assistentes</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
