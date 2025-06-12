
import React, { useState, useEffect, useRef } from 'react';
import { useRealWhatsAppConnection } from '@/hooks/useRealWhatsAppConnection';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Search, PinIcon, AlertCircle, ArrowLeft } from "lucide-react";
import { ConversationContextMenu } from './ConversationContextMenu';
import { useParams, useNavigate } from "react-router-dom";

export function RealWhatsAppMirror() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeChatName, setActiveChatName] = useState<string>('');
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Referência para scroll automático
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage, loadRealChats, loadRealMessages, isConversationPinned, 
    isConversationMarkedForAnalysis, getAnalysisPriority, isTranscribing } = useRealWhatsAppConnection();
  
  const navigate = useNavigate();
  
  // Carregar conversas ao iniciar
  useEffect(() => {
    loadChats();
  }, []);

  // Rolagem automática quando mensagens são carregadas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Função para carregar conversas
  const loadChats = async () => {
    try {
      setIsLoadingChats(true);
      const loadedChats = await loadRealChats();
      
      // Ordenar as conversas: primeiro as fixadas e depois por data da última mensagem
      const sortedChats = loadedChats
        .map((chat: any) => {
          // Extrair timestamp da última mensagem ou usar 0
          const lastMsgTime = chat.lastMessageTime || 
                               chat.t || 
                               (chat.timestamp ? new Date(chat.timestamp).getTime() : 0) ||
                               (chat.lastTime ? new Date(chat.lastTime).getTime() : 0) || 
                               0;
          
          return {
            ...chat,
            isGroupChat: chat.id?.endsWith('@g.us') || chat.isGroup === true,
            contactId: chat.id || chat.jid,
            isPinned: isConversationPinned(chat.id || chat.jid),
            sortTimestamp: lastMsgTime
          };
        })
        .sort((a: any, b: any) => {
          // Primeiro, ordenar por fixados
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          
          // Depois, ordenar por timestamp da última mensagem (mais recente primeiro)
          return b.sortTimestamp - a.sortTimestamp;
        });
      
      setChats(sortedChats);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Função para filtrar conversas pelo nome ou telefone
  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const name = (chat.name || chat.title || chat.contact?.name || 'Sem nome').toLowerCase();
    const phone = ((chat.id || chat.jid || '').replace('@c.us', '').replace('@g.us', '')).toLowerCase();
    
    return name.includes(searchLower) || phone.includes(searchLower);
  });

  // Função para carregar mensagens de uma conversa
  const handleChatClick = async (chatId: string, chatName: string) => {
    setActiveChat(chatId);
    setActiveChatName(chatName);
    setMessages([]);
    setIsLoadingMessages(true);
    
    try {
      const loadedMessages = await loadRealMessages(chatId);
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Função para enviar mensagem
  const handleSendMessage = async () => {
    if (!activeChat || !newMessage.trim()) return;
    
    setIsSendingMessage(true);
    
    try {
      // Tentar enviar a mensagem
      const success = await sendMessage(activeChat, newMessage.trim());
      
      if (success) {
        // Adicionar a mensagem localmente
        const localMessage = {
          id: `local_${Date.now()}`,
          fromMe: true,
          body: newMessage.trim(),
          processedText: newMessage.trim(),
          timestamp: new Date().getTime() / 1000
        };
        
        setMessages([...messages, localMessage]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Obter iniciais do nome para avatar
  const getNameInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name[0] || '?').toUpperCase();
  };

  // Formatar data/hora da mensagem
  const formatMessageTime = (timestamp: number): string => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determinar o nome de exibição para um chat
  const getChatDisplayName = (chat: any): string => {
    // Tentar vários caminhos possíveis para o nome
    return chat.name || 
           chat.title || 
           chat.contact?.name || 
           chat.contact?.pushname || 
           (chat.id || chat.jid || '').replace('@c.us', '').replace('@g.us', '') || 
           'Sem nome';
  };

  // Função para obter a cor do indicador de prioridade
  const getPriorityColor = (chatId: string): string => {
    if (!isConversationMarkedForAnalysis(chatId)) return '';
    
    const priority = getAnalysisPriority(chatId);
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  // Função para sair da conversa
  const handleBackToList = () => {
    setActiveChat(null);
    setMessages([]);
  };

  return (
    <div className="w-full h-[calc(100vh-12rem)] max-h-[calc(100vh-12rem)] bg-gray-100 rounded-lg overflow-hidden">
      <div className="flex h-full">
        {/* Lista de Chats (visível apenas quando nenhum chat estiver ativo em modo móvel) */}
        <div className={`w-full md:w-1/3 border-r border-gray-200 bg-white ${activeChat && 'hidden md:block'}`}>
          <div className="p-4 border-b border-gray-200">
            <div className="mb-3 relative">
              <Search className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Pesquisar conversas..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={loadChats}
              disabled={isLoadingChats}
            >
              {isLoadingChats ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar conversas'
              )}
            </Button>
          </div>
          <ScrollArea className="h-[calc(100%-5rem)] p-2">
            {filteredChats.map((chat) => (
              <ConversationContextMenu
                key={chat.contactId}
                chatId={chat.contactId}
                chatName={getChatDisplayName(chat)}
              >
                <div
                  className={`flex items-start p-3 mb-1 rounded-lg cursor-pointer hover:bg-gray-100 relative 
                    ${chat.contactId === activeChat ? 'bg-gray-100' : ''}`}
                  onClick={() => handleChatClick(
                    chat.contactId, 
                    getChatDisplayName(chat)
                  )}
                >
                  {/* Indicador de prioridade para análise */}
                  {isConversationMarkedForAnalysis(chat.contactId) && (
                    <div 
                      className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${getPriorityColor(chat.contactId)}`} 
                    />
                  )}
                  
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarFallback className={chat.isGroupChat ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                      {getNameInitials(getChatDisplayName(chat))}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium truncate">
                        {getChatDisplayName(chat)}
                        {chat.isPinned && (
                          <PinIcon className="h-3 w-3 ml-1 inline-block text-gray-500" />
                        )}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 truncate">
                      {chat.lastMessage || chat.contact?.status || ''}
                    </p>
                    
                    {isConversationMarkedForAnalysis(chat.contactId) && (
                      <Badge className="mt-1 text-xs bg-gray-100 text-gray-800 border border-gray-300">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Análise IA
                      </Badge>
                    )}
                  </div>
                </div>
              </ConversationContextMenu>
            ))}
            
            {isLoadingChats && filteredChats.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <Loader2 className="h-8 w-8 mb-2 mx-auto animate-spin" />
                <p>Carregando conversas...</p>
              </div>
            )}
            
            {!isLoadingChats && filteredChats.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <p>Nenhuma conversa encontrada</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Área de Chat (visível quando chat é selecionado, ou tela cheia em modo móvel) */}
        <div className={`w-full md:w-2/3 flex flex-col h-full ${!activeChat && 'hidden md:flex'} bg-white`}>
          {activeChat ? (
            <>
              <div className="p-4 border-b border-gray-200 bg-white flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-2 md:hidden" 
                  onClick={handleBackToList}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="font-semibold flex-1">{activeChatName}</h2>
                {isTranscribing && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Transcrevendo áudio...
                  </Badge>
                )}
              </div>
              
              <ScrollArea className="flex-1 p-4 bg-gray-50">
                {messages.length === 0 && isLoadingMessages && (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                )}
                
                {messages.length === 0 && !isLoadingMessages && (
                  <div className="flex justify-center py-10">
                    <p className="text-gray-500">Nenhuma mensagem encontrada.</p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex mb-3 ${message.fromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${
                        message.fromMe 
                          ? 'bg-green-500 text-white rounded-br-none' 
                          : 'bg-white border border-gray-200 rounded-bl-none'
                      }`}
                    >
                      {message.processedText || message.body || message.text || message.content || 'Mensagem sem texto'}
                      <div className={`text-xs mt-1 text-right ${message.fromMe ? 'text-green-100' : 'text-gray-500'}`}>
                        {formatMessageTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              <div className="p-3 border-t border-gray-200 bg-white">
                <form 
                  className="flex items-center"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 mr-2"
                    disabled={isSendingMessage}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={isSendingMessage || !newMessage.trim()}
                  >
                    {isSendingMessage ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <img src="/placeholder.svg" alt="WhatsApp" className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">WhatsApp Conectado</h3>
              <p className="text-gray-500 max-w-md mb-4">
                Selecione uma conversa à esquerda para começar a interagir.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
