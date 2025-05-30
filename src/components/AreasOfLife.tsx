
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle, Bot, Clock, Brain, Heart, Target, Users, Briefcase, GraduationCap, TrendingUp, Home } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';

export function AreasOfLife() {
  const { data, isLoading } = useAnalysisData();

  console.log('🏡 AreasOfLife - Dados dos assistentes:', {
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
        description="Mapeamento das suas dimensões de vida pelos assistentes IA"
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

  // Configuração das áreas da vida com mapeamento de palavras-chave
  const lifeAreasConfig = [
    { 
      name: 'Relacionamentos', 
      icon: Heart, 
      color: 'text-red-600', 
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      keywords: ['relacionamento', 'amor', 'parceiro', 'namoro', 'casamento', 'social', 'amizade', 'família']
    },
    { 
      name: 'Carreira', 
      icon: Briefcase, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      keywords: ['carreira', 'trabalho', 'profissional', 'emprego', 'cargo', 'profissão', 'negócio']
    },
    { 
      name: 'Saúde', 
      icon: Target, 
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      keywords: ['saúde', 'saude', 'exercício', 'exercicio', 'alimentação', 'bem-estar', 'fitness', 'corpo']
    },
    { 
      name: 'Finanças', 
      icon: TrendingUp, 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      keywords: ['finanças', 'financas', 'dinheiro', 'investimento', 'economia', 'renda', 'orçamento', 'recursos']
    },
    { 
      name: 'Desenvolvimento', 
      icon: GraduationCap, 
      color: 'text-indigo-600', 
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      keywords: ['desenvolvimento', 'crescimento', 'aprendizado', 'estudo', 'educação', 'habilidade', 'criatividade']
    },
    { 
      name: 'Propósito', 
      icon: Home, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      keywords: ['propósito', 'proposito', 'significado', 'sentido', 'missão', 'valores', 'espiritualidade']
    }
  ];

  // Header actions
  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
        🏡 Áreas da Vida
      </Badge>
      {data.hasRealData && (
        <>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
            📊 {data.insightsWithAssistant?.length || 0} insights
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
            🤖 {data.metrics.assistantsActive} assistentes
          </Badge>
          {lastUpdate && (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 text-xs hidden sm:flex">
              <Clock className="h-3 w-3 mr-1" />
              {lastUpdate}
            </Badge>
          )}
        </>
      )}
      <AIAnalysisButton />
    </div>
  );

  // Se não há dados reais, exibir estado vazio
  if (!data.hasRealData || !data.insightsWithAssistant || data.insightsWithAssistant.length === 0) {
    return (
      <PageLayout
        title="Áreas da Vida"
        description="Mapeamento das suas dimensões de vida pelos assistentes IA"
        showBackButton={true}
        headerActions={headerActions}
      >
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              Áreas da Vida Não Mapeadas
            </CardTitle>
            <CardDescription className="text-orange-600">
              Para mapear suas áreas da vida, execute a análise por IA no dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Brain className="h-16 w-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-orange-700 mb-2">
              Análise Pendente
            </h3>
            <p className="text-sm text-orange-600 mb-4">
              Os assistentes precisam analisar suas conversas para mapear suas áreas de vida.
            </p>
            <div className="text-xs text-orange-600 space-y-1 text-left max-w-sm mx-auto">
              <p>• Execute a análise por IA no dashboard</p>
              <p>• Os assistentes irão identificar suas áreas</p>
              <p>• Dados serão atualizados automaticamente</p>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // Função para verificar se um insight pertence a uma área específica
  const belongsToArea = (insight: any, area: any) => {
    const textToSearch = `${insight.title} ${insight.description} ${insight.assistantArea || ''}`.toLowerCase();
    
    return area.keywords.some(keyword => textToSearch.includes(keyword)) ||
           insight.assistantArea?.toLowerCase().includes(area.name.toLowerCase());
  };

  // Filtrar insights por área
  const realInsights = data.insightsWithAssistant || [];

  return (
    <PageLayout
      title="Áreas da Vida"
      description="Mapeamento das suas dimensões de vida pelos assistentes IA"
      showBackButton={true}
      headerActions={headerActions}
    >
      {/* Grid das áreas da vida */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lifeAreasConfig.map((areaConfig) => {
          // Filtrar insights para esta área específica
          const areaInsights = realInsights.filter(insight => belongsToArea(insight, areaConfig));
          
          const Icon = areaConfig.icon;
          
          return (
            <Card 
              key={areaConfig.name} 
              className={`${areaConfig.bgColor} ${areaConfig.borderColor} border hover:shadow-lg transition-all duration-300`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${areaConfig.color}`} />
                    <span className="text-lg font-semibold">{areaConfig.name}</span>
                  </div>
                  <Badge className="bg-white/80 text-gray-700 text-xs">
                    {areaInsights.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm">
                  {areaInsights.length > 0 ? 'Analisado pelos assistentes' : 'Aguardando análise'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {areaInsights.length > 0 ? (
                  areaInsights.slice(0, 2).map((insight, idx) => {
                    const createdAt = new Date(insight.createdAt);
                    const formattedDate = createdAt.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div key={idx} className="bg-white/80 rounded-lg p-3 border border-white/50">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 flex-1 mr-2">
                            {insight.title}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs flex-shrink-0 ${
                              insight.priority === 'high' ? 'border-red-300 text-red-700' :
                              insight.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                              'border-green-300 text-green-700'
                            }`}
                          >
                            {insight.priority === 'high' ? 'Alta' :
                             insight.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {insight.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Bot className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">{insight.assistantName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6">
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${areaConfig.color} opacity-50`} />
                    <p className="text-xs text-gray-500">
                      Aguardando análise dos assistentes
                    </p>
                  </div>
                )}

                {/* Mostrar mais insights se houver */}
                {areaInsights.length > 2 && (
                  <div className="text-center pt-2">
                    <span className="text-xs text-gray-500">
                      +{areaInsights.length - 2} insights adicionais
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights Detalhados */}
      {realInsights.length > 0 && (
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              Análise Detalhada das Áreas da Vida
            </CardTitle>
            <CardDescription>
              Insights completos gerados pelos assistentes especializados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {realInsights.slice(0, 6).map((insight) => {
                const createdAt = new Date(insight.createdAt);
                const formattedDate = createdAt.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                // Determinar qual área este insight pertence
                const matchingArea = lifeAreasConfig.find(area => belongsToArea(insight, area));

                return (
                  <div key={insight.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {matchingArea && <matchingArea.icon className={`w-4 h-4 ${matchingArea.color}`} />}
                          <h4 className="font-medium text-gray-800">{insight.title}</h4>
                        </div>
                        {matchingArea && (
                          <Badge variant="outline" className="text-xs mb-2">
                            {matchingArea.name}
                          </Badge>
                        )}
                      </div>
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
                    
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <span>Área: {insight.assistantArea}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedDate}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumo dos Assistentes */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Resumo da Análise
              </h4>
              <div className="text-xs text-blue-600 space-y-1">
                <p>🤖 {data.metrics.assistantsActive} assistentes especializados ativos</p>
                <p>🏡 {realInsights.length} insights sobre áreas da vida gerados</p>
                <p>📊 {lifeAreasConfig.filter(area => 
                  realInsights.some(insight => belongsToArea(insight, area))
                ).length} de {lifeAreasConfig.length} áreas mapeadas</p>
                {lastUpdate && (
                  <p>⏰ Última análise: {lastUpdate}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
