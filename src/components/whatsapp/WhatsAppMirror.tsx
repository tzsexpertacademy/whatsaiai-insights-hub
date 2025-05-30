
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGreenAPI } from '@/hooks/useGreenAPI';
import { 
  Send, 
  MessageSquare,
  Users,
  Clock,
  RefreshCw,
  Phone,
  Smartphone,
  Loader2,
  AlertCircle
} from 'lucide-react';

export function WhatsAppMirror() {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    connectionState,
    chats,
    messages,
    checkInstanceStatus,
    loadChats,
    loadChatMessages,
    sendMessage
  } = useGreenAPI();

  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Verificar conexão e carregar conversas quando componente montar
  useEffect(() => {
    const initializeConnection = async () => {
      console.log('🔄 Inicializando conexão WhatsApp...');
      setIsInitialLoading(true);
      
      try {
        const isConnected = await checkInstanceStatus();
        console.log('📱 Status de conexão:', isConnected);
        
        if (isConnected) {
          console.log('✅ WhatsApp conectado, carregando conversas...');
          await loadChats();
          
          toast({
            title: "WhatsApp conectado!",
            description: "Conversas carregadas com sucesso"
          });
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar conexão:', error);
        toast({
          title: "Erro de conexão",
          description: "Verifique suas configurações GREEN-API",
          variant: "destructive"
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    initializeConnection();
  }, [checkInstanceStatus, loadChats, toast]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectChat = async (chat: any) => {
    console.log('📱 Selecionando conversa:', chat.name);
    setSelectedChat(chat);
    
    try {
      await loadChatMessages(chat.chatId);
      console.log('✅ Mensagens carregadas para:', chat.name);
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Tente novamente em alguns instantes",
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

  // Loading inicial
  if (isInitialLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Conectando ao WhatsApp
          </h3>
          <p className="text-gray-600">
            Verificando conexão e carregando conversas...
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
            <span>Conectado: {connectionState.phoneNumber}</span>
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
                  Atualizar Lista
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
                    {selectedChat.isGroup ? 'Grupo' : 'Conversa individual'}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4 min-h-[400px]">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                    <p>Carregando mensagens...</p>
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
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
