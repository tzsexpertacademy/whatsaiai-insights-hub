
import React, { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Heart, Briefcase, Users, GraduationCap, DollarSign, Dumbbell, Home, Star, TrendingUp, Target } from 'lucide-react';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';

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
  const [scores, setScores] = useState<Record<string, number>>({});

  const handleScoreChange = (areaId: string, value: number[]) => {
    setScores(prev => ({ ...prev, [areaId]: value[0] }));
  };

  const averageScore = Object.values(scores).length > 0 
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Áreas da Vida"
        subtitle="Avalie e equilibre as diferentes áreas da sua vida"
      >
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
              </CardTitle>
              <CardDescription>
                Média das suas avaliações em todas as áreas da vida
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
              const currentScore = scores[area.id] || 5;
              
              return (
                <Card key={area.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg ${area.bg} flex items-center justify-center mb-2`}>
                      <Icon className={`h-6 w-6 ${area.color}`} />
                    </div>
                    <CardTitle className="text-lg">{area.name}</CardTitle>
                    <div className={`text-2xl font-bold ${getScoreColor(currentScore)}`}>
                      {currentScore}/10
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
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
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Insights */}
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
                  {Object.entries(scores)
                    .filter(([_, score]) => score >= 8)
                    .map(([areaId, score]) => {
                      const area = lifeAreas.find(a => a.id === areaId);
                      return area ? (
                        <div key={areaId} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {area.name}: {score}/10
                        </div>
                      ) : null;
                    })}
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">Áreas para Melhoria</h4>
                  {Object.entries(scores)
                    .filter(([_, score]) => score < 6)
                    .map(([areaId, score]) => {
                      const area = lifeAreas.find(a => a.id === areaId);
                      return area ? (
                        <div key={areaId} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {area.name}: {score}/10
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
