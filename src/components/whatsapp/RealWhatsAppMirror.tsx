
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRealWhatsAppConnection } from "@/hooks/useRealWhatsAppConnection";
import { useConversationMarking } from "@/hooks/useConversationMarking";
import { ConversationContextMenu } from "./ConversationContextMenu";
import { 
  Smartphone, 
  CheckCircle, 
  MessageSquare, 
  Wifi,
  Clock,
  User,
  AlertCircle,
  RefreshCw,
  Star,
  Brain,
  Trash2
} from 'lucide-react';

export function RealWhatsAppMirror() {
  const { toast } = useToast();
  const { 
    connectionState, 
    chats, 
    isLoading,
    lastUpdate,
    checkStatus,
    loadRealChats,
    clearCache
  } = useRealWhatsAppConnection();
  
  const { markConversationForAnalysis, updateConversationPriority, isMarking } = useConversationMarking();
  
  const [markedConversations, setMarkedConversations] = useState<Set<string>>(new Set());
  const [pinnedConversations, setPinnedConversations] = useState<Set<string>>(new Set());
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);

  // Auto-check periódico
  useEffect(() => {
    if (!autoCheckEnabled) return;

    const performAutoCheck = async () => {
      console.log('🔄 Auto-check: Verificando conexão...');
      try {
        const isConnected = await checkStatus();
        if (isConnected && chats.length === 0) {
          console.log('🔄 Auto-check: Carregando conversas...');
          await handleLoadRealChats();
        }
      } catch (error) {
        console.error('❌ Erro no auto-check:', error);
      }
    };

    // Executar imediatamente e depois a cada 60 segundos
    performAutoCheck();
    const interval = setInterval(performAutoCheck, 60000);

    return () => clearInterval(interval);
  }, [autoCheckEnabled, chats.length, checkStatus]);

  const handleLoadRealChats = useCallback(async () => {
    console.log('🔄 Carregando conversas manualmente...');
    try {
      const loadedChats = await loadRealChats();
      
      if (loadedChats.length > 0) {
        toast({
          title: "Conversas carregadas",
          description: `${loadedChats.length} conversas do WhatsApp carregadas com sucesso`,
        });
      } else {
        toast({
          title: "Nenhuma conversa encontrada",
          description: "Verifique se há conversas recentes no WhatsApp",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      toast({
        title: "Erro ao carregar conversas",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [loadRealChats, toast]);

  const handleClearCache = useCallback(() => {
    console.log('🧹 Limpando cache...');
    clearCache();
    toast({
      title: "Cache limpo",
      description: "Cache do WhatsApp foi limpo com sucesso",
    });
  }, [clearCache, toast]);

  const handleTogglePin = (chatId: string) => {
    setPinnedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
        toast({ title: "Conversa desfixada" });
      } else {
        newSet.add(chatId);
        toast({ title: "Conversa fixada" });
      }
      return newSet;
    });
  };

  const handleToggleAnalysis = async (chatId: string, priority?: 'high' | 'medium' | 'low') => {
    const chat = chats.find(c => c.chatId === chatId);
    if (!chat) return;

    console.log('🏷️ Toggle análise para:', { chatId, chatName: chat.name, priority });

    if (priority && markedConversations.has(chatId)) {
      // Atualizar prioridade
      await updateConversationPriority(chatId, priority);
    } else {
      // Marcar/desmarcar para análise
      const isMarked = await markConversationForAnalysis(
        chatId, 
        chat.name, 
        chatId, // usando chatId como phone por enquanto
        priority || 'medium'
      );

      setMarkedConversations(prev => {
        const newSet = new Set(prev);
        if (isMarked) {
          newSet.add(chatId);
        } else {
          newSet.delete(chatId);
        }
        return newSet;
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = () => {
    if (connectionState.isConnected) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    return <AlertCircle className="h-6 w-6 text-gray-400" />;
  };

  const getStatusText = () => {
    if (connectionState.isConnected) {
      return 'Conectado e Ativo';
    }
    return 'Desconectado';
  };

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Smartphone className="h-5 w-5" />
            WhatsApp Real - Espelhamento Direto
            {connectionState.isConnected && <CheckCircle className="h-5 w-5 text-green-500" />}
          </CardTitle>
          <CardDescription className="text-green-700">
            Conectado diretamente com WPPConnect em localhost:21465
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <span className="font-medium text-green-600">{getStatusText()}</span>
                {connectionState.phoneNumber && (
                  <p className="text-sm text-gray-500">{connectionState.phoneNumber}</p>
                )}
                {connectionState.lastConnected && (
                  <p className="text-xs text-gray-400">
                    Última conexão: {connectionState.lastConnected.toLocaleTimeString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setAutoCheckEnabled(!autoCheckEnabled)}
                variant={autoCheckEnabled ? "default" : "outline"}
                size="sm"
              >
                <Wifi className="h-4 w-4 mr-1" />
                Auto-Check {autoCheckEnabled ? 'ON' : 'OFF'}
              </Button>
              <Button onClick={handleClearCache} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar Cache
              </Button>
              <Button onClick={handleLoadRealChats} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Carregando...' : 'Carregar Conversas'}
              </Button>
              <Button onClick={checkStatus} variant="outline" size="sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                Verificar Status
              </Button>
            </div>
          </div>

          {lastUpdate && (
            <p className="text-xs text-gray-500">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Conversas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversas Reais
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{chats.length}</Badge>
              {markedConversations.size > 0 && (
                <Badge variant="outline" className="bg-blue-50">
                  <Brain className="h-3 w-3 mr-1" />
                  {markedConversations.size} marcadas
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-500" />
              <p>Carregando conversas do WhatsApp...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhuma conversa encontrada</h3>
              <p className="text-sm mb-4">
                {connectionState.isConnected 
                  ? 'Carregue as conversas clicando no botão "Carregar Conversas"'
                  : 'Verifique se o WPPConnect está rodando e conectado'
                }
              </p>
              <Button onClick={handleLoadRealChats} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Carregar Conversas
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {chats.map((chat) => (
                <ConversationContextMenu
                  key={chat.chatId}
                  chatId={chat.chatId}
                  isPinned={pinnedConversations.has(chat.chatId)}
                  isMarkedForAnalysis={markedConversations.has(chat.chatId)}
                  analysisPriority="medium"
                  onTogglePin={handleTogglePin}
                  onToggleAnalysis={handleToggleAnalysis}
                >
                  <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{chat.name}</span>
                          {pinnedConversations.has(chat.chatId) && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                          {markedConversations.has(chat.chatId) && (
                            <Brain className="h-3 w-3 text-blue-500" />
                          )}
                          {chat.isGroup && (
                            <Badge variant="outline" className="text-xs">Grupo</Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{formatTime(chat.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">{chat.lastMessage}</p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <Badge className="bg-green-500 text-white">{chat.unreadCount}</Badge>
                    )}
                  </div>
                </ConversationContextMenu>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Como usar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>✅ Status:</strong> {connectionState.isConnected ? 'WPPConnect conectado e funcionando' : 'WPPConnect desconectado'}</p>
            <p><strong>🔄 Auto-refresh:</strong> Sistema verifica conexão automaticamente a cada 60 segundos</p>
            <p><strong>💾 Cache:</strong> Conversas são salvas localmente para melhor performance</p>
            <p><strong>🤖 Marcar para IA:</strong> Clique com botão direito nas conversas para marcar para análise</p>
            <p><strong>🧹 Limpeza:</strong> Use "Limpar Cache" se tiver problemas de carregamento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
