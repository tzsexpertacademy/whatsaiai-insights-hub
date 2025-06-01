
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useWPPConnect } from '@/hooks/useWPPConnect';
import { 
  Send, 
  MessageSquare,
  Users,
  Clock,
  RefreshCw,
  Smartphone,
  Loader2,
  AlertCircle,
  Play,
  Square
} from 'lucide-react';

export function WPPConnectMirror() {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    sessionStatus,
    chats,
    messages,
    isLoadingMessages,
    isLiveMode,
    currentChatId,
    createSession,
    checkSessionStatus,
    loadChats,
    loadChatMessages,
    sendMessage,
    startLiveMode,
    stopLiveMode
  } = useWPPConnect();

  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Verificar conexão ao montar componente
  useEffect(() => {
    const initializeConnection = async () => {
      console.log('🔄 Verificando conexão WPPConnect...');
      
      const isConnected = await checkSessionStatus();
      
      if (isConnected) {
        console.log('✅ WPPConnect conectado, carregando conversas...');
        await loadChats();
      }
    };

    initializeConnection();
  }, [checkSessionStatus, loadChats]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectChat = async (chat: any) => {
    console.log('📱 Selecionando conversa:', chat.name);
    
    // Parar modo ao vivo anterior se existir
    if (isLiveMode && currentChatId !== chat.chatId) {
      stopLiveMode();
    }
    
    setSelectedChat(chat);
    
    try {
      await loadChatMessages(chat.chatId, 50);
      console.log('✅ Mensagens carregadas para:', chat.name);
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive"
      });
    }
  };

  const handleToggleLiveMode = () => {
    if (!selectedChat) {
      toast({
        title: "Selecione uma conversa",
        description: "Escolha uma conversa primeiro para ativar o modo ao vivo",
        variant: "destructive"
      });
      return;
    }

    if (isLiveMode && currentChatId === selectedChat.chatId) {
      stopLiveMode();
    } else {
      startLiveMode(selectedChat.chatId);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isSending) return;

    console.log('📤 Enviando mensagem para:', selectedChat.name);
    setIsSending(true);
    
    try {
      const success = await sendMessage(selectedChat.chatId, newMessage);
      
      if (success) {
        setNewMessage('');
        console.log('✅ Mensagem enviada com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleRefreshChats = async () => {
    console.log('🔄 Atualizando lista de conversas...');
    setIsRefreshing(true);
    
    try {
      await loadChats();
      
      toast({
        title: "Conversas atualizadas",
        description: "Lista de conversas foi recarregada"
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar conversas:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível recarregar as conversas",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // WhatsApp não conectado
  if (!sessionStatus.isConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            WhatsApp não conectado
          </h3>
          <p className="text-gray-600 mb-4">
            Conecte seu WhatsApp através do WPPConnect Server
          </p>
          <div className="space-y-2">
            <Button onClick={createSession} disabled={sessionStatus.isLoading}>
              {sessionStatus.isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Criar Nova Sessão
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard/settings'}>
              Ir para Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      {/* Lista de Conversas */}
      <Card className="lg:w-1/3 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversas
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshChats}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Badge variant="secondary">{chats.length}</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Smartphone className="h-4 w-4" />
            <span>WPPConnect: {sessionStatus.phoneNumber}</span>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[500px]">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhuma conversa encontrada</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshChats}
                  className="mt-2"
                >
                  Carregar Conversas
                </Button>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.chatId}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat?.chatId === chat.chatId ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {chat.isGroup ? (
                          <Users className="h-4 w-4 text-gray-400" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="font-medium truncate">{chat.name}</span>
                        {/* Indicador de modo ao vivo */}
                        {isLiveMode && currentChatId === chat.chatId && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-red-600 font-medium">LIVE</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {chat.lastMessage}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-400">
                        {formatTime(chat.timestamp)}
                      </span>
                      {chat.unreadCount > 0 && (
                        <Badge className="mt-1" variant="secondary">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Área de Chat */}
      <Card className="lg:w-2/3 flex flex-col">
        {selectedChat ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedChat.isGroup ? (
                    <Users className="h-5 w-5" />
                  ) : (
                    <MessageSquare className="h-5 w-5" />
                  )}
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedChat.name}
                      {/* Botão de Modo Ao Vivo */}
                      <Button
                        variant={isLiveMode && currentChatId === selectedChat.chatId ? "destructive" : "default"}
                        size="sm"
                        onClick={handleToggleLiveMode}
                        className="ml-2"
                      >
                        {isLiveMode && currentChatId === selectedChat.chatId ? (
                          <>
                            <Square className="h-4 w-4 mr-1" />
                            Parar Live
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Modo Live
                          </>
                        )}
                      </Button>
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {selectedChat.isGroup ? 'Grupo' : 'Conversa individual'}
                      {/* Status do modo ao vivo */}
                      {isLiveMode && currentChatId === selectedChat.chatId && (
                        <span className="ml-2 text-red-600 font-medium">
                          🔴 AO VIVO - Atualizando automaticamente
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4 min-h-[400px]">
                {isLoadingMessages ? (
                  <div className="text-center text-gray-500 py-8">
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p>Carregando mensagens...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhuma mensagem encontrada</p>
                  </div>
                ) : (
                  messages
                    .filter(msg => msg.chatId === selectedChat.chatId)
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`mb-3 flex ${
                          msg.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`rounded-lg px-3 py-2 max-w-[75%] ${
                            msg.sender === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <div className={`text-xs mt-1 flex items-center gap-1 ${
                            msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <Clock className="h-3 w-3" />
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              <Separator />
              
              <div className="p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isSending}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                    size="sm"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4" />
              <p>Selecione uma conversa para começar</p>
              <p className="text-sm mt-2">💡 Use o botão "Modo Live" para ver mensagens em tempo real</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
