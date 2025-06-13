import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalysisConversations } from '@/hooks/useAnalysisConversations';
import { useProtectedAnalysisData } from '@/hooks/useProtectedAnalysisData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';
import { ConversationInsights } from './ConversationInsights';
import { ConversationMetrics } from './ConversationMetrics';
import { ConversationTimeline } from './ConversationTimeline';
import { IndividualConversationAnalysis } from './IndividualConversationAnalysis';
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
  Star,
  CheckCircle,
  XCircle,
  Bug,
  Trash2,
  Zap
} from 'lucide-react';

export function ConversationAnalysisDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
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

  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const clearTestData = async () => {
    console.log('🧹 LIMPANDO DADOS DE TESTE...');
    
    if (!user?.id) {
      console.error('❌ Usuário não logado para limpeza');
      return;
    }

    try {
      console.log('🗑️ Removendo registros de teste...');
      
      const { data: deletedData, error: deleteError } = await supabase
        .from('whatsapp_conversations_analysis')
        .delete()
        .eq('user_id', user.id)
        .or('chat_id.like.TEST_%,contact_name.like.%Teste%,contact_name.like.%Debug%')
        .select();
      
      console.log('📊 Resultado da limpeza:', { deletedData, deleteError });

      if (deleteError) {
        console.error('❌ Erro na limpeza:', deleteError);
        throw deleteError;
      }

      toast({
        title: "Dados de teste removidos",
        description: `${deletedData?.length || 0} registros de teste foram removidos`,
      });

      setTimeout(() => {
        loadAnalysisConversations();
      }, 1000);

    } catch (error) {
      console.error('❌ ERRO na limpeza de dados de teste:', error);
      toast({
        title: "Erro na limpeza",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const forceReload = async () => {
    console.log('🔄 FORCE RELOAD - Limpando cache e recarregando...');
    setHasInitialized(false);
    loadingRef.current = false;
    
    try {
      await Promise.all([
        loadAnalysisConversations(),
        refreshData()
      ]);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('❌ Erro no force reload:', error);
    }
  };

  useEffect(() => {
    if (!hasInitialized && !loadingRef.current) {
      loadingRef.current = true;
      console.log('🚀 Iniciando carregamento inicial do dashboard...');
      
      const initializeData = async () => {
        try {
          await Promise.all([
            loadAnalysisConversations(),
            refreshData()
          ]);
          setHasInitialized(true);
          setLastRefresh(new Date());
        } catch (error) {
          console.error('❌ Erro na inicialização:', error);
        } finally {
          loadingRef.current = false;
        }
      };

      initializeData();
    }
  }, [hasInitialized, loadAnalysisConversations, refreshData]);

  useEffect(() => {
    if (!hasInitialized) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh do dashboard...');
      loadAnalysisConversations();
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [hasInitialized, loadAnalysisConversations]);

  const handleRefreshAll = async () => {
    if (loadingRef.current) {
      console.log('⏳ Carregamento já em andamento, ignorando refresh');
      return;
    }
    
    loadingRef.current = true;
    console.log('🔄 Atualizando todos os dados...');
    
    try {
      await Promise.all([
        loadAnalysisConversations(),
        refreshData()
      ]);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('❌ Erro no refresh:', error);
    } finally {
      loadingRef.current = false;
    }
  };

  const handleAnalysisComplete = () => {
    console.log('✅ Análise individual concluída, recarregando dados...');
    loadAnalysisConversations();
    setSelectedConversation(null);
  };

  const completedConversations = conversations.filter(c => c.analysis_status === 'completed');
  const pendingConversations = conversations.filter(c => c.analysis_status === 'pending');
  const processingConversations = conversations.filter(c => c.analysis_status === 'processing');
  const failedConversations = conversations.filter(c => c.analysis_status === 'failed');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'processing': return 'Processando';
      case 'failed': return 'Falhou';
      default: return 'Pendente';
    }
  };

  const headerActions = (
    <div className="flex items-center gap-3">
      <Badge variant="outline" className="bg-blue-50">
        <Star className="h-3 w-3 mr-1" />
        {conversations.length} Conversas Reais
      </Badge>
      <Badge variant="outline" className="bg-green-50">
        <TrendingUp className="h-3 w-3 mr-1" />
        {completedConversations.length} Analisadas
      </Badge>
      <Button 
        onClick={clearTestData} 
        variant="outline" 
        size="sm"
        className="border-red-200 text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Limpar Teste
      </Button>
      <Button 
        onClick={forceReload} 
        variant="outline" 
        size="sm"
        className="border-orange-200 text-orange-600 hover:bg-orange-50"
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        Force Reload
      </Button>
      <Button 
        onClick={handleRefreshAll} 
        variant="outline" 
        size="sm" 
        disabled={isLoading || loadingRef.current}
      >
        <RefreshCw className={`h-4 w-4 mr-1 ${(isLoading || loadingRef.current) ? 'animate-spin' : ''}`} />
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
      {/* Status do Sistema */}
      <Card className="mb-4 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs">
              <p><strong>Status:</strong> {conversations.length} conversas REAIS marcadas | {insights.length} insights gerados</p>
              <p><strong>Carregamento:</strong> {isLoading ? 'Em andamento...' : 'Concluído'}</p>
              <p><strong>Última atualização:</strong> {lastRefresh.toLocaleTimeString('pt-BR')}</p>
              {conversations.length === 0 && !isLoading && (
                <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-yellow-700 font-medium">
                    ⚠️ Nenhuma conversa REAL marcada encontrada!
                  </p>
                  <p className="text-yellow-600 text-xs mt-1">
                    Vá ao WhatsApp Mirror, clique com botão direito nas conversas REAIS e marque para análise IA.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
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
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold">{completedConversations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Falharam</p>
                <p className="text-2xl font-bold">{failedConversations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs defaultValue="conversas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="conversas">
            <MessageSquare className="h-4 w-4 mr-2" />
            Conversas ({conversations.length})
          </TabsTrigger>
          <TabsTrigger value="individual">
            <Zap className="h-4 w-4 mr-2" />
            Análise Individual
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
                  Conversas REAIS Marcadas para Análise ({conversations.length})
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
                    <p className="text-lg font-medium">Nenhuma conversa REAL marcada para análise</p>
                    <div className="text-sm mt-2 space-y-1">
                      <p>Para marcar conversas REAIS:</p>
                      <p>1. Vá para o WhatsApp Mirror</p>
                      <p>2. Clique com botão direito nas conversas REAIS</p>
                      <p>3. Selecione "Marcar para análise IA"</p>
                    </div>
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
                          <div className="flex items-center gap-1">
                            {getStatusIcon(conv.analysis_status)}
                            <Badge 
                              variant={
                                conv.analysis_status === 'completed' ? 'default' :
                                conv.analysis_status === 'processing' ? 'secondary' :
                                conv.analysis_status === 'failed' ? 'destructive' : 
                                'outline'
                              }
                            >
                              {getStatusText(conv.analysis_status)}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedConversation(conv.id)}
                          >
                            <Zap className="h-4 w-4 mr-1" />
                            Analisar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="individual">
          <div className="space-y-4">
            {selectedConversation ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                  >
                    ← Voltar à lista
                  </Button>
                </div>
                <IndividualConversationAnalysis
                  conversation={conversations.find(c => c.id === selectedConversation)!}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Análise Individual de Conversas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {conversations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Nenhuma conversa disponível para análise</p>
                      <p className="text-sm mt-1">Marque conversas no WhatsApp Mirror primeiro</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-gray-600 mb-4">
                        Selecione uma conversa abaixo para fazer análise individual detalhada:
                      </p>
                      <div className="grid gap-3">
                        {conversations.map((conv) => (
                          <Card key={conv.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedConversation(conv.id)}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{conv.contact_name}</h4>
                                  <p className="text-sm text-gray-500">{conv.contact_phone}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {conv.priority}
                                    </Badge>
                                    {getStatusIcon(conv.analysis_status)}
                                    <span className="text-xs text-gray-500">
                                      {getStatusText(conv.analysis_status)}
                                    </span>
                                  </div>
                                </div>
                                <Button size="sm">
                                  <Zap className="h-4 w-4 mr-1" />
                                  Analisar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
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
