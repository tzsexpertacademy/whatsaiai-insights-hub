
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle, Brain, Heart, Bot, Lightbulb } from 'lucide-react';

export function Recommendations() {
  const { data, isLoading } = useAnalysisData();

  const getAssistantIcon = (area: string) => {
    const iconMap: { [key: string]: string } = {
      'psicologia': '🔮',
      'financeiro': '💰',
      'saude': '⚡',
      'estrategia': '🎯',
      'proposito': '🌟',
      'criatividade': '🎨',
      'relacionamentos': '👥'
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
      'relacionamentos': 'bg-indigo-100 text-indigo-800'
    };
    return colorMap[area] || 'bg-gray-100 text-gray-800';
  };

  console.log('💡 Recommendations Page - Dados dos assistentes:', {
    hasRealData: data.hasRealData,
    recommendationsWithAssistant: data.recommendationsWithAssistant?.length || 0,
    assistantsActive: data.metrics.assistantsActive,
    assistantsUsed: data.recommendationsWithAssistant?.map(r => r.assistantName).filter(Boolean)
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Conselhos e Recomendações</h1>
          <p className="text-slate-600">Sugestões personalizadas baseadas na análise dos assistentes</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (!data.hasRealData || data.recommendationsWithAssistant.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Conselhos e Recomendações</h1>
          <p className="text-slate-600">Sugestões personalizadas baseadas na análise dos assistentes</p>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="bg-gray-50 text-gray-700">
            🤖 {data.metrics.assistantsActive} Assistentes Configurados
          </Badge>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <Bot className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Assistentes Aguardando Análise</h3>
              <p className="text-gray-500 max-w-md">
                Seus assistentes estão prontos para gerar recomendações personalizadas baseadas em suas conversas e padrões.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Execute a análise por IA no dashboard</p>
                <p>• Os assistentes irão processar seus dados</p>
                <p>• Recomendações personalizadas serão geradas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-500 text-white border-0">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Seus Assistentes Especializados</h3>
            <p className="mb-6">
              Cada assistente analisa aspectos específicos do seu comportamento para gerar recomendações únicas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🔮 Oráculo das Sombras</h4>
                <p className="text-sm">Analisa aspectos psicológicos profundos e sugere práticas de autoconhecimento</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <h4 className="font-semibold mb-2">💰 Guardião dos Recursos</h4>
                <p className="text-sm">Oferece conselhos sobre gestão financeira e organização pessoal</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <h4 className="font-semibold mb-2">⚡ Engenheiro do Corpo</h4>
                <p className="text-sm">Sugere melhorias em saúde física e bem-estar</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <h4 className="font-semibold mb-2">👥 Espelho Social</h4>
                <p className="text-sm">Ajuda a melhorar relacionamentos e habilidades sociais</p>
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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Conselhos e Recomendações</h1>
        <p className="text-slate-600">Sugestões personalizadas baseadas na análise dos assistentes especializados</p>
      </div>

      {/* Indicadores dos assistentes ativos */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          🔮 Assistentes da Plataforma
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          📊 {data.recommendationsWithAssistant.length} Recomendações Geradas
        </Badge>
        {[...new Set(data.recommendationsWithAssistant?.map(r => r.assistantName).filter(Boolean))]
          .slice(0, 3).map((assistantName, index) => {
            const assistantArea = data.recommendationsWithAssistant?.find(r => r.assistantName === assistantName)?.assistantArea;
            return (
              <Badge key={index} className={getAssistantColor(assistantArea || 'geral')}>
                {getAssistantIcon(assistantArea || 'geral')} {assistantName}
              </Badge>
            );
          })}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {data.recommendationsWithAssistant.map((recommendation, index) => (
          <Card key={index} className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>{recommendation.title || `Recomendação ${index + 1}`}</CardTitle>
                    <CardDescription>
                      {recommendation.assistantName ? 
                        `Gerada pelo assistente: ${recommendation.assistantName}` : 
                        'Baseada na análise dos assistentes'
                      }
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {recommendation.assistantName && (
                    <Badge className={getAssistantColor(recommendation.assistantArea || 'geral')}>
                      {getAssistantIcon(recommendation.assistantArea || 'geral')} {recommendation.assistantName}
                    </Badge>
                  )}
                  <Badge variant="outline">Personalizada</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">{recommendation.text || recommendation.description}</p>
              
              {/* Informações do assistente */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Bot className="h-4 w-4" />
                  <span className="font-medium">Assistente:</span>
                  <span>{recommendation.assistantName || 'Sistema'}</span>
                  {recommendation.assistantArea && (
                    <>
                      <span className="mx-2">•</span>
                      <span>Área: {recommendation.assistantArea}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  Implementar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.recommendationsWithAssistant.length > 0 && (
        <Card className="bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-500 text-white border-0">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Próxima Análise</h3>
            <p className="mb-6">
              Continue criando conversas e executando análises para receber novas recomendações personalizadas dos seus assistentes.
            </p>
            <Button size="lg" className="w-full bg-white text-blue-700 hover:bg-slate-100">
              <Heart className="mr-2 h-5 w-5" />
              Executar Nova Análise por IA
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
