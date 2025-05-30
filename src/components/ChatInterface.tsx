import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bot, User, Phone, Wifi, WifiOff, AlertCircle, Shield, RefreshCw, Search, MoreVertical, Calendar, Filter } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('7'); // dias
  const [showFilters, setShowFilters] = useState(false);
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

  // Filtrar chats por período
  const getDateFilterThreshold = () => {
    const now = new Date();
    const days = parseInt(periodFilter);
    return new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  };

  const filteredChats = chats
    .filter(chat => {
      // Filtro por busca
      const matchesSearch = searchQuery === '' || 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtro por período
      const threshold = getDateFilterThreshold();
      const matchesPeriod = chat.lastMessageTime ? 
        new Date(chat.lastMessageTime) >= threshold : 
        true; // Mostrar chats sem mensagens também
      
      return matchesSearch && matchesPeriod;
    });

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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Ontem';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getPeriodLabel = (days: string) => {
    switch(days) {
      case '1': return 'Hoje';
      case '7': return 'Última semana';
      case '30': return 'Último mês';
      case '90': return 'Últimos 3 meses';
      default: return 'Período personalizado';
    }
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
      title="WhatsApp Business"
      description={`${filteredChats.length} conversas • ${greenAPIState.phoneNumber}`}
      showBackButton={true}
      headerActions={headerActions}
    >
      <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Lista de conversas */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Header da lista */}
          <div className="p-4 bg-green-600 text-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Conversas</h2>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setShowFilters(!showFilters)} 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-green-700"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleRefreshChats} 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-green-700"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Busca */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/70"
              />
            </div>

            {/* Filtros de período */}
            {showFilters && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Período:</span>
                </div>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Hoje</SelectItem>
                    <SelectItem value="7">Última semana</SelectItem>
                    <SelectItem value="30">Último mês</SelectItem>
                    <SelectItem value="90">Últimos 3 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Stats do filtro */}
          <div className="px-4 py-2 bg-green-500 text-white text-sm flex justify-between items-center">
            <span>{filteredChats.length} conversas • {getPeriodLabel(periodFilter)}</span>
            <span className="text-xs">
              {filteredChats.filter(c => c.unreadCount > 0).length} não lidas
            </span>
          </div>

          {/* Lista de conversas */}
          <ScrollArea className="flex-1">
            <div className="divide-y divide-gray-200">
              {filteredChats.map((chat) => (
                <div
                  key={chat.chatId}
                  onClick={() => handleChatSelect(chat.chatId)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-100 ${
                    activeChat === chat.chatId ? 'bg-green-50 border-r-4 border-green-500' : ''
                  } ${chat.unreadCount > 0 ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold relative ${
                      chat.isGroup ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {chat.isGroup ? '👥' : chat.name.charAt(0).toUpperCase()}
                      {chat.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </div>
                      )}
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`truncate ${
                          chat.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'
                        }`}>
                          {chat.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {chat.lastMessageTime && (
                            <span className="text-xs text-gray-500">
                              {formatTime(chat.lastMessageTime)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate flex-1 ${
                          chat.unreadCount > 0 ? 'font-medium text-gray-800' : 'text-gray-600'
                        }`}>
                          {chat.lastMessage || 'Nenhuma mensagem'}
                        </p>
                        {chat.isGroup && (
                          <Badge variant="outline" className="text-xs ml-2">
                            Grupo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredChats.length === 0 && (
                <div className="text-center py-12 px-4">
                  <Phone className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-gray-600 font-medium mb-2">
                    {searchQuery || periodFilter !== '90' ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa'}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {searchQuery ? 'Tente buscar por outro termo' : 
                     periodFilter !== '90' ? 'Tente expandir o período de filtro' : 
                     'Aguardando mensagens do WhatsApp'}
                  </p>
                  <Button onClick={handleRefreshChats} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Área do chat */}
        <div className="flex-1 flex flex-col">
          {activeChatInfo ? (
            <>
              {/* Header do chat */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    activeChatInfo.isGroup ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {activeChatInfo.isGroup ? '👥' : activeChatInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{activeChatInfo.name}</h3>
                    <p className="text-sm text-gray-600">
                      {activeChatInfo.isGroup ? 'Grupo' : 'Contato'} • GREEN-API
                      {chatMessages.length > 0 && (
                        <span className="ml-2">• {chatMessages.length} mensagens</span>
                      )}
                      {activeChatInfo.unreadCount > 0 && (
                        <span className="ml-2 text-red-600 font-medium">
                          • {activeChatInfo.unreadCount} não lidas
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <ScrollArea className="flex-1 p-4 bg-gray-100">
                <div className="space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Phone className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">Carregando conversa...</p>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                            message.sender === 'user'
                              ? 'bg-green-500 text-white rounded-br-none'
                              : 'bg-white text-gray-800 rounded-bl-none border'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className={`text-xs ${
                              message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {message.sender === 'user' && (
                              <span className="text-xs text-green-100 ml-2">
                                {message.status === 'sent' && '✓'}
                                {message.status === 'delivered' && '✓✓'}
                                {message.status === 'read' && '✓✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-800 px-4 py-2 rounded-lg border shadow-sm">
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
              
              {/* Input de mensagem */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-3 items-end">
                  <Input
                    placeholder={`Mensagem para ${activeChatInfo.name}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 rounded-full border-gray-300"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim()}
                    className="rounded-full bg-green-500 hover:bg-green-600"
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Mensagens enviadas via GREEN-API • {greenAPIState.phoneNumber}
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">WhatsApp Business</h3>
                <p className="text-gray-500 mb-1">Selecione uma conversa para começar</p>
                <p className="text-sm text-gray-400">
                  {filteredChats.length === 0 
                    ? 'Aguardando mensagens...' 
                    : `${filteredChats.length} conversas disponíveis`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
