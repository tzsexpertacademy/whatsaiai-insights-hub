
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle, Bot, Clock } from 'lucide-react';

export function AreasOfLife() {
  const { data, isLoading } = useAnalysisData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Áreas da Vida</h1>
          <p className="text-slate-600">Mapeamento completo das suas dimensões de vida pelos assistentes</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (!data.hasRealData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Áreas da Vida</h1>
          <p className="text-slate-600">Mapeamento completo das suas dimensões de vida pelos assistentes</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Mapa das áreas ainda não criado</h3>
              <p className="text-gray-500 max-w-md">
                Para mapear suas áreas da vida, os assistentes precisam analisar suas conversas.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Execute a análise por IA no dashboard</p>
                <p>• Os assistentes irão mapear suas áreas de vida</p>
                <p>• Dados serão atualizados automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrar insights por área de vida dos assistentes
  const lifeAreasInsights = data.insightsWithAssistant.filter(insight => 
    insight.assistantArea && ['relacionamentos', 'carreira', 'saude', 'familia', 'financas'].includes(insight.assistantArea.toLowerCase())
  );

  const lastUpdate = data.metrics.lastAnalysis ? 
    new Date(data.metrics.lastAnalysis).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Áreas da Vida</h1>
        <p className="text-slate-600">Mapeamento completo das suas dimensões de vida pelos assistentes</p>
      </div>

      {/* Indicadores dos assistentes */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          🔮 Análise dos Assistentes
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          📊 {lifeAreasInsights.length} áreas identificadas
        </Badge>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          🤖 {data.metrics.assistantsActive} assistentes ativos
        </Badge>
        {lastUpdate && (
          <Badge variant="outline" className="bg-gray-50 text-gray-700">
            <Clock className="h-3 w-3 mr-1" />
            Última análise: {lastUpdate}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Áreas principais mapeadas pelos assistentes */}
        {['Relacionamentos', 'Carreira', 'Saúde', 'Família', 'Finanças', 'Desenvolvimento'].map((area, index) => {
          const areaInsights = lifeAreasInsights.filter(insight => 
            insight.assistantArea?.toLowerCase().includes(area.toLowerCase())
          );
          
          return (
            <Card key={area} className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {area}
                  <Badge className="bg-purple-100 text-purple-800">
                    {areaInsights.length} insights
                  </Badge>
                </CardTitle>
                <CardDescription>Análise por assistentes IA</CardDescription>
              </CardHeader>
              <CardContent>
                {areaInsights.length > 0 ? (
                  <div className="space-y-3">
                    {areaInsights.slice(0, 2).map((insight, idx) => (
                      <div key={idx} className="border rounded-lg p-3 bg-gradient-to-r from-purple-50 to-blue-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-800">{insight.title}</span>
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            {insight.assistantName}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">{insight.description.substring(0, 80)}...</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Bot className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Aguardando análise dos assistentes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights detalhados das áreas */}
      {lifeAreasInsights.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Insights Detalhados das Áreas da Vida</CardTitle>
            <CardDescription>Análise completa pelos assistentes especializados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lifeAreasInsights.slice(0, 5).map((insight, index) => (
                <div key={insight.id} className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-800">{insight.title}</h4>
                    <Badge className="bg-purple-100 text-purple-800">
                      🔮 {insight.assistantName}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Área: {insight.assistantArea}</span>
                    <span>{new Date(insight.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
