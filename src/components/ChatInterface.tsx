
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useGreenAPI } from '@/hooks/useGreenAPI';
import { AssistantSelector } from './AssistantSelector';
import { AssistantChatConfig } from './AssistantChatConfig';
import { 
  Send, 
  MoreVertical, 
  Pin, 
  PinOff, 
  Brain, 
  BrainCircuit, 
  Phone, 
  MessageSquare,
  Users,
  Clock,
  RefreshCw,
  Settings
} from 'lucide-react';

export function ChatInterface() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAssistantConfig, setShowAssistantConfig] = useState(false);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  const {
    greenAPIState,
    chats,
    messages,
    loadChats,
    loadChatHistory,
    sendMessage,
    togglePinChat,
    toggleMonitorChat,
    assignAssistantToChat,
    selectedAssistant,
    setSelectedAssistant,
    refreshChats
  } = useGreenAPI();

  useEffect(() => {
    if (selectedChat && selectedChat.chatId) {
      console.log('📱 Carregando histórico para chat selecionado:', selectedChat.chatId);
      loadChatHistory(selectedChat.chatId).catch(error => {
        console.error('❌ Erro ao carregar histórico:', error);
        toast({
          title: "Erro ao carregar histórico",
          description: "Não foi possível carregar o histórico do chat",
          variant: "destructive"
        });
      });
    }
  }, [selectedChat, loadChatHistory, toast]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedChat]);

  // Polling para atualizar conversas automaticamente
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    
    if (greenAPIState.isConnected) {
      pollInterval = setInterval(() => {
        console.log('🔄 Atualizando conversas automaticamente...');
        refreshChats();
      }, 15000); // A cada 15 segundos
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [greenAPIState.isConnected, refreshChats]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    setIsSending(true);
    const success = await sendMessage(selectedChat.chatId, newMessage);
    setIsSending(false);

    if (success) {
      setNewMessage('');
    }
  };

  const renderChatList = () => {
    return chats.map((chat) => (
      <div
        key={chat.chatId}
        className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 ${selectedChat?.chatId === chat.chatId ? 'bg-gray-50' : ''}`}
        onClick={() => setSelectedChat(chat)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="font-medium flex items-center gap-2">
              {chat.name}
              {chat.assignedAssistant && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
                  🤖
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-500 truncate">{chat.lastMessage}</div>
          </div>
          <div className="flex flex-col items-end">
            {chat.unreadCount > 0 && (
              <Badge variant="secondary">{chat.unreadCount}</Badge>
            )}
            {chat.isPinned && (
              <Pin className="h-3 w-3 text-gray-400 mt-1" />
            )}
          </div>
        </div>
      </div>
    ));
  };

  const renderChatMessages = () => {
    if (!selectedChat?.chatId) return null;
    
    const chatMessages = messages[selectedChat.chatId] || [];

    return chatMessages.map((msg) => (
      <div
        key={msg.id}
        className={`mb-2 flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`rounded-xl px-3 py-2 text-sm max-w-[75%] ${msg.sender === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}
        >
          {msg.text}
          <div className="text-xs text-gray-500 mt-1">
            <Clock className="h-3 w-3 inline-block mr-1" />
            {msg.timestamp}
          </div>
        </div>
      </div>
    ));
  };

  const handleRefreshChats = async () => {
    setIsRefreshing(true);
    try {
      await refreshChats();
      toast({
        title: "Conversas atualizadas",
        description: "Lista de conversas foi atualizada com sucesso"
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar conversas:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar as conversas",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!greenAPIState.isConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp não conectado</h3>
          <p className="text-gray-600 mb-4">
            Conecte seu WhatsApp Business nas configurações para acessar as conversas
          </p>
          <Button onClick={() => window.location.href = '/settings'}>
            Ir para Configurações
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Configuração de Assistente para Chat Selecionado */}
      {selectedChat && showAssistantConfig && (
        <AssistantChatConfig
          chatId={selectedChat.chatId}
          chatName={selectedChat.name}
          assignedAssistant={selectedChat.assignedAssistant}
          onAssistantChange={assignAssistantToChat}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-4 flex-1">
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
            
            {/* Seletor de Assistente Global */}
            <div className="mt-3">
              <AssistantSelector
                selectedAssistant={selectedAssistant}
                onAssistantChange={setSelectedAssistant}
              />
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[400px] lg:h-[600px]">
              {renderChatList()}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Área de Chat */}
        <Card className="lg:w-2/3 flex flex-col">
          {selectedChat ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedChat.isGroup ? <Users className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                      {selectedChat.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedChat.isPinned && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          <Pin className="h-3 w-3 mr-1" />
                          Fixado
                        </Badge>
                      )}
                      {selectedChat.isMonitored && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          <Brain className="h-3 w-3 mr-1" />
                          Monitorado
                        </Badge>
                      )}
                      {selectedChat.assignedAssistant && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          🤖 Assistente configurado
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAssistantConfig(!showAssistantConfig)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => togglePinChat(selectedChat.chatId)}>
                          {selectedChat.isPinned ? (
                            <>
                              <PinOff className="h-4 w-4 mr-2" />
                              Desfixar
                            </>
                          ) : (
                            <>
                              <Pin className="h-4 w-4 mr-2" />
                              Fixar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleMonitorChat(selectedChat.chatId)}>
                          {selectedChat.isMonitored ? (
                            <>
                              <BrainCircuit className="h-4 w-4 mr-2" />
                              Parar Monitoramento
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4 mr-2" />
                              Monitorar para Análise
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  {renderChatMessages()}
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
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Mostrar assistente ativo */}
                  {selectedChat.assignedAssistant && (
                    <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                      🤖 Assistente configurado para auto-resposta neste número
                    </div>
                  )}
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
    </div>
  );
}
