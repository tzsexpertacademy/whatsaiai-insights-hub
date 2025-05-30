
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, AlertCircle, Bot, TrendingUp, Zap, Heart, User } from 'lucide-react';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';

export function BehavioralProfile() {
  const { user } = useAuth();
  const { data, isLoading } = useAnalysisData();
  
  console.log('🧠 BehavioralProfile - Dados disponíveis:', {
    hasRealData: data.hasRealData,
    psychologicalProfile: data.psychologicalProfile,
    insightsWithAssistant: data.insightsWithAssistant?.length || 0
  });

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Badge className="bg-purple-100 text-purple-800 text-xs sm:text-sm">
        🧠 Análise Psicológica
      </Badge>
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

  if (!data.hasRealData) {
    return (
      <PageLayout
        title="Perfil Comportamental"
        description="Análise psicológica profunda pelos assistentes especializados"
        showBackButton={true}
        headerActions={headerActions}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Perfil comportamental não mapeado
            </CardTitle>
            <CardDescription>
              Para criar seu perfil psicológico, os assistentes precisam analisar suas conversas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">• Execute a análise por IA no dashboard</p>
                <p className="text-sm text-gray-600">• Os assistentes irão mapear seu comportamento</p>
                <p className="text-sm text-gray-600">• Dados serão atualizados automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // Filtrar insights psicológicos e comportamentais REAIS dos assistentes
  const psychologyInsights = data.insightsWithAssistant.filter(insight => 
    insight.insight_type === 'psychological' || 
    insight.insight_type === 'psicologia' ||
    insight.assistantArea === 'psicologia' ||
    insight.category === 'psicologia' ||
    insight.assistantName?.toLowerCase().includes('oráculo') ||
    insight.description?.toLowerCase().includes('psicológic') ||
    insight.description?.toLowerCase().includes('comportament')
  );

  const emotionalInsights = data.insightsWithAssistant.filter(insight => 
    insight.insight_type === 'emotional' || 
    insight.insight_type === 'emocional' ||
    insight.assistantArea === 'emocional' ||
    insight.category === 'emotional' ||
    insight.description?.toLowerCase().includes('emocion') ||
    insight.description?.toLowerCase().includes('sentiment')
  );

  const behavioralInsights = data.insightsWithAssistant.filter(insight => 
    insight.insight_type === 'behavioral' || 
    insight.insight_type === 'comportamental' ||
    insight.description?.toLowerCase().includes('comportament') ||
    insight.description?.toLowerCase().includes('padrão')
  );

  const allPsychInsights = [...psychologyInsights, ...emotionalInsights, ...behavioralInsights];

  return (
    <PageLayout
      title="Perfil Comportamental"
      description="Análise psicológica profunda pelos assistentes especializados"
      showBackButton={true}
      headerActions={headerActions}
    >
      {allPsychInsights.length > 0 ? (
        <div className="space-y-6">
          {/* Resumo do perfil */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Análise Comportamental Ativa
              </CardTitle>
              <CardDescription>
                Perfil psicológico baseado em {allPsychInsights.length} insights dos assistentes especializados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{emotionalInsights.length}</div>
                  <div className="text-sm text-gray-600">Insights Emocionais</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <User className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{behavioralInsights.length}</div>
                  <div className="text-sm text-gray-600">Padrões Comportamentais</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <Heart className="h-5 w-5" />
                    Aspectos Emocionais
                  </CardTitle>
                  <CardDescription>Análise emocional pelos assistentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {emotionalInsights.slice(0, 3).map((insight, index) => (
                      <div key={insight.id} className="border border-red-200 rounded-lg p-3 bg-gradient-to-r from-red-50 to-pink-50">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-red-800 text-sm">{insight.title}</h4>
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            {insight.assistantName}
                          </Badge>
                        </div>
                        <p className="text-xs text-red-700">{insight.description.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Insights Comportamentais */}
            {behavioralInsights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <User className="h-5 w-5" />
                    Padrões Comportamentais
                  </CardTitle>
                  <CardDescription>Análise de comportamentos pelos assistentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {behavioralInsights.slice(0, 3).map((insight, index) => (
                      <div key={insight.id} className="border border-blue-200 rounded-lg p-3 bg-gradient-to-r from-blue-50 to-cyan-50">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-blue-800 text-sm">{insight.title}</h4>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {insight.assistantName}
                          </Badge>
                        </div>
                        <p className="text-xs text-blue-700">{insight.description.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Todos os insights psicológicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Análise Psicológica Completa
              </CardTitle>
              <CardDescription>Todos os insights psicológicos gerados pelos assistentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allPsychInsights.map((insight, index) => (
                  <div key={insight.id} className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-800">{insight.title}</h4>
                      <div className="flex gap-2">
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
                          {insight.assistantName}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-800 text-xs">
                          {insight.insight_type}
                        </Badge>
                      </div>
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
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-gray-500" />
              Processando Análise Comportamental
            </CardTitle>
            <CardDescription>
              Os assistentes estão analisando seus padrões de comportamento
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Aguarde enquanto processamos sua análise...</p>
            <div className="mt-4">
              <AIAnalysisButton />
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
