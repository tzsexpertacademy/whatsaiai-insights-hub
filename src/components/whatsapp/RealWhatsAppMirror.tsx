
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRealWhatsAppConnection } from "@/hooks/useRealWhatsAppConnection";
import { 
  Send, 
  MessageSquare,
  Users,
  Clock,
  RefreshCw,
  Phone,
  Smartphone,
  Loader2,
  AlertCircle,
  CheckCircle,
  WifiOff,
  Wifi
} from 'lucide-react';

export function RealWhatsAppMirror() {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    connectionState,
    isLoading,
    sendMessage,
    loadRealChats,
    loadRealMessages,
    checkConnectionStatus
  } = useRealWhatsAppConnection();

  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Auto-inicialização quando o componente carrega
  useEffect(() => {
    const initializeWhatsApp = async () => {
      console.log('🚀 Inicializando WhatsApp automaticamente...');
      setIsInitialLoading(true);
      
      try {
        // 1. Verificar status da conexão
        console.log('🔍 Verificando status da conexão...');
        setIsCheckingStatus(true);
        const statusResult = await checkConnectionStatus();
        console.log('📊 Status verificado:', statusResult);
        
        // 2. Se conectado, carregar conversas automaticamente
        if (connectionState.isConnected) {
          console.log('✅ WhatsApp conectado, carregando conversas...');
          await handleLoadChats();
        } else {
          console.log('❌ WhatsApp não conectado');
          toast({
            title: "WhatsApp não conectado",
            description: "Conecte seu WhatsApp para ver as conversas",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        toast({
          title: "Erro na inicialização",
          description: "Não foi possível verificar o status do WhatsApp",
          variant: "destructive"
        });
      } finally {
        setIsInitialLoading(false);
        setIsCheckingStatus(false);
      }
    };

    // Executar inicialização automaticamente
    initializeWhatsApp();
  }, []); // Executar apenas uma vez quando o componente carrega

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLoadChats = async () => {
    console.log('📱 Carregando conversas...');
    setIsRefreshing(true);
    
    try {
      const chatsData = await loadRealChats();
      console.log('📋 Conversas carregadas:', chatsData.length);
      
      if (chatsData && chatsData.length > 0) {
        const processedChats = chatsData.map((chat: any) => ({
          chatId: chat.id || chat.chatId || chat.phone || 'unknown',
          name: chat.name || chat.title || chat.pushname || chat.phone || 'Sem nome',
          lastMessage: chat.lastMessage?.body || chat.last_message || 'Sem mensagem',
          timestamp: chat.lastMessage?.timestamp || chat.timestamp || Date.now(),
          isGroup: chat.isGroup || chat.is_group || false,
          unreadCount: chat.unreadCount || chat.unread_count || 0
        }));
        
        setChats(processedChats);
        
        toast({
          title: "✅ Conversas carregadas!",
          description: `${processedChats.length} conversas encontradas`
        });
      } else {
        setChats([]);
        toast({
          title: "📭 Nenhuma conversa",
          description: "Nenhuma conversa foi encontrada"
        });
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar conversas:', error);
      
      // Tratar erro de quota excedida do localStorage
      if (error.name === 'QuotaExceededError') {
        toast({
          title: "💾 Cache cheio",
          description: "Limpando cache para liberar espaço...",
          variant: "destructive"
        });
        
        // Limpar cache e tentar novamente
        localStorage.removeItem('cached_whatsapp_chats');
        try {
          const chatsData = await loadRealChats();
          if (chatsData && chatsData.length > 0) {
            setChats(chatsData);
          }
        } catch (retryError) {
          console.error('❌ Erro na segunda tentativa:', retryError);
        }
      } else {
        toast({
          title: "❌ Erro ao carregar conversas",
          description: error.message || "Erro desconhecido",
          variant: "destructive"
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectChat = async (chat: any) => {
    console.log('💬 Selecionando conversa:', chat.name);
    setSelectedChat(chat);
    
    try {
      const messagesData = await loadRealMessages(chat.chatId);
      
      if (messagesData && messagesData.length > 0) {
        const processedMessages = messagesData.map((msg: any) => ({
          id: msg.id || `${Date.now()}-${Math.random()}`,
          chatId: chat.chatId,
          text: msg.processedText || msg.body || msg.text || msg.content || 'Mensagem sem texto',
          sender: msg.fromMe || msg.from_me ? 'user' : 'contact',
          timestamp: msg.timestamp || msg.t || Date.now()
        }));
        
        setMessages(processedMessages);
        console.log('✅ Mensagens carregadas:', processedMessages.length);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens desta conversa",
        variant: "destructive"
      });
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
        
        // Adicionar mensagem enviada à lista local
        const newMsg = {
          id: `sent-${Date.now()}`,
          chatId: selectedChat.chatId,
          text: newMessage,
          sender: 'user',
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, newMsg]);
        
        toast({
          title: "✅ Mensagem enviada!",
          description: "Sua mensagem foi enviada com sucesso"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      toast({
        title: "❌ Erro ao enviar",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: string | number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = () => {
    if (isCheckingStatus) {
      return {
        icon: <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />,
        text: 'Verificando...',
        color: 'text-blue-600'
      };
    }
    
    if (connectionState.isConnected) {
      return {
        icon: <CheckCircle className="h-6 w-6 text-green-500" />,
        text: 'Conectado e Ativo',
        color: 'text-green-600'
      };
    }
    
    return {
      icon: <WifiOff className="h-6 w-6 text-gray-400" />,
      text: 'Desconectado',
      color: 'text-gray-600'
    };
  };

  const statusInfo = getStatusInfo();

  // Loading inicial
  if (isInitialLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Inicializando WhatsApp
          </h3>
          <p className="text-gray-600">
            Verificando conexão e carregando conversas automaticamente...
          </p>
        </CardContent>
      </Card>
    );
  }

  // WhatsApp não conectado
  if (!connectionState.isConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            WhatsApp não conectado
          </h3>
          <p className="text-gray-600 mb-4">
            Conecte seu WhatsApp Business nas configurações para acessar as conversas
          </p>
          <Button onClick={() => window.location.href = '/dashboard/settings'}>
            Ir para Configurações
          </Button>
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
                onClick={handleLoadChats}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Badge variant="secondary">{chats.length}</Badge>
            </div>
          </div>
          
          {/* Status da Conexão */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {statusInfo.icon}
            <div>
              <span className={`font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
              {connectionState.phoneNumber && (
                <p className="text-sm text-gray-500">
                  {connectionState.phoneNumber}
                </p>
              )}
            </div>
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
                  onClick={handleLoadChats}
                  className="mt-2"
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Carregar Conversas'
                  )}
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
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {chat.lastMessage}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        ID: {chat.chatId}
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
              <div className="flex items-center gap-2">
                {selectedChat.isGroup ? (
                  <Users className="h-5 w-5" />
                ) : (
                  <MessageSquare className="h-5 w-5" />
                )}
                <div>
                  <CardTitle>{selectedChat.name}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {selectedChat.isGroup ? 'Grupo' : 'Conversa individual'} • ID: {selectedChat.chatId}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4 min-h-[400px]">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhuma mensagem encontrada</p>
                  </div>
                ) : (
                  messages.map((msg) => (
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
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
