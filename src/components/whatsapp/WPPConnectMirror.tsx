
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
  Phone,
  Smartphone,
  Loader2,
  AlertCircle,
  Calendar,
  History,
  Filter,
  Settings,
  Play,
  Square,
  Search,
  Circle
} from 'lucide-react';

export function WPPConnectMirror() {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    sessionStatus,
    chats,
    messages,
    currentChatId,
    isLiveMode,
    isLoadingChats,
    isLoadingMessages,
    loadRealChats,
    loadRealMessages,
    sendMessage,
    startLiveMode,
    stopLiveMode
  } = useWPPConnect();

  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Carregar conversas quando conectado
  useEffect(() => {
    if (sessionStatus.isConnected && !isLoadingChats && chats.length === 0) {
      loadRealChats();
    }
  }, [sessionStatus.isConnected, isLoadingChats, chats.length, loadRealChats]);

  const handleSelectChat = async (chat: any) => {
    setSelectedChat(chat);
    await loadRealMessages(chat.chatId);
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

    setIsSending(true);
    try {
      const success = await sendMessage(selectedChat.chatId, newMessage);
      if (success) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // WhatsApp não conectado
  if (!sessionStatus.isConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            WPPConnect não conectado
          </h3>
          <p className="text-gray-600 mb-4">
            Configure sua conexão WPPConnect nas configurações para acessar as conversas
          </p>
          <Button onClick={() => window.location.href = '/dashboard/settings'}>
            Ir para Configurações
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex gap-4">
      {/* Lista de Conversas - Estilo da imagem */}
      <Card className="w-80 flex flex-col bg-white border border-gray-200">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              Conversas
              <Badge variant="secondary" className="bg-red-100 text-red-600 text-xs">
                {filteredChats.length}
              </Badge>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRealChats}
              disabled={isLoadingChats}
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingChats ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {/* Barra de pesquisa */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[600px]">
            {isLoadingChats ? (
              <div className="p-4 text-center text-gray-500">
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p>Carregando conversas...</p>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhuma conversa encontrada</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.chatId}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat?.chatId === chat.chatId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        {chat.isGroup ? (
                          <Users className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-green-600 fill-current" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">{chat.name}</span>
                        {/* Indicador de modo ao vivo */}
                        {isLiveMode && currentChatId === chat.chatId && (
                          <Badge className="bg-red-500 text-white text-xs ml-2">
                            LIVE
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {chat.lastMessage || 'Sem mensagens'}
                      </p>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">
                          {formatTime(chat.timestamp)}
                        </span>
                        {chat.unreadCount > 0 && (
                          <Badge className="bg-green-500 text-white text-xs">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Área de Chat - Estilo da imagem */}
      <Card className="flex-1 flex flex-col bg-white border border-gray-200">
        {selectedChat ? (
          <>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    {selectedChat.isGroup ? (
                      <Users className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-green-600 fill-current" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedChat.name}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {selectedChat.chatId}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Status do modo ao vivo */}
                  {isLiveMode && currentChatId === selectedChat.chatId && (
                    <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-600 font-medium">Modo Live Ativo</span>
                      <span className="text-xs text-gray-500">Mensagens sendo atualizadas automaticamente a cada 3s</span>
                    </div>
                  )}
                  
                  <Button
                    variant={isLiveMode && currentChatId === selectedChat.chatId ? "destructive" : "default"}
                    size="sm"
                    onClick={handleToggleLiveMode}
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
                    <p>Nenhuma mensagem encontrada</p>
                    <p className="text-xs mt-1">Ative o modo ao vivo para ver mensagens em tempo real</p>
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
                              ? 'bg-green-500 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <div className={`text-xs mt-1 flex items-center gap-1 ${
                            msg.sender === 'user' ? 'text-green-100 justify-end' : 'text-gray-500'
                          }`}>
                            {formatTime(msg.timestamp)}
                            {msg.sender === 'user' && (
                              <span className="text-xs">✓✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              <Separator />
              
              <div className="p-4 bg-gray-50">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ela tava muito espoleta"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
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
              <p className="text-lg mb-2">Selecione uma conversa para começar</p>
              <p className="text-sm">💡 Use o botão "Modo Live" para ver mensagens em tempo real</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
