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
import { useNavigate } from 'react-router-dom';
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
  Star,
  CheckCircle,
  XCircle,
  Bug,
  Trash2,
  Eye,
  ArrowRight
} from 'lucide-react';

export function ConversationAnalysisDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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
  const loadingRef = useRef(false);

  // Limpar dados de teste do banco
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

      // Recarregar após limpeza
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

  // Debug específico da QUERY (SEM DADOS DE TESTE)
  const testRealConversationsQuery = async () => {
    console.log('🔧 TESTE ESPECÍFICO DA QUERY (CONVERSAS REAIS)...');
    
    if (!user?.id) {
      console.error('❌ Usuário não logado para teste');
      return;
    }

    try {
      console.log('🎯 Testando query de conversas REAIS...');
      
      // Teste query de conversas REAIS marcadas
      const { data: realMarked, error: realError } = await supabase
        .from('whatsapp_conversations_analysis')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('marked_for_analysis', true)
        .not('chat_id', 'like', 'TEST_%')
        .not('contact_name', 'like', '%Teste%')
        .not('contact_name', 'like', '%Debug%');
      
      console.log('📊 Conversas REAIS marcadas:', { 
        realMarked, 
        realError,
        count: realMarked?.length || 0
      });

      // Teste todas as conversas do usuário (incluindo teste)
      const { data: allData, error: allError } = await supabase
        .from('whatsapp_conversations_analysis')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('📊 TODAS as conversas do usuário:', { 
        allData, 
        allError,
        totalCount: allData?.length || 0,
        testCount: allData?.filter(item => 
          item.chat_id?.includes('TEST_') || 
          item.contact_name?.includes('Teste') || 
          item.contact_name?.includes('Debug')
        )?.length || 0,
        realCount: allData?.filter(item => 
          !item.chat_id?.includes('TEST_') && 
          !item.contact_name?.includes('Teste') && 
          !item.contact_name?.includes('Debug')
        )?.length || 0
      });

      toast({
        title: "Debug Conversas Reais",
        description: `Reais marcadas: ${realMarked?.length || 0} | Total: ${allData?.length || 0}`,
      });

    } catch (error) {
      console.error('❌ ERRO no teste de conversas reais:', error);
      toast({
        title: "Erro no Debug",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Debug específico da QUERY
  const testSpecificQuery = async () => {
    console.log('🔧 TESTE ESPECÍFICO DA QUERY...');
    
    if (!user?.id) {
      console.error('❌ Usuário não logado para teste');
      return;
    }

    try {
      console.log('🎯 Testando query EXATA que deveria funcionar...');
      
      // Teste EXATO da query usada no hook
      const { data: queryData, error: queryError, count } = await supabase
        .from('whatsapp_conversations_analysis')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('marked_for_analysis', true)
        .order('created_at', { ascending: false });
      
      console.log('📊 Resultado da query EXATA:', { 
        queryData, 
        queryError, 
        count,
        length: queryData?.length || 0 
      });

      // Teste sem filtro de marked_for_analysis
      const { data: allMarked, error: allError } = await supabase
        .from('whatsapp_conversations_analysis')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('📊 TODOS os registros do usuário:', { 
        allMarked, 
        allError,
        totalCount: allMarked?.length || 0,
        markedTrue: allMarked?.filter(item => item.marked_for_analysis === true)?.length || 0,
        markedFalse: allMarked?.filter(item => item.marked_for_analysis === false)?.length || 0
      });

      toast({
        title: "Debug Query Executado",
        description: `Query: ${queryData?.length || 0} resultados | Total: ${allMarked?.length || 0} registros`,
      });

    } catch (error) {
      console.error('❌ ERRO no teste da query:', error);
      toast({
        title: "Erro no Debug Query",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Debug direto no banco - CORRIGIDO
  const testDatabaseConnection = async () => {
    console.log('🔧 TESTE DIRETO NO BANCO...');
    
    if (!user?.id) {
      console.error('❌ Usuário não logado para teste');
      toast({
        title: "Erro",
        description: "Usuário não logado",
        variant: "destructive"
      });
      return;
    }

    try {
      // Teste 1: Verificar se a tabela existe (CORRIGIDO)
      console.log('🔍 Teste 1: Verificando tabela...');
      const { data: tableTest, error: tableError } = await supabase
        .from('whatsapp_conversations_analysis')
        .select('id')
        .limit(1);
      
      console.log('📊 Resultado teste tabela:', { tableTest, tableError });

      // Teste 2: Buscar TODOS os registros do usuário
      console.log('🔍 Teste 2: Buscando TODOS registros do usuário...');
      const { data: allUserData, error: allUserError } = await supabase
        .from('whatsapp_conversations_analysis')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('📊 Resultado TODOS registros:', { allUserData, allUserError });

      // Teste 3: Buscar apenas marcados
      console.log('🔍 Teste 3: Buscando apenas marcados...');
      const { data: markedData, error: markedError } = await supabase
        .from('whatsapp_conversations_analysis')
        .select('*')
        .eq('user_id', user.id)
        .eq('marked_for_analysis', true);
      
      console.log('📊 Resultado marcados:', { markedData, markedError });

      // Teste 4: Verificar políticas RLS
      console.log('🔍 Teste 4: Testando RLS...');
      const { data: rlsTest, error: rlsError } = await supabase
        .from('whatsapp_conversations_analysis')
        .select('*');
      
      console.log('📊 Resultado RLS (sem filtro):', { rlsTest, rlsError });

      // Teste 5: Inserir um registro de teste
      console.log('🔍 Teste 5: Inserindo registro de teste...');
      const testRecord = {
        user_id: user.id,
        chat_id: 'TEST_' + Date.now(),
        contact_name: 'Teste Debug Final',
        contact_phone: '5511999999999',
        priority: 'medium' as const,
        marked_for_analysis: true,
        analysis_status: 'pending' as const
      };

      const { data: insertTest, error: insertError } = await supabase
        .from('whatsapp_conversations_analysis')
        .insert(testRecord)
        .select();
      
      console.log('📊 Resultado inserção teste:', { insertTest, insertError });

      const debugResult = {
        userId: user.id,
        tableExists: !tableError,
        totalRecords: allUserData?.length || 0,
        markedRecords: markedData?.length || 0,
        rlsWorking: !rlsError,
        insertSuccess: !insertError,
        errors: {
          table: tableError?.message,
          allUser: allUserError?.message,
          marked: markedError?.message,
          rls: rlsError?.message,
          insert: insertError?.message
        },
        testRecord: insertTest?.[0]
      };

      setDebugInfo(debugResult);
      console.log('🔧 DEBUG COMPLETO:', debugResult);

      toast({
        title: "Debug Concluído",
        description: `Tabela: ${debugResult.tableExists ? '✅' : '❌'} | Total: ${debugResult.totalRecords} | Marcados: ${debugResult.markedRecords}`,
      });

      // Forçar reload após teste
      setTimeout(() => {
        loadAnalysisConversations();
      }, 1000);

    } catch (error) {
      console.error('❌ ERRO no teste do banco:', error);
      toast({
        title: "Erro no Debug",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Forçar reload completo
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

  // Inicializar dados apenas uma vez
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

  // Auto-refresh a cada 30 segundos para capturar novas conversas marcadas
  useEffect(() => {
    if (!hasInitialized) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh do dashboard...');
      loadAnalysisConversations();
      setLastRefresh(new Date());
    }, 30000); // 30 segundos

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

  const handleViewIndividualAnalysis = (conversationId: string) => {
    navigate(`/dashboard/conversation-analysis/individual/${conversationId}`);
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
        onClick={testRealConversationsQuery} 
        variant="outline" 
        size="sm"
        className="border-purple-200 text-purple-600 hover:bg-purple-50"
      >
        <Bug className="h-4 w-4 mr-1" />
        Debug Reais
      </Button>
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
      description="Dashboard para análise individual e macro das conversas marcadas"
      showBackButton={true}
      backUrl="/dashboard/behavioral"
      headerActions={headerActions}
    >
      {/* Debug Info MELHORADO */}
      {debugInfo && (
        <Card className="mb-4 bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">🔧 Debug Database Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-red-600 space-y-1">
              <p><strong>User ID:</strong> {debugInfo.userId}</p>
              <p><strong>Tabela existe:</strong> {debugInfo.tableExists ? '✅' : '❌'}</p>
              <p><strong>Total registros:</strong> {debugInfo.totalRecords}</p>
              <p><strong>Registros marcados:</strong> {debugInfo.markedRecords}</p>
              <p><strong>RLS funcionando:</strong> {debugInfo.rlsWorking ? '✅' : '❌'}</p>
              <p><strong>Inserção teste:</strong> {debugInfo.insertSuccess ? '✅' : '❌'}</p>
              {Object.entries(debugInfo.errors).some(([_, error]) => error) && (
                <div className="mt-2 p-2 bg-red-100 rounded">
                  <p><strong>Erros:</strong></p>
                  {Object.entries(debugInfo.errors).map(([key, error]) => 
                    error && <p key={key}>• {key}: {String(error)}</p>
                  )}
                </div>
              )}
              {debugInfo.testRecord && (
                <div className="mt-2 p-2 bg-green-100 rounded text-green-700">
                  <p><strong>Último registro inserido:</strong></p>
                  <p>• ID: {debugInfo.testRecord.id}</p>
                  <p>• Nome: {debugInfo.testRecord.contact_name}</p>
                  <p>• Status: {debugInfo.testRecord.analysis_status}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status do Sistema */}
      <Card className="mb-4 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs">
              <p><strong>Status:</strong> {conversations.length} conversas REAIS marcadas | {insights.length} insights gerados</p>
              <p><strong>Carregamento:</strong> {isLoading ? 'Em andamento...' : 'Concluído'}</p>
              <p><strong>Última atualização:</strong> {lastRefresh.toLocaleTimeString('pt-BR')}</p>
              <p><strong>Novo:</strong> Clique em "Ver Análise Individual" para análise detalhada com chatbot!</p>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversas">
            <MessageSquare className="h-4 w-4 mr-2" />
            Conversas ({conversations.length})
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Brain className="h-4 w-4 mr-2" />
            Insights Macro ({insights.length})
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
                <p className="text-sm text-gray-500">
                  Clique em "Ver Análise Individual" para análise detalhada com chatbot ou use "Análise por IA" para análise macro de todas as conversas
                </p>
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
                    <div className="mt-4 flex gap-2 justify-center">
                      <Button 
                        onClick={testRealConversationsQuery} 
                        variant="outline" 
                        size="sm"
                      >
                        <Bug className="h-4 w-4 mr-2" />
                        Debug Reais
                      </Button>
                      <Button 
                        onClick={clearTestData} 
                        variant="destructive" 
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpar Teste
                      </Button>
                      <Button 
                        onClick={handleRefreshAll} 
                        variant="outline" 
                        disabled={loadingRef.current}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loadingRef.current ? 'animate-spin' : ''}`} />
                        Verificar Novamente
                      </Button>
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
                        <div className="flex items-center gap-3">
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
                            onClick={() => handleViewIndividualAnalysis(conv.id)}
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Análise Individual
                            <ArrowRight className="h-4 w-4 ml-1" />
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
