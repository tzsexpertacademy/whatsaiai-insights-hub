
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Phone, Wifi, WifiOff, AlertCircle, Shield, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useGreenAPI } from "@/hooks/useGreenAPI";
import { useAdmin } from "@/contexts/AdminContext";
import { PageLayout } from '@/components/layout/PageLayout';

export function ChatInterface() {
  const {
    greenAPIState,
    chats,
    messages,
    loadChats,
    loadChatHistory,
    sendMessage
  } = useGreenAPI();
  
  const { isAdmin } = useAdmin();
  
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Carregar chats quando conectado
  useEffect(() => {
    if (greenAPIState.isConnected) {
      loadChats();
    }
  }, [greenAPIState.isConnected]);

  // Carregar histórico quando um chat é selecionado
  useEffect(() => {
    if (activeChat) {
      loadChatHistory(activeChat);
    }
  }, [activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    const messageText = newMessage;
    setNewMessage('');
    setIsTyping(true);

    try {
      const success = await sendMessage(activeChat, messageText);
      
      if (success) {
        toast({
          title: "Mensagem enviada",
          description: "Mensagem enviada via GREEN-API",
        });
      } else {
        toast({
          title: "Erro no envio",
          description: "Não foi possível enviar a mensagem",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro no envio",
        description: "Falha ao enviar mensagem",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId);
  };

  const handleRefreshChats = () => {
    loadChats();
    toast({
      title: "Atualizando...",
      description: "Carregando conversas mais recentes"
    });
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">
        📱 GREEN-API
      </Badge>
      {isAdmin && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      )}
      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
        <Wifi className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700 font-medium">
          {greenAPIState.isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>
    </div>
  );

  if (!greenAPIState.isConnected) {
    return (
      <PageLayout
        title="Chat WhatsApp"
        description="Conversas em tempo real via GREEN-API"
        showBackButton={true}
        headerActions={headerActions}
      >
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <WifiOff className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-red-600 mb-2">WhatsApp não conectado</h3>
            <p className="text-gray-600 text-center mb-6">
              Conecte seu WhatsApp Business via GREEN-API para ver as conversas em tempo real.
            </p>
            <Button onClick={() => window.location.href = '/settings'}>
              Ir para Configurações
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const activeChatInfo = chats.find(c => c.chatId === activeChat);
  const chatMessages = activeChat ? messages[activeChat] || [] : [];

  return (
    <PageLayout
      title="Chat WhatsApp"
      description={`Conversas espelhadas via GREEN-API - ${greenAPIState.phoneNumber}`}
      showBackButton={true}
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de conversas */}
        <Card className="lg:col-span-1 bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                Conversas ({chats.length})
              </div>
              <Button onClick={handleRefreshChats} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.chatId}
                  onClick={() => handleChatSelect(chat.chatId)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    activeChat === chat.chatId 
                      ? 'bg-blue-100 border border-blue-300' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        chat.isGroup ? 'bg-purple-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-sm font-medium truncate">{chat.name}</span>
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                  {chat.lastMessageTime && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(chat.lastMessageTime).toLocaleTimeString('pt-BR')}
                    </p>
                  )}
                </div>
              ))}
              
              {chats.length === 0 && (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Nenhuma conversa encontrada</p>
                  <Button onClick={handleRefreshChats} variant="outline" size="sm" className="mt-2">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat principal */}
        <Card className="lg:col-span-3 bg-white/70 backdrop-blur-sm border-white/50">
          {activeChatInfo ? (
            <>
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      activeChatInfo.isGroup ? 'bg-purple-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <span className="font-medium">{activeChatInfo.name}</span>
                      <p className="text-sm text-gray-500 font-normal">
                        {activeChatInfo.isGroup ? 'Grupo' : 'Contato individual'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    GREEN-API
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96 p-4">
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === 'user' 
                            ? 'justify-end' 
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString('pt-BR')}
                            </p>
                            {message.sender === 'user' && (
                              <span className="text-xs opacity-70">
                                {message.status === 'sent' && '✓'}
                                {message.status === 'delivered' && '✓✓'}
                                {message.status === 'read' && '✓✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t border-gray-200 space-y-2">
                  {/* Campo de mensagem */}
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Responder para ${activeChatInfo.name}...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Mensagens enviadas via GREEN-API • {greenAPIState.phoneNumber}
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <Phone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Selecione uma conversa para começar</p>
                <p className="text-sm text-gray-400 mt-2">
                  {chats.length === 0 ? 'Clique em "Atualizar" para carregar conversas' : `${chats.length} conversas disponíveis`}
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </PageLayout>
  );
}
