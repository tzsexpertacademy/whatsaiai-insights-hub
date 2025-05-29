
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle, Bot, Clock, Brain } from 'lucide-react';

export function BehavioralProfile() {
  const { data, isLoading } = useAnalysisData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Perfil Comportamental</h1>
          <p className="text-slate-600">Análise psicológica profunda pelos assistentes especializados</p>
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Perfil Comportamental</h1>
          <p className="text-slate-600">Análise psicológica profunda pelos assistentes especializados</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Perfil comportamental não mapeado</h3>
              <p className="text-gray-500 max-w-md">
                Para criar seu perfil psicológico, os assistentes precisam analisar suas conversas.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Execute a análise por IA no dashboard</p>
                <p>• Os assistentes irão mapear seu comportamento</p>
                <p>• Dados serão atualizados automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrar insights comportamentais e psicológicos dos assistentes
  const behavioralInsights = data.insightsWithAssistant.filter(insight => 
    insight.insight_type === 'behavioral' || insight.assistantArea === 'psicologia' || insight.assistantArea === 'comportamento'
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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Perfil Comportamental</h1>
        <p className="text-slate-600">Análise psicológica pelos assistentes especializados</p>
      </div>

      {/* Indicadores dos assistentes */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          🔮 Análise dos Assistentes
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          📊 {behavioralInsights.length} padrões comportamentais
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traços de personalidade identificados */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Traços de Personalidade
            </CardTitle>
            <CardDescription>Identificados pelos assistentes IA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {behavioralInsights.slice(0, 3).map((insight, index) => (
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

        {/* Padrões comportamentais */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Padrões Comportamentais</CardTitle>
            <CardDescription>Análise baseada nos dados dos assistentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Estilo de Comunicação</h4>
                <p className="text-sm text-blue-700">
                  Sendo analisado pelos assistentes com base nas conversas...
                </p>
                <div className="mt-2 flex items-center">
                  <Bot className="h-3 w-3 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-500">Por assistentes IA</span>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Perfil Emocional</h4>
                <p className="text-sm text-green-700">
                  Estado: {data.emotionalState}
                </p>
                <div className="mt-2 flex items-center">
                  <Bot className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">Por assistentes IA</span>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Consciência Relacional</h4>
                <p className="text-sm text-purple-700">
                  Nível: {data.relationalAwareness}% - Estável
                </p>
                <div className="mt-2 flex items-center">
                  <Bot className="h-3 w-3 text-purple-500 mr-1" />
                  <span className="text-xs text-purple-500">Por assistentes IA</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights comportamentais detalhados */}
      {behavioralInsights.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Análise Comportamental Detalhada</CardTitle>
            <CardDescription>Insights profundos gerados pelos assistentes especializados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {behavioralInsights.map((insight, index) => (
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
