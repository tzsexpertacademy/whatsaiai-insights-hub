import React, { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, Clock, TrendingUp, Star, ArrowRight, Lightbulb, Calendar } from 'lucide-react';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'saude' | 'carreira' | 'relacionamentos' | 'crescimento-pessoal';
  priority: 'alta' | 'media' | 'baixa';
  difficulty: 'facil' | 'medio' | 'dificil';
  estimatedTime: string;
  progress: number;
  completed: boolean;
}

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: '1',
      title: 'Implementar técnica de respiração diária',
      description: 'Pratique 10 minutos de respiração profunda todas as manhãs para reduzir o estresse e melhorar o foco.',
      category: 'saude',
      priority: 'alta',
      difficulty: 'facil',
      estimatedTime: '10 min/dia',
      progress: 65,
      completed: false
    },
    {
      id: '2',
      title: 'Desenvolver habilidades de comunicação',
      description: 'Participe de um curso online de comunicação assertiva para melhorar seus relacionamentos profissionais.',
      category: 'carreira',
      priority: 'alta',
      difficulty: 'medio',
      estimatedTime: '2 semanas',
      progress: 30,
      completed: false
    },
    {
      id: '3',
      title: 'Estabelecer rotina de exercícios',
      description: 'Comece com 30 minutos de caminhada, 3 vezes por semana, para melhorar sua energia e bem-estar geral.',
      category: 'saude',
      priority: 'media',
      difficulty: 'medio',
      estimatedTime: '30 min, 3x/semana',
      progress: 85,
      completed: false
    },
    {
      id: '4',
      title: 'Praticar gratidão diária',
      description: 'Escreva 3 coisas pelas quais você é grato todos os dias antes de dormir.',
      category: 'crescimento-pessoal',
      priority: 'baixa',
      difficulty: 'facil',
      estimatedTime: '5 min/dia',
      progress: 100,
      completed: true
    }
  ]);

  const markAsCompleted = (id: string) => {
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === id ? { ...rec, completed: true, progress: 100 } : rec
      )
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'saude': return 'bg-green-100 text-green-800';
      case 'carreira': return 'bg-blue-100 text-blue-800';
      case 'relacionamentos': return 'bg-pink-100 text-pink-800';
      case 'crescimento-pessoal': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeRecommendations = recommendations.filter(r => !r.completed);
  const completedRecommendations = recommendations.filter(r => r.completed);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Recomendações"
        subtitle="Sugestões personalizadas para seu desenvolvimento pessoal"
      >
        <AIAnalysisButton />
      </PageHeader>
      
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ativas</p>
                    <p className="text-2xl font-bold">{activeRecommendations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Concluídas</p>
                    <p className="text-2xl font-bold">{completedRecommendations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Alta Prioridade</p>
                    <p className="text-2xl font-bold">
                      {recommendations.filter(r => r.priority === 'alta' && !r.completed).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Progresso Médio</p>
                    <p className="text-2xl font-bold">
                      {Math.round(recommendations.reduce((acc, rec) => acc + rec.progress, 0) / recommendations.length)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recomendações Ativas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Recomendações Ativas
              </CardTitle>
              <CardDescription>
                Suas recomendações personalizadas em andamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeRecommendations.map((recommendation) => (
                  <Card key={recommendation.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{recommendation.title}</h4>
                            <Badge className={getCategoryColor(recommendation.category)}>
                              {recommendation.category.replace('-', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(recommendation.priority)}>
                              {recommendation.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{recommendation.description}</p>
                          
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              {recommendation.estimatedTime}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Star className="h-4 w-4" />
                              {recommendation.difficulty}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Progresso</span>
                              <span className="text-sm font-medium">{recommendation.progress}%</span>
                            </div>
                            <Progress value={recommendation.progress} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {recommendation.progress === 100 ? (
                            <Button
                              onClick={() => markAsCompleted(recommendation.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Concluir
                            </Button>
                          ) : (
                            <Button variant="outline">
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Continuar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recomendações Concluídas */}
          {completedRecommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Recomendações Concluídas
                </CardTitle>
                <CardDescription>
                  Parabéns pelo seu progresso!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedRecommendations.map((recommendation) => (
                    <div key={recommendation.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-green-800">{recommendation.title}</h4>
                        <p className="text-sm text-green-600">{recommendation.description}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Concluída
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
