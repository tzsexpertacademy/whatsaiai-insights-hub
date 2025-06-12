
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalysisConversations } from '@/hooks/useAnalysisConversations';
import { useProtectedAnalysisData } from '@/hooks/useProtectedAnalysisData';
import { PageLayout } from '@/components/layout/PageLayout';
import { ConversationInsights } from './ConversationInsights';
import { ConversationMetrics } from './ConversationMetrics';
import { ConversationTimeline } from './ConversationTimeline';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { 
  Brain,
  MessageSquare,
  TrendingUp,
  Clock,
  Users,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  Star
} from 'lucide-react';

export function ConversationAnalysisDashboard() {
  const { 
    conversations, 
    isLoading, 
    loadAnalysisConversations 
  } = useAnalysisConversations();
  
  const { 
    insights, 
    protectedStats,
    refreshData 
  } = useProtectedAnalysisData();

  // Log para debugging
  console.log('=== ConversationAnalysisDashboard Debug ===');
  console.log('Conversas carregadas:', conversations);
  console.log('Total de conversas:', conversations.length);
  console.log('Insights carregados:', insights);
  console.log('Stats protegidas:', protectedStats);
  console.log('Loading state:', isLoading);

  useEffect(() => {
    console.log('🚀 Iniciando carregamento do dashboard...');
    loadAnalysisConversations();
    refreshData();
  }, [loadAnalysisConversations, refreshData]);

  const handleRefreshAll = async () => {
    console.log('🔄 Atualizando todos os dados...');
    await loadAnalysisConversations();
    await refreshData();
  };

  const completedConversations = conversations.filter(c => c.analysis_status === 'completed');
  const pendingConversations = conversations.filter(c => c.analysis_status === 'pending');
  const processingConversations = conversations.filter(c => c.analysis_status === 'processing');

  const headerActions = (
    <div className="flex items-center gap-3">
      <Badge variant="outline" className="bg-blue-50">
        <Star className="h-3 w-3 mr-1" />
        {conversations.length} Conversas Marcadas
      </Badge>
      <Badge variant="outline" className="bg-green-50">
        <TrendingUp className="h-3 w-3 mr-1" />
        {completedConversations.length} Analisadas
      </Badge>
      <Button onClick={handleRefreshAll} variant="outline" size="sm" disabled={isLoading}>
        <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
        Atualizar
      </Button>
      <AIAnalysisButton />
    </div>
  );

  return (
    <PageLayout
      title="Análise de Conversas WhatsApp"
      description="Dashboard especializado para análise das conversas marcadas pelos assistentes de IA"
      showBackButton={true}
      backUrl="/dashboard/behavioral"
      headerActions={headerActions}
    >
      {/* Debug Info - Mostrar sempre em desenvolvimento */}
      <Card className="mb-4 bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-xs">
              <p><strong>Status do Sistema:</strong></p>
              <p>Conversas Marcadas: {conversations.length} | Insights: {insights.length}</p>
              <p>Loading: {isLoading ? 'Carregando...' : 'Concluído'}</p>
              <p>Última atualização: {new Date().toLocaleTimeString()}</p>
              {conversations.length === 0 && !isLoading && (
                <p className="text-red-600 font-medium">⚠️ Nenhuma conversa marcada encontrada no banco!</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Conversas</p>
                <p className="text-2xl font-bold">{conversations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold">{pendingConversations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Processando</p>
                <p className="text-2xl font-bold">{processingConversations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold">{completedConversations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs defaultValue="conversas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversas">
            <MessageSquare className="h-4 w-4 mr-2" />
            Conversas ({conversations.length})
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Brain className="h-4 w-4 mr-2" />
            Insights ({insights.length})
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Métricas
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversas">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Conversas Marcadas para Análise ({conversations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-500" />
                    <p>Carregando conversas marcadas...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Nenhuma conversa marcada para análise</p>
                    <p className="text-sm mt-2">Vá para o WhatsApp Mirror e marque conversas para análise</p>
                    <Button 
                      onClick={handleRefreshAll} 
                      variant="outline" 
                      className="mt-4"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tentar Carregar Novamente
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversations.map((conv) => (
                      <div key={conv.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{conv.contact_name}</h3>
                            <Badge variant="outline" className="text-xs">
                              ID: {conv.chat_id}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{conv.contact_phone}</p>
                          <p className="text-xs text-gray-400">
                            Marcada em: {new Date(conv.marked_at).toLocaleString('pt-BR')}
                          </p>
                          {conv.last_analyzed_at && (
                            <p className="text-xs text-green-600">
                              Última análise: {new Date(conv.last_analyzed_at).toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`capitalize ${
                              conv.priority === 'high' ? 'border-red-200 text-red-700 bg-red-50' :
                              conv.priority === 'medium' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                              'border-blue-200 text-blue-700 bg-blue-50'
                            }`}
                          >
                            {conv.priority}
                          </Badge>
                          <Badge 
                            variant={
                              conv.analysis_status === 'completed' ? 'default' :
                              conv.analysis_status === 'processing' ? 'secondary' :
                              conv.analysis_status === 'failed' ? 'destructive' : 
                              'outline'
                            }
                          >
                            {conv.analysis_status === 'pending' ? 'Pendente' :
                             conv.analysis_status === 'processing' ? 'Processando' :
                             conv.analysis_status === 'completed' ? 'Concluída' :
                             'Falhou'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <ConversationInsights 
            insights={insights}
            conversations={completedConversations}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <ConversationMetrics 
            conversations={conversations}
            insights={insights}
            protectedStats={protectedStats}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <ConversationTimeline 
            conversations={conversations}
            insights={insights}
          />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
