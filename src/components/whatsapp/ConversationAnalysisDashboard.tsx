
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

  return (
    <PageLayout 
      title="Análise de Conversas do WhatsApp" 
      description="Sistema inteligente de análise comportamental e comercial"
    >
      <div className="space-y-6">
        {/* Status Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Brain className="h-5 w-5" />
              Status da Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{conversations.length}</div>
                <div className="text-sm text-blue-700">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendingConversations.length}</div>
                <div className="text-sm text-yellow-700">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{processingConversations.length}</div>
                <div className="text-sm text-blue-700">Processando</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedConversations.length}</div>
                <div className="text-sm text-green-700">Concluídas</div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-blue-700">
                Última atualização: {lastRefresh.toLocaleTimeString('pt-BR')}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleRefreshAll} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Atualizar
                </Button>
                
                <Button onClick={clearTestData} variant="outline" size="sm" className="text-red-600 border-red-200">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Limpar Teste
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Navegação */}
        <Tabs defaultValue="conversations" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversas ({conversations.length})
            </TabsTrigger>
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Análise Individual
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Métricas
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="space-y-4">
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
                    <p className="text-gray-600">Carregando conversas marcadas...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma conversa marcada</h3>
                    <p className="text-sm mb-4">Vá para o WhatsApp Chat e marque conversas para análise</p>
                    <Button variant="outline" onClick={() => window.location.href = '/dashboard/settings'}>
                      Ir para WhatsApp Chat
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversations.map((conversation) => (
                      <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <MessageSquare className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{conversation.contact_name}</h4>
                                <p className="text-sm text-gray-500">{conversation.contact_phone}</p>
                                <p className="text-xs text-gray-400">
                                  Marcada em: {new Date(conversation.marked_at).toLocaleString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={
                                conversation.priority === 'high' ? 'border-red-200 text-red-700 bg-red-50' :
                                conversation.priority === 'medium' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                                'border-blue-200 text-blue-700 bg-blue-50'
                              }>
                                {conversation.priority}
                              </Badge>
                              
                              <div className="flex items-center gap-1">
                                {getStatusIcon(conversation.analysis_status)}
                                <Badge variant="outline">
                                  {getStatusText(conversation.analysis_status)}
                                </Badge>
                              </div>
                              
                              <Button 
                                onClick={() => setSelectedConversation(conversation.id)}
                                variant="outline" 
                                size="sm"
                              >
                                Analisar
                              </Button>
                            </div>
                          </div>
                          
                          {conversation.last_analyzed_at && (
                            <div className="mt-2 text-xs text-gray-500">
                              Última análise: {new Date(conversation.last_analyzed_at).toLocaleString('pt-BR')}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="individual" className="space-y-4">
            {selectedConversation ? (
              <IndividualConversationAnalysis
                conversation={conversations.find(c => c.id === selectedConversation)!}
                onAnalysisComplete={handleAnalysisComplete}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
                  <p className="text-gray-500">Escolha uma conversa na aba "Conversas" para analisar individualmente</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights">
            <ConversationInsights insights={insights} conversations={conversations} />
          </TabsContent>

          <TabsContent value="metrics">
            <ConversationMetrics protectedStats={protectedStats} />
          </TabsContent>

          <TabsContent value="timeline">
            <ConversationTimeline conversations={conversations} insights={insights} />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
