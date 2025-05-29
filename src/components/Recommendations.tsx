
import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, Clock, TrendingUp, Star, ArrowRight, Lightbulb, Calendar, Bot } from 'lucide-react';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function Recommendations() {
  const { data, isLoading } = useAnalysisData();

  // Usar APENAS dados reais dos assistentes
  const hasRealData = data.hasRealData && data.recommendationsWithAssistant && data.recommendationsWithAssistant.length > 0;

  const getAssistantIcon = (area: string) => {
    const iconMap: { [key: string]: string } = {
      'psicologia': '🔮',
      'financeiro': '💰',
      'saude': '⚡',
      'estrategia': '🎯',
      'proposito': '🌟',
      'criatividade': '🎨',
      'relacionamentos': '👥',
      'geral': '🤖'
    };
    return iconMap[area] || '🤖';
  };

  const getAssistantColor = (area: string) => {
    const colorMap: { [key: string]: string } = {
      'psicologia': 'bg-purple-100 text-purple-800',
      'financeiro': 'bg-green-100 text-green-800',
      'saude': 'bg-blue-100 text-blue-800',
      'estrategia': 'bg-orange-100 text-orange-800',
      'proposito': 'bg-yellow-100 text-yellow-800',
      'criatividade': 'bg-pink-100 text-pink-800',
      'relacionamentos': 'bg-indigo-100 text-indigo-800',
      'geral': 'bg-gray-100 text-gray-800'
    };
    return colorMap[area] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Média';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Recomendações"
          subtitle="Sugestões personalizadas para seu desenvolvimento pessoal"
        >
          <AIAnalysisButton />
        </PageHeader>
        
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p>Carregando recomendações dos assistentes...</p>
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
          title="Recomendações"
          subtitle="Sugestões personalizadas para seu desenvolvimento pessoal"
        >
          <AIAnalysisButton />
        </PageHeader>
        
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                  Recomendações Aguardam Análise dos Assistentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aguardando Recomendações dos Assistentes</h3>
                  <p className="text-gray-600 mb-6">
                    As recomendações personalizadas serão geradas após análises dos assistentes IA
                  </p>
                  <div className="text-left max-w-md mx-auto space-y-2 mb-6">
                    <p className="text-sm text-gray-600">• Execute análises IA das suas conversas</p>
                    <p className="text-sm text-gray-600">• Os assistentes identificarão oportunidades</p>
                    <p className="text-sm text-gray-600">• Recomendações personalizadas serão criadas</p>
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

  // Calcular estatísticas baseadas nos dados reais
  const activeRecommendations = data.recommendationsWithAssistant.filter(r => !r.completed);
  const completedRecommendations = data.recommendationsWithAssistant.filter(r => r.completed);
  const highPriorityCount = data.recommendationsWithAssistant.filter(r => r.priority === 'high').length;
  const averageProgress = Math.round(
    data.recommendationsWithAssistant.reduce((acc, rec) => acc + (rec.progress || 0), 0) / 
    data.recommendationsWithAssistant.length
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Recomendações"
        subtitle="Sugestões personalizadas para seu desenvolvimento pessoal"
      >
        <Badge className="bg-purple-100 text-purple-800">
          🔮 Recomendações dos Assistentes - {data.recommendationsWithAssistant.length} ativas
        </Badge>
        <AIAnalysisButton />
      </PageHeader>
      
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Estatísticas baseadas nos dados dos assistentes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{data.recommendationsWithAssistant.length}</p>
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
                    <p className="text-2xl font-bold">{highPriorityCount}</p>
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
                    <p className="text-2xl font-bold">{averageProgress}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info dos assistentes que geraram recomendações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                Assistentes Gerando Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[...new Set(data.recommendationsWithAssistant.map(r => r.assistantName).filter(Boolean))]
                  .map((assistantName, index) => {
                    const assistantArea = data.recommendationsWithAssistant.find(r => r.assistantName === assistantName)?.assistantArea;
                    const count = data.recommendationsWithAssistant.filter(r => r.assistantName === assistantName).length;
                    return (
                      <Badge key={index} className={getAssistantColor(assistantArea || 'geral')}>
                        {getAssistantIcon(assistantArea || 'geral')} {assistantName} ({count})
                      </Badge>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Recomendações dos Assistentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Recomendações dos Assistentes
                <Badge variant="outline" className="text-xs">
                  {data.recommendationsWithAssistant.length} recomendações ativas
                </Badge>
              </CardTitle>
              <CardDescription>
                Sugestões personalizadas baseadas na análise dos seus assistentes IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recommendationsWithAssistant.map((recommendation, index) => (
                  <Card key={recommendation.id || index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">
                              {recommendation.title || `Recomendação ${index + 1}`}
                            </h4>
                            {recommendation.assistantName && (
                              <Badge className={getAssistantColor(recommendation.assistantArea || 'geral')}>
                                {getAssistantIcon(recommendation.assistantArea || 'geral')} {recommendation.assistantName}
                              </Badge>
                            )}
                            {recommendation.priority && (
                              <Badge className={getPriorityColor(recommendation.priority)}>
                                {getPriorityLabel(recommendation.priority)}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-3">
                            {recommendation.text || recommendation.description}
                          </p>
                          
                          <div className="flex items-center gap-4 mb-3">
                            {recommendation.assistantArea && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Star className="h-4 w-4" />
                                Área: {recommendation.assistantArea}
                              </div>
                            )}
                            {recommendation.createdAt && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                {new Date(recommendation.createdAt).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                          
                          {recommendation.progress !== undefined && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Progresso</span>
                                <span className="text-sm font-medium">{recommendation.progress}%</span>
                              </div>
                              <Progress value={recommendation.progress} className="h-2" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {recommendation.completed ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Concluída
                            </Badge>
                          ) : (
                            <Button variant="outline" size="sm">
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Implementar
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

          {/* Resumo por Área dos Assistentes */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Área dos Assistentes</CardTitle>
              <CardDescription>
                Distribuição das recomendações por área de especialização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['psicologia', 'saude', 'estrategia', 'financeiro', 'relacionamentos', 'proposito'].map(area => {
                  const areaRecommendations = data.recommendationsWithAssistant.filter(r => r.assistantArea === area);
                  const completedCount = areaRecommendations.filter(r => r.completed).length;
                  
                  if (areaRecommendations.length === 0) return null;
                  
                  return (
                    <div key={area} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize flex items-center gap-2">
                          {getAssistantIcon(area)} {area}
                        </h4>
                        <Badge className={getAssistantColor(area)}>
                          {areaRecommendations.length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {completedCount} concluídas
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Assistentes: {[...new Set(areaRecommendations.map(r => r.assistantName))].join(', ')}
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
