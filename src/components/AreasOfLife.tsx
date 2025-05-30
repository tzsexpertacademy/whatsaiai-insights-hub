
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle, Bot, Clock } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { responsiveContainerClasses, responsiveCardClasses, combineResponsiveClasses } from '@/utils/responsiveUtils';

export function AreasOfLife() {
  const { data, isLoading } = useAnalysisData();

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

  if (!data.hasRealData) {
    return (
      <PageLayout
        title="Áreas da Vida"
        description="Mapeamento completo das suas dimensões de vida pelos assistentes"
        showBackButton={true}
      >
        <Card className={responsiveCardClasses.base}>
          <CardContent className={combineResponsiveClasses(
            responsiveCardClasses.padding,
            "text-center"
          )}>
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
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

  // Filtrar insights por área de vida dos assistentes REAIS
  const lifeAreasInsights = data.insightsWithAssistant.filter(insight => 
    insight.assistantArea && 
    ['relacionamentos', 'carreira', 'saude', 'familia', 'financas', 'desenvolvimento', 'criatividade', 'proposito'].includes(insight.assistantArea.toLowerCase())
  );

  const lastUpdate = data.metrics.lastAnalysis ? 
    new Date(data.metrics.lastAnalysis).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : null;

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
        🔮 Análise dos Assistentes
      </Badge>
      <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
        📊 {lifeAreasInsights.length} áreas identificadas
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
    </div>
  );

  return (
    <PageLayout
      title="Áreas da Vida"
      description="Mapeamento completo das suas dimensões de vida pelos assistentes"
      showBackButton={true}
      headerActions={headerActions}
    >
      <div className={responsiveContainerClasses.grid.threeColumns}>
        {/* Áreas mapeadas PELOS ASSISTENTES REAIS */}
        {['Relacionamentos', 'Carreira', 'Saúde', 'Família', 'Finanças', 'Desenvolvimento'].map((area, index) => {
          const areaInsights = lifeAreasInsights.filter(insight => 
            insight.assistantArea?.toLowerCase().includes(area.toLowerCase()) ||
            insight.description?.toLowerCase().includes(area.toLowerCase()) ||
            insight.title?.toLowerCase().includes(area.toLowerCase())
          );
          
          return (
            <Card key={area} className={responsiveCardClasses.base}>
              <CardHeader className={responsiveCardClasses.header}>
                <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm sm:text-base">{area}</span>
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    {areaInsights.length} insights
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Análise por assistentes IA</CardDescription>
              </CardHeader>
              <CardContent className={responsiveCardClasses.content}>
                {areaInsights.length > 0 ? (
                  <div className="space-y-3">
                    {areaInsights.slice(0, 2).map((insight, idx) => (
                      <div key={idx} className="border rounded-lg p-3 bg-gradient-to-r from-purple-50 to-blue-50">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className="text-xs sm:text-sm font-medium text-slate-800 truncate">{insight.title}</span>
                          <Badge className="bg-purple-100 text-purple-800 text-xs flex-shrink-0">
                            {insight.assistantName}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-3">{insight.description.substring(0, 80)}...</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500">Aguardando análise dos assistentes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights detalhados das áreas REAIS */}
      {lifeAreasInsights.length > 0 && (
        <Card className={responsiveCardClasses.base}>
          <CardHeader className={responsiveCardClasses.header}>
            <CardTitle className="text-lg sm:text-xl">Insights Detalhados das Áreas da Vida</CardTitle>
            <CardDescription className="text-sm">Análise completa pelos assistentes especializados</CardDescription>
          </CardHeader>
          <CardContent className={responsiveCardClasses.content}>
            <div className="space-y-4">
              {lifeAreasInsights.slice(0, 5).map((insight, index) => (
                <div key={insight.id} className="border rounded-lg p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-blue-50">
                  <div className="flex items-start justify-between mb-2 gap-3">
                    <h4 className="font-medium text-slate-800 text-sm sm:text-base flex-1">{insight.title}</h4>
                    <Badge className="bg-purple-100 text-purple-800 text-xs flex-shrink-0">
                      🔮 {insight.assistantName}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-3 leading-relaxed">{insight.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500 gap-2">
                    <span className="truncate">Área: {insight.assistantArea}</span>
                    <span className="flex-shrink-0">{new Date(insight.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
