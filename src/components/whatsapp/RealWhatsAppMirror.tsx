import React, { useState, useEffect } from 'react';
import { useWPPConnect } from '@/hooks/useWPPConnect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Send, Loader2, Play, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Chat {
  chatId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
  fromMe: boolean;
  chatId: string;
  isAudio?: boolean;
  status?: string;
}

export function RealWhatsAppMirror() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageText, setMessageText] = useState('');
  const { toast } = useToast();

  const {
    sessionStatus,
    chats,
    messages,
    isLoadingMessages,
    isLoadingChats,
    isLiveMode,
    currentChatId,
    loadRealChats,
    loadRealMessages,
    sendMessage,
    startLiveMode,
    stopLiveMode,
    forceSyncMessages,
    restartWhatsAppSession
  } = useWPPConnect();

  useEffect(() => {
    if (sessionStatus.isConnected) {
      loadRealChats();
    }
  }, [sessionStatus.isConnected, loadRealChats]);

  useEffect(() => {
    if (selectedChat) {
      loadRealMessages(selectedChat.chatId);
    }
  }, [selectedChat, loadRealMessages]);

  const handleChatClick = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async () => {
    if (!selectedChat) {
      toast({
        title: "Selecione uma conversa",
        description: "Escolha um contato ou grupo para enviar a mensagem",
        variant: "destructive"
      });
      return;
    }

    if (messageText.trim() === '') {
      toast({
        title: "Mensagem vazia",
        description: "Escreva algo antes de enviar",
        variant: "destructive"
      });
      return;
    }

    try {
      await sendMessage(selectedChat.chatId, messageText);
      setMessageText('');
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `há ${minutes} minutos`;
    } else if (hours < 24) {
      return `há ${hours} horas`;
    } else if (days === 1) {
      return 'ontem';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleForceSyncMessages = async () => {
    if (selectedChat) {
      await forceSyncMessages(selectedChat.chatId);
    }
  };

  const handleRestartSession = async () => {
    const success = await restartWhatsAppSession();
    if (success) {
      // Recarregar conversas após reiniciar
      setTimeout(() => {
        loadRealChats();
      }, 2000);
    }
  };

  return (
    <div className="flex h-[600px] bg-gray-50 border rounded-lg overflow-hidden">
      {/* Lista de Conversas */}
      <div className="w-1/3 bg-white border-r flex flex-col">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Conversas WhatsApp</h3>
            {sessionStatus.isConnected && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">Conectado</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mb-2">
            <Button 
              onClick={() => loadRealChats()} 
              disabled={isLoadingChats}
              size="sm"
              className="flex-1"
            >
              {isLoadingChats ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Conversas
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleRestartSession} 
              size="sm"
              variant="outline"
              title="Reiniciar sessão WhatsApp"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>

          {isLiveMode && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-600 font-medium">LIVE</span>
                <span className="text-xs text-gray-500">Atualizando a cada 3s</span>
              </div>
              <Button 
                onClick={stopLiveMode} 
                size="sm" 
                variant="outline"
                className="h-6 px-2 text-xs"
              >
                Parar
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 p-2">
          {chats.map((chat) => (
            <div
              key={chat.chatId}
              className={`p-3 rounded-lg hover:bg-gray-100 cursor-pointer ${
                selectedChat?.chatId === chat.chatId ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleChatClick(chat)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {chat.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{chat.name}</h4>
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                  </div>
                </div>
                <div>
                  <Badge className="bg-blue-100 text-blue-600">{chat.unreadCount}</Badge>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{formatTimestamp(chat.timestamp)}</p>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Header da Conversa */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {selectedChat.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{selectedChat.name}</h4>
                  <p className="text-sm text-gray-500">
                    {selectedChat.isGroup ? 'Grupo' : 'Contato'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isLiveMode && currentChatId === selectedChat.chatId && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-600 font-medium">LIVE</span>
                  </div>
                )}
                
                <Button 
                  onClick={handleForceSyncMessages}
                  size="sm"
                  variant="outline"
                  title="Forçar sincronização de mensagens"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
                
                <Button 
                  onClick={() => loadRealMessages(selectedChat.chatId)}
                  disabled={isLoadingMessages}
                  size="sm"
                  variant="outline"
                >
                  {isLoadingMessages ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                </Button>
                
                {!isLiveMode && (
                  <Button 
                    onClick={() => startLiveMode(selectedChat.chatId)}
                    size="sm"
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Live
                  </Button>
                )}
              </div>
            </div>

            {/* Área de Mensagens */}
            <ScrollArea className="flex-1 p-4">
              {messages
                .filter((msg) => msg.chatId === selectedChat.chatId)
                .map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-2 p-3 rounded-lg ${
                      msg.fromMe ? 'bg-blue-100 ml-auto text-right' : 'bg-gray-100 mr-auto'
                    }`}
                    style={{ maxWidth: '80%' }}
                  >
                    <p className="text-sm text-gray-800">{msg.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatTimestamp(msg.timestamp)}</p>
                  </div>
                ))}
            </ScrollArea>

            {/* Form de Envio */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center">
                <Input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  className="flex-1 rounded-l-md"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  className="rounded-l-none"
                  onClick={handleSendMessage}
                >
                  Enviar
                  <Send className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Selecione uma conversa para visualizar as mensagens.</p>
          </div>
        )}
      </div>
    </div>
  );
}
