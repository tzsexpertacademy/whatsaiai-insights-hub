
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCommercialAnalysisData } from '@/contexts/CommercialAnalysisDataContext';
import { Loader2, AlertCircle, TrendingUp, Target, Users, Award, Zap, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';

interface CommercialRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'alta' | 'média' | 'baixa';
  assistantName: string;
  expectedImpact: string;
  actionRequired: string;
}

export function CommercialRecommendations() {
  const { data, isLoading } = useCommercialAnalysisData();

  // Gerar recomendações baseadas nos insights comerciais
  const generateRecommendationsFromInsights = () => {
    if (!data.insights || data.insights.length === 0) return [];

    const recommendations: CommercialRecommendation[] = [];

    data.insights.forEach((insight, index) => {
      // Gerar recomendação baseada no tipo de insight
      const recommendation = generateRecommendationFromInsight(insight, index);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    });

    // Adicionar recomendações baseadas em métricas
    if (data.salesMetrics) {
      const metricsRecommendations = generateMetricsRecommendations(data.salesMetrics);
      recommendations.push(...metricsRecommendations);
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'alta': 3, 'média': 2, 'baixa': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const generateRecommendationFromInsight = (insight: any, index: number): CommercialRecommendation | null => {
    const recommendationMap: { [key: string]: Partial<CommercialRecommendation> } = {
      'conversion': {
        title: 'Otimizar Processo de Conversão',
        description: `Baseado na análise "${insight.title}", recomendamos revisar e otimizar o funil de conversão para aumentar as taxas de fechamento.`,
        category: 'Conversão',
        assistantName: 'Diretor Comercial',
        expectedImpact: 'Aumento de 15-25% na conversão',
        actionRequired: 'Revisar etapas do funil e implementar melhorias'
      },
      'behavioral': {
        title: 'Aprimorar Abordagem Comportamental',
        description: `Com base no insight "${insight.title}", sugerimos ajustar a abordagem de vendas para melhor alinhamento com o perfil do cliente.`,
        category: 'Comportamento',
        assistantName: 'Head Comercial',
        expectedImpact: 'Melhoria na qualidade dos leads',
        actionRequired: 'Treinar equipe em técnicas comportamentais'
      },
      'objection': {
        title: 'Estratégia para Contornar Objeções',
        description: `Desenvolver estratégias específicas para lidar com a objeção identificada: "${insight.title}".`,
        category: 'Objeções',
        assistantName: 'Closer',
        expectedImpact: 'Redução de 30% nas objeções',
        actionRequired: 'Criar scripts e treinamentos específicos'
      },
      'process': {
        title: 'Otimizar Processo Comercial',
        description: `Melhorar o processo comercial baseado no insight: "${insight.title}".`,
        category: 'Processo',
        assistantName: 'Gerente Comercial',
        expectedImpact: 'Redução do ciclo de vendas',
        actionRequired: 'Redesenhar workflow comercial'
      }
    };

    const template = recommendationMap[insight.insight_type];
    if (!template) return null;

    return {
      id: `rec-${insight.id}`,
      title: template.title!,
      description: template.description!,
      category: template.category!,
      priority: insight.priority === 'high' ? 'alta' as const : insight.priority === 'low' ? 'baixa' as const : 'média' as const,
      assistantName: template.assistantName!,
      expectedImpact: template.expectedImpact!,
      actionRequired: template.actionRequired!
    };
  };

  const generateMetricsRecommendations = (metrics: any): CommercialRecommendation[] => {
    const recommendations: CommercialRecommendation[] = [];

    // Recomendação baseada na taxa de conversão
    if (metrics.conversion_rate < 15) {
      recommendations.push({
        id: 'metrics-conversion',
        title: 'Melhorar Taxa de Conversão',
        description: `Sua taxa de conversão atual é ${metrics.conversion_rate.toFixed(1)}%. Recomendamos focar em qualificação de leads e otimização do processo.`,
        category: 'Performance',
        priority: 'alta',
        assistantName: 'Diretor Comercial',
        expectedImpact: 'Aumento para 20%+ na conversão',
        actionRequired: 'Implementar processo de qualificação avançada'
      });
    }

    // Recomendação baseada no ciclo de vendas
    if (metrics.sales_cycle_days > 60) {
      recommendations.push({
        id: 'metrics-cycle',
        title: 'Acelerar Ciclo de Vendas',
        description: `Seu ciclo de vendas atual é ${metrics.sales_cycle_days} dias. Identifique gargalos e agilize o processo de decisão.`,
        category: 'Eficiência',
        priority: 'média',
        assistantName: 'Gerente Comercial',
        expectedImpact: 'Redução de 20-30% no ciclo',
        actionRequired: 'Mapear e otimizar etapas críticas'
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendationsFromInsights();

  const getPriorityColor = (priority: string) => {
    const colorMap = {
      'alta': 'bg-red-100 text-red-800 border-red-200',
      'média': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'baixa': 'bg-green-100 text-green-800 border-green-200'
    };
    return colorMap[priority as keyof typeof colorMap] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      'Conversão': TrendingUp,
      'Comportamento': Users,
      'Objeções': Target,
      'Processo': Zap,
      'Performance': Award,
      'Eficiência': CheckCircle
    };
    return iconMap[category] || Lightbulb;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Recomendações Comerciais</h1>
          <p className="text-slate-600">Sugestões inteligentes para otimizar suas vendas</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (!data.hasRealData || recommendations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Recomendações Comerciais</h1>
          <p className="text-slate-600">Sugestões inteligentes para otimizar suas vendas</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Recomendações Aguardam Dados IA</h3>
              <p className="text-gray-500 max-w-md">
                As recomendações comerciais serão geradas após análises de conversas e métricas pela IA.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Execute análises IA de conversas comerciais</p>
                <p>• A IA identificará oportunidades de melhoria</p>
                <p>• Recomendações personalizadas serão geradas automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Recomendações Comerciais</h1>
        <p className="text-slate-600">Sugestões personalizadas baseadas em análise dos assistentes</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-green-100 text-blue-800">
          🎯 {recommendations.length} recomendações ativas
        </Badge>
        <Badge variant="outline" className="bg-red-50 text-red-700">
          {recommendations.filter(r => r.priority === 'alta').length} alta prioridade
        </Badge>
      </div>

      {/* Métricas das recomendações */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">{recommendations.length}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alta Prioridade</p>
                <p className="text-2xl font-bold text-red-600">
                  {recommendations.filter(r => r.priority === 'alta').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categorias</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Set(recommendations.map(r => r.category)).size}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assistentes</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(recommendations.map(r => r.assistantName)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de recomendações */}
      <div className="space-y-4">
        {recommendations.map((recommendation) => {
          const IconComponent = getCategoryIcon(recommendation.category);
          return (
            <Card key={recommendation.id} className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-blue-100">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                          {recommendation.title}
                        </h3>
                        <p className="text-slate-600">{recommendation.description}</p>
                      </div>
                      <Badge className={getPriorityColor(recommendation.priority)}>
                        {recommendation.priority.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="text-sm font-medium text-green-800 mb-1">Impacto Esperado</h4>
                        <p className="text-sm text-green-700">{recommendation.expectedImpact}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-medium text-blue-800 mb-1">Ação Necessária</h4>
                        <p className="text-sm text-blue-700">{recommendation.actionRequired}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          📊 {recommendation.category}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          🤖 {recommendation.assistantName}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                        <span>Ver detalhes</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
