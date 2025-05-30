
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, AlertCircle, Bot, TrendingUp, Heart, User, Clock, Zap } from 'lucide-react';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';

export function BehavioralProfile() {
  const { user } = useAuth();
  const { data, isLoading } = useAnalysisData();
  
  console.log('🧠 BehavioralProfile - Dados disponíveis:', {
    hasRealData: data.hasRealData,
    psychologicalProfile: data.psychologicalProfile,
    insightsWithAssistant: data.insightsWithAssistant?.length || 0,
    assistantsActive: data.metrics.assistantsActive,
    lastAnalysis: data.metrics.lastAnalysis
  });

  // Formatação da data da última análise
  const lastUpdate = data.metrics.lastAnalysis ? 
    new Date(data.metrics.lastAnalysis).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : null;

  // Filtrar insights psicológicos e comportamentais REAIS dos assistentes
  const psychologyInsights = data.insightsWithAssistant?.filter(insight => 
    insight.insight_type === 'psychological' || 
    insight.insight_type === 'psicologia' ||
    insight.assistantArea === 'psicologia' ||
    insight.category === 'psicologia' ||
    insight.assistantName?.toLowerCase().includes('oráculo') ||
    insight.description?.toLowerCase().includes('psicológic') ||
    insight.description?.toLowerCase().includes('comportament')
  ) || [];

  const emotionalInsights = data.insightsWithAssistant?.filter(insight => 
    insight.insight_type === 'emotional' || 
    insight.insight_type === 'emocional' ||
    insight.assistantArea === 'emocional' ||
    insight.category === 'emotional' ||
    insight.description?.toLowerCase().includes('emocion') ||
    insight.description?.toLowerCase().includes('sentiment')
  ) || [];

  const behavioralInsights = data.insightsWithAssistant?.filter(insight => 
    insight.insight_type === 'behavioral' || 
    insight.insight_type === 'comportamental' ||
    insight.description?.toLowerCase().includes('comportament') ||
    insight.description?.toLowerCase().includes('padrão')
  ) || [];

  const allPsychInsights = [...psychologyInsights, ...emotionalInsights, ...behavioralInsights];

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Badge className="bg-purple-100 text-purple-800 text-xs sm:text-sm">
        🧠 Perfil Comportamental
      </Badge>
      {data.hasRealData && (
        <>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
            📊 {allPsychInsights.length} insights
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

  if (isLoading) {
    return (
      <PageLayout
        title="Perfil Comportamental"
        description="Análise psicológica profunda pelos assistentes especializados"
        showBackButton={true}
        headerActions={headerActions}
      >
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </PageLayout>
    );
  }

  if (!data.hasRealData || allPsychInsights.length === 0) {
    return (
      <PageLayout
        title="Perfil Comportamental"
        description="Análise psicológica profunda pelos assistentes especializados"
        showBackButton={true}
        headerActions={headerActions}
      >
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              Perfil Comportamental Não Mapeado
            </CardTitle>
            <CardDescription className="text-orange-600">
              Para criar seu perfil psicológico, os assistentes precisam analisar suas conversas.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Brain className="h-16 w-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-orange-700 mb-2">
              Análise Pendente
            </h3>
            <p className="text-sm text-orange-600 mb-4">
              Execute a análise por IA no dashboard para gerar seu perfil comportamental.
            </p>
            <div className="text-xs text-orange-600 space-y-1 text-left max-w-sm mx-auto">
              <p>• Execute a análise por IA no dashboard</p>
              <p>• Os assistentes irão mapear seu comportamento</p>
              <p>• Dados serão atualizados automaticamente</p>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Perfil Comportamental"
      description="Análise psicológica profunda pelos assistentes especializados"
      showBackButton={true}
      headerActions={headerActions}
    >
      {/* Resumo do perfil */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Análise Comportamental Ativa
          </CardTitle>
          <CardDescription>
            Perfil psicológico baseado em {allPsychInsights.length} insights dos assistentes especializados
            {lastUpdate && ` • Última análise: ${lastUpdate}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-red-100">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{emotionalInsights.length}</div>
              <div className="text-sm text-gray-600">Insights Emocionais</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
              <User className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{behavioralInsights.length}</div>
              <div className="text-sm text-gray-600">Padrões Comportamentais</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-purple-100">
              <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{psychologyInsights.length}</div>
              <div className="text-sm text-gray-600">Análises Psicológicas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights por categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights Emocionais */}
        {emotionalInsights.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Heart className="h-5 w-5" />
                Aspectos Emocionais
              </CardTitle>
              <CardDescription>Análise emocional pelos assistentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emotionalInsights.slice(0, 3).map((insight) => {
                  const createdAt = new Date(insight.createdAt);
                  const formattedDate = createdAt.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div key={insight.id} className="border border-red-200 rounded-lg p-3 bg-gradient-to-r from-red-50 to-pink-50">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-red-800 text-sm">{insight.title}</h4>
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          {insight.assistantName}
                        </Badge>
                      </div>
                      <p className="text-xs text-red-700 mb-2">{insight.description.substring(0, 120)}...</p>
                      <div className="flex items-center justify-between text-xs text-red-600">
                        <div className="flex items-center gap-1">
                          <Bot className="h-3 w-3" />
                          <span>{insight.assistantArea}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insights Comportamentais */}
        {behavioralInsights.length > 0 && (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <User className="h-5 w-5" />
                Padrões Comportamentais
              </CardTitle>
              <CardDescription>Análise de comportamentos pelos assistentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {behavioralInsights.slice(0, 3).map((insight) => {
                  const createdAt = new Date(insight.createdAt);
                  const formattedDate = createdAt.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div key={insight.id} className="border border-blue-200 rounded-lg p-3 bg-gradient-to-r from-blue-50 to-cyan-50">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-blue-800 text-sm">{insight.title}</h4>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {insight.assistantName}
                        </Badge>
                      </div>
                      <p className="text-xs text-blue-700 mb-2">{insight.description.substring(0, 120)}...</p>
                      <div className="flex items-center justify-between text-xs text-blue-600">
                        <div className="flex items-center gap-1">
                          <Bot className="h-3 w-3" />
                          <span>{insight.assistantArea}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Análise Psicológica Completa */}
      {psychologyInsights.length > 0 && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Brain className="h-5 w-5" />
              Análise Psicológica Profunda
            </CardTitle>
            <CardDescription>Insights psicológicos detalhados gerados pelos assistentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {psychologyInsights.slice(0, 4).map((insight) => {
                const createdAt = new Date(insight.createdAt);
                const formattedDate = createdAt.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={insight.id} className="border border-purple-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-purple-800">{insight.title}</h4>
                      <div className="flex gap-2">
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
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
                    <p className="text-sm text-purple-700 mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between text-xs text-purple-600 pt-2 border-t border-purple-200">
                      <div className="flex items-center gap-1">
                        <Bot className="h-3 w-3" />
                        <span>Área: {insight.assistantArea}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo da Análise */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Resumo da Análise Comportamental
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-blue-600 space-y-1">
            <p>🤖 {data.metrics.assistantsActive} assistentes especializados ativos</p>
            <p>🧠 {allPsychInsights.length} insights psicológicos e comportamentais gerados</p>
            <p>💭 {emotionalInsights.length} análises emocionais • {behavioralInsights.length} padrões comportamentais • {psychologyInsights.length} insights psicológicos</p>
            {lastUpdate && (
              <p>⏰ Última análise: {lastUpdate}</p>
            )}
            <p>📊 Análise baseada em dados reais dos assistentes IA</p>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
