
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useGreenAPI, MessagePeriod } from '@/hooks/useGreenAPI';
import { useClientConfig } from '@/contexts/ClientConfigContext';
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
  Calendar,
  History,
  Filter,
  Settings
} from 'lucide-react';

export function WhatsAppMirror() {
  const { toast } = useToast();
  const { config, updateConfig } = useClientConfig();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    connectionState,
    chats,
    messages,
    currentPeriod,
    isLoadingMessages,
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
  const [specificContact, setSpecificContact] = useState(config?.whatsapp?.specificContactFilter || '');
  const [showContactFilter, setShowContactFilter] = useState(false);

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
    console.log('🔍 ChatId original:', chat.chatId);
    
    // Verificar se o chatId está no formato correto
    if (!chat.chatId.includes('@')) {
      console.log('⚠️ ChatId sem formato @, tentando corrigir...');
      let correctedChatId = chat.chatId;
      
      // Se for apenas números, adicionar @c.us
      if (/^\d+$/.test(chat.chatId)) {
        correctedChatId = chat.chatId + '@c.us';
        console.log('🔧 ChatId corrigido para:', correctedChatId);
      }
      
      // Atualizar o chat com o ID corrigido
      chat.chatId = correctedChatId;
    }
    
    setSelectedChat(chat);
    
    try {
      await loadChatMessages(chat.chatId, 'today');
      console.log('✅ Mensagens carregadas para:', chat.name);
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Formato de ID de chat inválido ou problema na API",
        variant: "destructive"
      });
    }
  };

  const handleLoadMessagesByPeriod = async (period: MessagePeriod) => {
    if (!selectedChat) return;
    
    console.log(`📅 Carregando mensagens do período: ${period}`);
    await loadChatMessages(selectedChat.chatId, period);
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

  const handleSaveContactFilter = async () => {
    if (!config?.whatsapp) return;
    
    updateConfig('whatsapp', {
      ...config.whatsapp,
      specificContactFilter: specificContact
    });
    
    toast({
      title: "Filtro configurado",
      description: specificContact 
        ? `Carregando apenas conversas de: ${specificContact}` 
        : "Filtro removido - carregando todas as conversas",
    });

    // Recarregar conversas com o novo filtro
    setIsRefreshing(true);
    try {
      await loadChats();
    } finally {
      setIsRefreshing(false);
    }
    
    setShowContactFilter(false);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPeriodLabel = (period: MessagePeriod) => {
    switch (period) {
      case 'today': return 'Hoje';
      case '7days': return '7 dias';
      case '1month': return '1 mês';
      case '3months': return '3 meses';
      case 'all': return 'Todas';
      default: return 'Hoje';
    }
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
                onClick={() => setShowContactFilter(!showContactFilter)}
              >
                <Filter className="h-4 w-4" />
              </Button>
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
          
          {/* Filtro de Contato Específico */}
          {showContactFilter && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Label className="text-sm font-medium">Filtro por Contato</Label>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Ex: 5511999999999 ou nome"
                  value={specificContact}
                  onChange={(e) => setSpecificContact(e.target.value)}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveContactFilter}
                    size="sm"
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Aplicar'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSpecificContact('');
                      setShowContactFilter(false);
                    }}
                  >
                    Limpar
                  </Button>
                </div>
              </div>
              {config?.whatsapp?.specificContactFilter && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  <strong>Filtro ativo:</strong> {config.whatsapp.specificContactFilter}
                </div>
              )}
            </div>
          )}
          
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
              <div className="flex items-center justify-between">
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
                
                {/* Filtros de Período */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div className="flex gap-1">
                    {(['today', '7days', '1month', '3months', 'all'] as MessagePeriod[]).map((period) => (
                      <Button
                        key={period}
                        variant={currentPeriod === period ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleLoadMessagesByPeriod(period)}
                        disabled={isLoadingMessages}
                        className="text-xs"
                      >
                        {getPeriodLabel(period)}
                      </Button>
                    ))}
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
                    <History className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhuma mensagem encontrada para este período</p>
                    <p className="text-xs mt-1">Experimente carregar um período maior</p>
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
