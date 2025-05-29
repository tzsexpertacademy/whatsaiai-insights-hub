
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare, Bot, AlertCircle } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { PageLayout } from '@/components/layout/PageLayout';

export function ObservatoryTimeline() {
  const { data } = useAnalysisData();

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Badge className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
        ⏰ {data.insightsWithAssistant?.length || 0} Eventos
      </Badge>
      <AIAnalysisButton />
    </div>
  );

  if (!data.hasRealData) {
    return (
      <PageLayout
        title="Linha do Tempo"
        description="Histórico completo de insights e análises dos assistentes"
        showBackButton={true}
        headerActions={headerActions}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Linha do Tempo Vazia
            </CardTitle>
            <CardDescription>
              Para visualizar sua linha do tempo, os assistentes precisam gerar insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">• Execute a análise por IA no dashboard</p>
                <p className="text-sm text-gray-600">• Os assistentes irão gerar insights históricos</p>
                <p className="text-sm text-gray-600">• Timeline será construída automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Linha do Tempo"
      description="Histórico completo de insights e análises dos assistentes"
      showBackButton={true}
      headerActions={headerActions}
    >
      <div className="space-y-6">
        {data.insightsWithAssistant?.map((insight, index) => (
          <Card key={insight.id} className="relative">
            {/* Linha conectora */}
            {index < data.insightsWithAssistant.length - 1 && (
              <div className="absolute left-6 top-16 w-0.5 h-12 bg-gray-200" />
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {insight.assistant_type === 'psychologist' ? (
                    <Bot className="h-4 w-4 text-blue-600" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {insight.assistant_name}
                    </Badge>
                  </div>
                  
                  <CardDescription className="mt-1">
                    {new Date(insight.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-gray-700 leading-relaxed">
                {insight.description}
              </p>
              
              {insight.metadata && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Contexto:</strong> {insight.metadata.context || 'Análise geral'}
                  </div>
                  {insight.metadata.confidence && (
                    <div className="text-sm text-gray-600 mt-1">
                      <strong>Confiança:</strong> {insight.metadata.confidence}%
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )) || (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum evento na linha do tempo
              </h3>
              <p className="text-gray-600">
                Execute análises para popular sua linha do tempo histórica
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
