
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Lightbulb, TrendingUp, Target, ArrowRight, Bot, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RecommendationsSection() {
  const { data, isLoading } = useAnalysisData();
  const navigate = useNavigate();

  console.log('💡 RecommendationsSection - Dados REAIS:', {
    hasRealData: data.hasRealData,
    recommendationsWithAssistant: data.recommendationsWithAssistant?.length || 0,
    insightsWithAssistant: data.insightsWithAssistant?.length || 0
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

  if (!data.hasRealData) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Centro de Recomendações
          </CardTitle>
          <CardDescription>
            Aguardando recomendações dos assistentes especializados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma recomendação disponível</h3>
            <p className="text-gray-600 mb-4">
              Os assistentes ainda não geraram recomendações personalizadas
            </p>
            <div className="text-left max-w-md mx-auto space-y-2">
              <p className="text-sm text-gray-600">• Execute análise por IA no dashboard</p>
              <p className="text-sm text-gray-600">• Converse com os assistentes especializados</p>
              <p className="text-sm text-gray-600">• Aguarde processamento das recomendações</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extrair recomendações REAIS dos insights dos assistentes
  const realRecommendations = data.insightsWithAssistant
    .filter(insight => 
      insight.insight_type === 'recommendation' ||
      insight.description.toLowerCase().includes('recomend') ||
      insight.description.toLowerCase().includes('sugir') ||
      insight.description.toLowerCase().includes('deveria') ||
      insight.description.toLowerCase().includes('seria bom')
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Se não há recomendações explícitas, usar insights gerais como base para recomendações
  const fallbackRecommendations = realRecommendations.length === 0 
    ? data.insightsWithAssistant
        .filter(insight => 
          insight.priority === 'high' || 
          insight.assistantArea === 'desenvolvimento' ||
          insight.assistantArea === 'estrategia'
        )
        .slice(0, 3)
    : [];

  const displayRecommendations = realRecommendations.length > 0 ? realRecommendations : fallbackRecommendations;

  if (displayRecommendations.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Centro de Recomendações
          </CardTitle>
          <CardDescription>
            Processando recomendações dos assistentes especializados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Assistentes analisando seus dados para gerar recomendações...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          Recomendações dos Assistentes
        </CardTitle>
        <CardDescription>
          {realRecommendations.length > 0 
            ? `${realRecommendations.length} recomendações específicas dos assistentes`
            : `${displayRecommendations.length} insights prioritários transformados em recomendações`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {displayRecommendations.map((recommendation, index) => {
            const createdAt = new Date(recommendation.createdAt);
            const formattedDate = createdAt.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            });

            const getRecommendationIcon = (area: string) => {
              switch (area?.toLowerCase()) {
                case 'desenvolvimento':
                case 'estrategia':
                  return <TrendingUp className="h-5 w-5 text-blue-600" />;
                case 'relacionamentos':
                case 'psicologia':
                  return <Target className="h-5 w-5 text-purple-600" />;
                default:
                  return <Lightbulb className="h-5 w-5 text-yellow-600" />;
              }
            };

            return (
              <div key={recommendation.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getRecommendationIcon(recommendation.assistantArea)}
                    <h4 className="font-medium text-slate-800 text-sm">
                      {recommendation.title}
                    </h4>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs flex items-center gap-1">
                    <Bot className="h-3 w-3" />
                    {recommendation.assistantName}
                  </Badge>
                </div>
                
                <p className="text-sm text-slate-600 mb-3 line-clamp-3">
                  {recommendation.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Área: {recommendation.assistantArea}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formattedDate}
                    </span>
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      recommendation.priority === 'high' ? 'border-red-300 text-red-700' :
                      recommendation.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                      'border-green-300 text-green-700'
                    }`}
                  >
                    {recommendation.priority === 'high' ? 'Prioritário' :
                     recommendation.priority === 'medium' ? 'Importante' : 'Sugestão'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ação para ver todas as recomendações */}
        <div className="flex items-center justify-center">
          <Button 
            onClick={() => navigate('/dashboard/recommendations')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Ver Todas as Recomendações
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
