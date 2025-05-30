
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Brain, Target, TrendingUp, Zap, Bot, Clock, AlertCircle } from 'lucide-react';

export function SkillsCards() {
  const { data, isLoading } = useAnalysisData();

  console.log('🎯 SkillsCards - Dados REAIS:', {
    hasRealData: data.hasRealData,
    insightsWithAssistant: data.insightsWithAssistant?.length || 0,
    assistantsActive: data.metrics.assistantsActive
  });

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.hasRealData || !data.insightsWithAssistant || data.insightsWithAssistant.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Mapeamento de Habilidades
          </CardTitle>
          <CardDescription>
            Aguardando análise de habilidades pelos assistentes especializados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Habilidades não mapeadas</h3>
            <p className="text-gray-600 mb-4">
              Os assistentes ainda não analisaram suas competências
            </p>
            <div className="text-left max-w-md mx-auto space-y-2">
              <p className="text-sm text-gray-600">• Execute análise por IA no dashboard</p>
              <p className="text-sm text-gray-600">• Converse sobre suas atividades e projetos</p>
              <p className="text-sm text-gray-600">• Aguarde mapeamento das habilidades</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extrair insights relacionados a habilidades REAIS dos assistentes
  const skillInsights = data.insightsWithAssistant.filter(insight => 
    insight.description.toLowerCase().includes('habilidade') ||
    insight.description.toLowerCase().includes('competência') ||
    insight.description.toLowerCase().includes('talento') ||
    insight.description.toLowerCase().includes('forte') ||
    insight.description.toLowerCase().includes('desenvolv') ||
    insight.description.toLowerCase().includes('capacidade') ||
    insight.assistantArea === 'desenvolvimento' ||
    insight.assistantArea === 'estrategia' ||
    insight.assistantArea === 'criatividade'
  );

  // Mapear habilidades baseadas nos insights REAIS
  const skillsMapping = [
    {
      name: 'Comunicação',
      area: 'relacionamentos',
      insights: skillInsights.filter(i => 
        i.assistantArea === 'relacionamentos' || 
        i.description.toLowerCase().includes('comunicaç')
      )
    },
    {
      name: 'Liderança Estratégica',
      area: 'estrategia',
      insights: skillInsights.filter(i => 
        i.assistantArea === 'estrategia' || 
        i.description.toLowerCase().includes('lideranç')
      )
    },
    {
      name: 'Criatividade',
      area: 'criatividade',
      insights: skillInsights.filter(i => 
        i.assistantArea === 'criatividade' || 
        i.description.toLowerCase().includes('criativ')
      )
    },
    {
      name: 'Inteligência Emocional',
      area: 'psicologia',
      insights: skillInsights.filter(i => 
        i.assistantArea === 'psicologia' || 
        i.description.toLowerCase().includes('emocion')
      )
    },
    {
      name: 'Gestão Financeira',
      area: 'financeiro',
      insights: skillInsights.filter(i => 
        i.assistantArea === 'financeiro' || 
        i.description.toLowerCase().includes('financ')
      )
    },
    {
      name: 'Bem-estar Pessoal',
      area: 'saude',
      insights: skillInsights.filter(i => 
        i.assistantArea === 'saude' || 
        i.description.toLowerCase().includes('saúde')
      )
    }
  ];

  // Calcular score baseado na quantidade e qualidade dos insights
  const calculateSkillScore = (insights: any[]) => {
    if (insights.length === 0) return 0;
    
    const baseScore = Math.min(insights.length * 20, 80);
    const highPriorityBonus = insights.filter(i => i.priority === 'high').length * 10;
    
    return Math.min(baseScore + highPriorityBonus, 100);
  };

  const skillsWithScores = skillsMapping
    .map(skill => ({
      ...skill,
      score: calculateSkillScore(skill.insights),
      lastUpdate: skill.insights.length > 0 
        ? new Date(Math.max(...skill.insights.map(i => new Date(i.createdAt).getTime())))
        : null
    }))
    .filter(skill => skill.score > 0) // Mostrar apenas habilidades com dados reais
    .sort((a, b) => b.score - a.score); // Ordenar por score

  if (skillsWithScores.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Mapeamento de Habilidades
          </CardTitle>
          <CardDescription>
            Processando análise de competências pelos assistentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Assistentes analisando suas habilidades...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAreaColor = (area: string) => {
    const colors = {
      'relacionamentos': 'text-purple-600 bg-purple-50 border-purple-200',
      'estrategia': 'text-blue-600 bg-blue-50 border-blue-200',
      'criatividade': 'text-orange-600 bg-orange-50 border-orange-200',
      'psicologia': 'text-indigo-600 bg-indigo-50 border-indigo-200',
      'financeiro': 'text-green-600 bg-green-50 border-green-200',
      'saude': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[area] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Mapeamento de Habilidades
        </CardTitle>
        <CardDescription>
          Competências identificadas por {data.metrics.assistantsActive} assistentes especializados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillsWithScores.map((skill, index) => {
            const lastUpdateFormatted = skill.lastUpdate 
              ? skill.lastUpdate.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : null;

            return (
              <div key={skill.name} className={`border rounded-lg p-4 ${getAreaColor(skill.area)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <h4 className="font-medium text-sm">{skill.name}</h4>
                  </div>
                  <Badge className="bg-white/80 text-xs">
                    {skill.score}%
                  </Badge>
                </div>
                
                <Progress value={skill.score} className="h-2 mb-3" />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      {skill.insights.length} insight{skill.insights.length > 1 ? 's' : ''}
                    </span>
                    {lastUpdateFormatted && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lastUpdateFormatted}
                      </span>
                    )}
                  </div>
                  
                  {/* Mostrar o insight mais relevante */}
                  {skill.insights.length > 0 && (
                    <p className="text-xs opacity-80 line-clamp-2">
                      {skill.insights[0].description.substring(0, 80)}...
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumo das habilidades */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Resumo das Competências
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-blue-600">
            <div>
              <span className="font-medium">{skillsWithScores.length}</span>
              <span className="block text-xs">Habilidades Mapeadas</span>
            </div>
            <div>
              <span className="font-medium">{skillInsights.length}</span>
              <span className="block text-xs">Insights de Desenvolvimento</span>
            </div>
            <div>
              <span className="font-medium">
                {Math.round(skillsWithScores.reduce((acc, skill) => acc + skill.score, 0) / skillsWithScores.length)}%
              </span>
              <span className="block text-xs">Score Médio</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
