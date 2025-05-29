
import React, { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Heart, Briefcase, Users, GraduationCap, DollarSign, Dumbbell, Home, Star, TrendingUp, Target } from 'lucide-react';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Badge } from "@/components/ui/badge";

const lifeAreas = [
  { id: 'saude', name: 'Saúde', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'carreira', name: 'Carreira', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'relacionamentos', name: 'Relacionamentos', icon: Users, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'educacao', name: 'Educação', icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'financas', name: 'Finanças', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'fitness', name: 'Fitness', icon: Dumbbell, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'familia', name: 'Família', icon: Home, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'lazer', name: 'Lazer', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
];

export function AreasOfLife() {
  const { data, isLoading } = useAnalysisData();
  const [scores, setScores] = useState<Record<string, number>>({});

  const handleScoreChange = (areaId: string, value: number[]) => {
    setScores(prev => ({ ...prev, [areaId]: value[0] }));
  };

  // Usar dados reais dos assistentes se disponíveis
  const realLifeAreas = data.lifeAreas && data.lifeAreas.length > 0 ? data.lifeAreas : [];
  const hasRealData = data.hasRealData && realLifeAreas.length > 0;

  const averageScore = hasRealData 
    ? Math.round(realLifeAreas.reduce((acc, area) => acc + area.score, 0) / realLifeAreas.length)
    : Object.values(scores).length > 0 
      ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length)
      : 0;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
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
                  <p>Carregando análise das áreas da vida...</p>
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
        {hasRealData && (
          <Badge className="bg-purple-100 text-purple-800">
            🔮 Análise dos Assistentes
          </Badge>
        )}
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
                {hasRealData && (
                  <Badge variant="outline" className="text-xs">
                    Baseado em {data.metrics.totalInsights} insights
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {hasRealData 
                  ? "Análise baseada nos insights dos seus assistentes IA"
                  : "Média das suas avaliações em todas as áreas da vida"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={averageScore * 10} className="h-3" />
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                  {averageScore}/10
                </div>
              </div>
              {averageScore > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {averageScore >= 8 && "Excelente equilíbrio! Continue assim."}
                  {averageScore >= 6 && averageScore < 8 && "Bom equilíbrio, mas há espaço para melhorias."}
                  {averageScore < 6 && "Há várias áreas que precisam de atenção."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Grade de Áreas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lifeAreas.map((area) => {
              const Icon = area.icon;
              
              // Usar dados reais se disponíveis, senão usar scores manuais
              const realAreaData = realLifeAreas.find(ra => 
                ra.name.toLowerCase().includes(area.name.toLowerCase()) ||
                area.name.toLowerCase().includes(ra.name.toLowerCase())
              );
              
              const currentScore = realAreaData ? realAreaData.score / 10 : (scores[area.id] || 5);
              const insightsCount = realAreaData?.insights || 0;
              
              return (
                <Card key={area.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg ${area.bg} flex items-center justify-center mb-2`}>
                      <Icon className={`h-6 w-6 ${area.color}`} />
                    </div>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {area.name}
                      {hasRealData && insightsCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {insightsCount} insights
                        </Badge>
                      )}
                    </CardTitle>
                    <div className={`text-2xl font-bold ${getScoreColor(currentScore)}`}>
                      {Math.round(currentScore)}/10
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {!hasRealData && (
                        <>
                          <Slider
                            value={[currentScore]}
                            onValueChange={(value) => handleScoreChange(area.id, value)}
                            max={10}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Muito baixo</span>
                            <span>Excelente</span>
                          </div>
                        </>
                      )}
                      
                      {hasRealData && realAreaData && (
                        <div className="text-sm text-gray-600">
                          Score baseado em análise dos assistentes IA
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Insights dos Assistentes */}
          {hasRealData && (
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

          {/* Insights do Equilíbrio */}
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
                  {(hasRealData ? realLifeAreas : Object.entries(scores))
                    .filter(([_, score]) => (hasRealData ? score >= 80 : score >= 8))
                    .map(([areaId, score]) => {
                      const areaName = hasRealData ? areaId : lifeAreas.find(a => a.id === areaId)?.name;
                      const displayScore = hasRealData ? Math.round(score / 10) : score;
                      return areaName ? (
                        <div key={areaId} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {areaName}: {displayScore}/10
                        </div>
                      ) : null;
                    })}
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">Áreas para Melhoria</h4>
                  {(hasRealData ? realLifeAreas : Object.entries(scores))
                    .filter(([_, score]) => (hasRealData ? score < 60 : score < 6))
                    .map(([areaId, score]) => {
                      const areaName = hasRealData ? areaId : lifeAreas.find(a => a.id === areaId)?.name;
                      const displayScore = hasRealData ? Math.round(score / 10) : score;
                      return areaName ? (
                        <div key={areaId} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {areaName}: {displayScore}/10
                        </div>
                      ) : null;
                    })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
