
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle, Bot, Clock, Brain, Heart, Target, Users, Briefcase, GraduationCap, TrendingUp } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { responsiveContainerClasses, responsiveCardClasses, combineResponsiveClasses } from '@/utils/responsiveUtils';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';

export function AreasOfLife() {
  const { data, isLoading } = useAnalysisData();

  console.log('🏡 AreasOfLife - Análise de dados:', {
    hasRealData: data.hasRealData,
    totalInsights: data.insights?.length || 0,
    insightsWithAssistant: data.insightsWithAssistant?.length || 0,
    assistantsActive: data.metrics.assistantsActive,
    lastAnalysis: data.metrics.lastAnalysis
  });

  if (isLoading) {
    return (
      <PageLayout
        title="Áreas da Vida"
        description="Mapeamento completo das suas dimensões de vida pelos assistentes"
        showBackButton={true}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </PageLayout>
    );
  }

  // Formatação da data da última análise
  const lastUpdate = data.metrics.lastAnalysis ? 
    new Date(data.metrics.lastAnalysis).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : null;

  // Configuração das áreas da vida com palavras-chave para melhor detecção
  const lifeAreasConfig = [
    { 
      name: 'Relacionamentos', 
      icon: Heart, 
      color: 'text-red-600', 
      bgColor: 'bg-red-50',
      keywords: ['relacionamento', 'amor', 'parceiro', 'namoro', 'casamento', 'social', 'amizade']
    },
    { 
      name: 'Carreira', 
      icon: Briefcase, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      keywords: ['carreira', 'trabalho', 'profissional', 'emprego', 'cargo', 'profissão']
    },
    { 
      name: 'Saúde', 
      icon: Target, 
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      keywords: ['saude', 'saúde', 'exercicio', 'exercício', 'alimentação', 'bem-estar', 'fitness']
    },
    { 
      name: 'Família', 
      icon: Users, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50',
      keywords: ['familia', 'família', 'pais', 'filhos', 'irmãos', 'parentes', 'familiar']
    },
    { 
      name: 'Finanças', 
      icon: TrendingUp, 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-50',
      keywords: ['financas', 'finanças', 'dinheiro', 'investimento', 'economia', 'renda', 'orçamento']
    },
    { 
      name: 'Desenvolvimento', 
      icon: GraduationCap, 
      color: 'text-indigo-600', 
      bgColor: 'bg-indigo-50',
      keywords: ['desenvolvimento', 'crescimento', 'aprendizado', 'estudo', 'educação', 'habilidade']
    }
  ];

  // Função para verificar se um insight pertence a uma área específica
  const belongsToArea = (insight: any, area: any) => {
    const textToSearch = `${insight.title} ${insight.description} ${insight.assistantArea || ''}`.toLowerCase();
    
    return area.keywords.some(keyword => textToSearch.includes(keyword)) ||
           insight.assistantArea?.toLowerCase().includes(area.name.toLowerCase()) ||
           insight.category?.toLowerCase().includes(area.name.toLowerCase());
  };

  // Filtrar insights reais por área de vida
  const realInsights = data.insightsWithAssistant || [];

  // Header actions com informações dos assistentes
  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
        🔮 Análise dos Assistentes
      </Badge>
      {data.hasRealData && (
        <>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
            📊 {realInsights.length} insights reais
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
            🤖 {data.metrics.assistantsActive} assistentes ativos
          </Badge>
          {lastUpdate && (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 text-xs hidden sm:flex">
              <Clock className="h-3 w-3 mr-1" />
              Última análise: {lastUpdate}
            </Badge>
          )}
        </>
      )}
      <AIAnalysisButton />
    </div>
  );

  // Se não há dados reais, exibir estado vazio
  if (!data.hasRealData || realInsights.length === 0) {
    return (
      <PageLayout
        title="Áreas da Vida"
        description="Mapeamento completo das suas dimensões de vida pelos assistentes"
        showBackButton={true}
        headerActions={headerActions}
      >
        <Card className={responsiveCardClasses.base}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Áreas da Vida Não Mapeadas
            </CardTitle>
            <CardDescription>
              Para mapear suas áreas da vida, os assistentes precisam analisar suas conversas.
            </CardDescription>
          </CardHeader>
          <CardContent className={combineResponsiveClasses(
            responsiveCardClasses.padding,
            "text-center"
          )}>
            <div className="flex flex-col items-center justify-center space-y-4">
              <Brain className="h-16 w-16 text-gray-300" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600">Mapa das áreas ainda não criado</h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-md">
                Para mapear suas áreas da vida, os assistentes precisam analisar suas conversas.
              </p>
              <div className="text-left text-xs sm:text-sm text-gray-600 space-y-1">
                <p>• Execute a análise por IA no dashboard</p>
                <p>• Os assistentes irão mapear suas áreas de vida</p>
                <p>• Dados serão atualizados automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Áreas da Vida"
      description="Mapeamento completo das suas dimensões de vida pelos assistentes"
      showBackButton={true}
      headerActions={headerActions}
    >
      {/* Grid das áreas da vida */}
      <div className={responsiveContainerClasses.grid.threeColumns}>
        {lifeAreasConfig.map((areaConfig) => {
          // Filtrar insights para esta área específica
          const areaInsights = realInsights.filter(insight => belongsToArea(insight, areaConfig));
          
          // Encontrar o insight mais recente para mostrar informações do assistente
          const latestInsight = areaInsights.length > 0 ? 
            areaInsights.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] : null;

          const Icon = areaConfig.icon;
          
          return (
            <Card key={areaConfig.name} className={`${areaConfig.bgColor} border-0 hover:shadow-md transition-all duration-300`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${areaConfig.color}`} />
                    <span className="text-sm sm:text-base">{areaConfig.name}</span>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    {areaInsights.length} insights
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {areaInsights.length > 0 ? 'Análise por assistentes IA' : 'Aguardando análise'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {areaInsights.length > 0 ? (
                  <div className="space-y-3">
                    {/* Mostrar os 2 insights mais recentes */}
                    {areaInsights.slice(0, 2).map((insight, idx) => {
                      const createdAt = new Date(insight.createdAt);
                      const formattedDate = createdAt.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      return (
                        <div key={idx} className="border rounded-lg p-3 bg-white/70 backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <span className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                              {insight.title}
                            </span>
                            <Badge className="bg-purple-100 text-purple-800 text-xs flex-shrink-0 flex items-center gap-1">
                              <Bot className="w-3 h-3" />
                              {insight.assistantName}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                            {insight.description.substring(0, 80)}...
                          </p>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formattedDate}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                insight.priority === 'high' ? 'border-red-300 text-red-700' :
                                insight.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                                'border-green-300 text-green-700'
                              }`}
                            >
                              {insight.priority === 'high' ? 'Alta' :
                               insight.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}

                    {/* Informações do último assistente que analisou */}
                    {latestInsight && (
                      <div className="mt-3 p-2 bg-white/50 rounded-lg">
                        <div className="text-xs text-slate-600 space-y-1">
                          <p className="flex items-center gap-1">
                            <Bot className="w-3 h-3" />
                            Último assistente: {latestInsight.assistantName}
                          </p>
                          <p className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Última análise: {new Date(latestInsight.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${areaConfig.color} opacity-50`} />
                    <p className="text-xs sm:text-sm text-gray-500">Aguardando análise dos assistentes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights detalhados das áreas - apenas com dados reais */}
      {realInsights.length > 0 && (
        <Card className="mt-6 bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Brain className="w-6 h-6 text-purple-600" />
              Insights Detalhados das Áreas da Vida
            </CardTitle>
            <CardDescription className="text-sm">
              Análise completa pelos assistentes especializados - {realInsights.length} insights gerados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {realInsights.slice(0, 8).map((insight) => {
                const createdAt = new Date(insight.createdAt);
                const formattedDate = createdAt.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={insight.id} className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <h4 className="font-medium text-slate-800 text-sm sm:text-base flex-1">
                        {insight.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className="bg-purple-100 text-purple-800 text-xs flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          {insight.assistantName}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            insight.priority === 'high' ? 'border-red-300 text-red-700' :
                            insight.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                            'border-green-300 text-green-700'
                          }`}
                        >
                          {insight.priority === 'high' ? 'Alta' :
                           insight.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-slate-600 mb-3 leading-relaxed">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 gap-2 pt-2 border-t border-gray-200">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Área: {insight.assistantArea}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumo geral dos assistentes */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Resumo da Análise das Áreas da Vida
              </h4>
              <div className="text-xs text-blue-600 space-y-1">
                <p>🤖 {data.metrics.assistantsActive} assistentes especializados ativos</p>
                <p>🏡 {realInsights.length} insights sobre áreas da vida gerados</p>
                <p>📊 {lifeAreasConfig.filter(area => 
                  realInsights.some(insight => belongsToArea(insight, area))
                ).length} de {lifeAreasConfig.length} áreas mapeadas</p>
                {lastUpdate && (
                  <p>⏰ Última atualização: {lastUpdate}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
