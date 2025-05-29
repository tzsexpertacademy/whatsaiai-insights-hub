
import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Briefcase, Users, GraduationCap, DollarSign, Dumbbell, Home, Star, TrendingUp, Target, Bot } from 'lucide-react';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Badge } from "@/components/ui/badge";

const lifeAreaIcons = {
  'saude': Heart,
  'carreira': Briefcase,
  'relacionamentos': Users,
  'educacao': GraduationCap,
  'financas': DollarSign,
  'fitness': Dumbbell,
  'familia': Home,
  'lazer': Star,
  'estrategia': Briefcase,
  'proposito': GraduationCap,
  'psicologia': Users,
  'criatividade': Star,
  'financeiro': DollarSign,
  'geral': Target
};

const lifeAreaColors = {
  'saude': { color: 'text-red-500', bg: 'bg-red-50' },
  'carreira': { color: 'text-blue-500', bg: 'bg-blue-50' },
  'relacionamentos': { color: 'text-pink-500', bg: 'bg-pink-50' },
  'educacao': { color: 'text-purple-500', bg: 'bg-purple-50' },
  'financas': { color: 'text-green-500', bg: 'bg-green-50' },
  'fitness': { color: 'text-orange-500', bg: 'bg-orange-50' },
  'familia': { color: 'text-indigo-500', bg: 'bg-indigo-50' },
  'lazer': { color: 'text-yellow-500', bg: 'bg-yellow-50' },
  'estrategia': { color: 'text-blue-600', bg: 'bg-blue-50' },
  'proposito': { color: 'text-purple-600', bg: 'bg-purple-50' },
  'psicologia': { color: 'text-pink-600', bg: 'bg-pink-50' },
  'criatividade': { color: 'text-yellow-600', bg: 'bg-yellow-50' },
  'financeiro': { color: 'text-green-600', bg: 'bg-green-50' },
  'geral': { color: 'text-gray-600', bg: 'bg-gray-50' }
};

export function AreasOfLife() {
  const { data, isLoading } = useAnalysisData();

  // Usar APENAS dados reais dos assistentes
  const hasRealData = data.hasRealData && data.lifeAreas && data.lifeAreas.length > 0;

  const averageScore = hasRealData 
    ? Math.round(data.lifeAreas.reduce((acc, area) => acc + area.score, 0) / data.lifeAreas.length)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Áreas da Vida"
          subtitle="Avalie e equilibre as diferentes áreas da sua vida"
        >
          <AIAnalysisButton />
        </PageHeader>
        
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p>Carregando análise das áreas da vida pelos assistentes...</p>
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
          title="Áreas da Vida"
          subtitle="Avalie e equilibre as diferentes áreas da sua vida"
        >
          <AIAnalysisButton />
        </PageHeader>
        
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Áreas da Vida Aguardam Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aguardando Análise dos Assistentes</h3>
                  <p className="text-gray-600 mb-6">
                    As análises das áreas da vida serão geradas após análises dos assistentes IA
                  </p>
                  <div className="text-left max-w-md mx-auto space-y-2 mb-6">
                    <p className="text-sm text-gray-600">• Execute análises IA das suas conversas</p>
                    <p className="text-sm text-gray-600">• Os assistentes avaliarão diferentes áreas</p>
                    <p className="text-sm text-gray-600">• Relatórios de equilíbrio serão gerados</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Áreas da Vida"
        subtitle="Avalie e equilibre as diferentes áreas da sua vida"
      >
        <Badge className="bg-purple-100 text-purple-800">
          🔮 Análise dos Assistentes - {data.lifeAreas.length} áreas
        </Badge>
        <AIAnalysisButton />
      </PageHeader>
      
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Score Geral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Pontuação Geral do Equilíbrio
                <Badge variant="outline" className="text-xs">
                  Baseado em {data.metrics.totalInsights} insights dos assistentes
                </Badge>
              </CardTitle>
              <CardDescription>
                Análise baseada nos insights dos seus assistentes IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={averageScore} className="h-3" />
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                  {averageScore}/100
                </div>
              </div>
              {averageScore > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {averageScore >= 80 && "Excelente equilíbrio segundo os assistentes!"}
                  {averageScore >= 60 && averageScore < 80 && "Bom equilíbrio, mas há espaço para melhorias."}
                  {averageScore < 60 && "Os assistentes identificaram várias áreas que precisam de atenção."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Grade de Áreas - APENAS dados dos assistentes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.lifeAreas.map((area) => {
              const areaKey = area.name.toLowerCase().replace(/[^a-z]/g, '');
              const Icon = lifeAreaIcons[areaKey] || Target;
              const colors = lifeAreaColors[areaKey] || { color: 'text-gray-600', bg: 'bg-gray-50' };
              
              return (
                <Card key={area.name} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center mb-2`}>
                      <Icon className={`h-6 w-6 ${colors.color}`} />
                    </div>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {area.name}
                      <Badge variant="outline" className="text-xs">
                        {area.insights} insights
                      </Badge>
                    </CardTitle>
                    <div className={`text-2xl font-bold ${getScoreColor(area.score)}`}>
                      {area.score}/100
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        Score baseado em análise dos assistentes IA
                      </div>
                      <Progress value={area.score} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Insights dos Assistentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Insights dos Assistentes por Área
              </CardTitle>
              <CardDescription>
                Análises específicas baseadas nos seus assistentes IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.insightsWithAssistant?.slice(0, 5).map((insight) => (
                  <div key={insight.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-l-purple-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-purple-100 text-purple-800">
                            {insight.assistantName}
                          </Badge>
                          <Badge variant="outline">
                            {insight.assistantArea || insight.category}
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

          {/* Insights do Equilíbrio - Baseado em dados reais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Insights do Equilíbrio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">Áreas Fortes</h4>
                  {data.lifeAreas
                    .filter(area => area.score >= 75)
                    .map(area => (
                      <div key={area.name} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {area.name}: {area.score}/100
                      </div>
                    ))}
                  {data.lifeAreas.filter(area => area.score >= 75).length === 0 && (
                    <p className="text-sm text-gray-500">Nenhuma área forte identificada ainda</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">Áreas para Melhoria</h4>
                  {data.lifeAreas
                    .filter(area => area.score < 60)
                    .map(area => (
                      <div key={area.name} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        {area.name}: {area.score}/100
                      </div>
                    ))}
                  {data.lifeAreas.filter(area => area.score < 60).length === 0 && (
                    <p className="text-sm text-gray-500">Todas as áreas estão em bom nível</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
