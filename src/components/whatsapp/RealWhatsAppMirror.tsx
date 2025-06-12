
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useRealWhatsAppConnection } from '@/hooks/useRealWhatsAppConnection';
import { useConversationPersistence } from '@/hooks/useConversationPersistence';
import { ConversationContextMenu } from './ConversationContextMenu';
import { 
  Smartphone, 
  Send, 
  RefreshCw, 
  MessageSquare, 
  Phone, 
  QrCode,
  Settings,
  Database,
  Pin,
  Brain
} from 'lucide-react';

export function RealWhatsAppMirror() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageText, setMessageText] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    connectionState,
    isLoading,
    generateQRCode,
    checkConnectionStatus,
    disconnectWhatsApp,
    sendMessage,
    loadRealChats,
    loadRealMessages,
    getConnectionStatus,
    transcribeAudio,
    togglePinConversation,
    toggleAnalysisConversation,
    isConversationPinned,
    isConversationMarkedForAnalysis,
    getAnalysisPriority,
    pinnedConversations,
    messageHistoryLimit,
    updateMessageHistoryLimit
  } = useRealWhatsAppConnection();
  
  const { verifyConversationInDatabase, savePinnedConversations } = useConversationPersistence();

  // Helper function to get chat display name
  const getChatDisplayName = (chat: any) => {
    return chat.name || 
           chat.formattedName || 
           chat.pushname || 
           chat.shortName || 
           chat.verifiedName || 
           chat.contact || 
           chat.id || 
           'Contato sem nome';
  };

  // Helper function to get chat ID
  const getChatId = (chat: any) => {
    return chat.id || chat.contact || chat.chatId;
  };

  // Função para verificar se conversas fixadas estão no banco
  const checkPinnedConversationsInDatabase = async () => {
    console.log('🔍 Verificando conversas fixadas no banco de dados...');
    
    const pinnedChats = chats.filter(chat => 
      pinnedConversations.some(pinned => 
        pinned.chatId === getChatId(chat)
      )
    );

    if (pinnedChats.length === 0) {
      console.log('📌 Nenhuma conversa fixada encontrada');
      return;
    }

    console.log(`📌 Verificando ${pinnedChats.length} conversas fixadas...`);

    for (const chat of pinnedChats) {
      const chatId = getChatId(chat);
      const isInDatabase = await verifyConversationInDatabase(chatId);
      
      if (!isInDatabase) {
        console.log(`💾 Conversa fixada ${chatId} não está no banco, carregando mensagens...`);
        
        try {
          const messages = await loadRealMessages(chatId);
          if (messages && messages.length > 0) {
            console.log(`💾 Salvando ${messages.length} mensagens da conversa fixada ${chatId}`);
          }
        } catch (error) {
          console.error(`❌ Erro ao processar conversa fixada ${chatId}:`, error);
        }
      } else {
        console.log(`✅ Conversa fixada ${chatId} já está no banco`);
      }
    }
  };

  // Verificar conversas fixadas no banco quando as conversas são carregadas
  useEffect(() => {
    if (chats.length > 0 && pinnedConversations.length > 0) {
      checkPinnedConversationsInDatabase();
    }
  }, [chats, pinnedConversations]);

  useEffect(() => {
    setConnectionStatus(getConnectionStatus());
  }, [connectionState, getConnectionStatus]);

  useEffect(() => {
    const loadChatsAndMessages = async () => {
      try {
        const loadedChats = await loadRealChats();
        setChats(loadedChats);
      } catch (error) {
        console.error('Erro ao carregar conversas:', error);
      }
    };

    loadChatsAndMessages();
  }, [loadRealChats]);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (phoneNumber && messageText) {
      const success = await sendMessage(phoneNumber, messageText);
      if (success) {
        setMessageText('');
      }
    }
  };

  const handleChatClick = async (chat: any) => {
    setSelectedChat(chat);
    try {
      const contactId = getChatId(chat);
      const loadedMessages = await loadRealMessages(contactId);
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      setMessages([]);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Espelho do WhatsApp Real
        </h2>
        <p className="text-slate-600">
          Visualize e interaja com o WhatsApp Business real
        </p>
      </div>

      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Status: {connectionStatus}
              </p>
              <p className="text-sm text-muted-foreground">
                {connectionState.phoneNumber ? `Conectado como ${connectionState.phoneNumber}` : 'Não conectado'}
              </p>
            </div>
            {connectionStatus === 'disconnected' ? (
              <Button onClick={generateQRCode} disabled={isLoading} className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                {isLoading ? 'Carregando...' : 'Gerar QR Code'}
              </Button>
            ) : (
              <Button onClick={disconnectWhatsApp} variant="destructive" disabled={isLoading} className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Desconectar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status do Banco de Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status do Banco de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Conversas fixadas: {pinnedConversations.length}
              </p>
              <p className="text-xs text-gray-500">
                As conversas fixadas são automaticamente salvas no banco
              </p>
            </div>
            <Button
              onClick={checkPinnedConversationsInDatabase}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Verificar Banco
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuração de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Histórico</CardTitle>
          <CardDescription>Ajuste quantas mensagens carregar por conversa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="history-limit">
              Limite de mensagens: {messageHistoryLimit}
            </Label>
            <Slider
              id="history-limit"
              min={10}
              max={1000}
              step={10}
              value={[messageHistoryLimit]}
              onValueChange={(value) => updateMessageHistoryLimit(value[0])}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Valores maiores podem demorar mais para carregar
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>Ajuste as configurações de envio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Número de Telefone</Label>
            <Input
              id="phone"
              placeholder="Número com código do país"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Input
              id="message"
              placeholder="Digite sua mensagem"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
          </div>
          <Button onClick={handleSendMessage} className="w-full flex items-center gap-2 justify-center">
            <Send className="h-4 w-4" />
            Enviar Mensagem
          </Button>
        </CardContent>
      </Card>

      {/* Área de Conversas e Mensagens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Conversas */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Conversas</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] overflow-y-auto">
              <ul className="space-y-2">
                {chats.map((chat, index) => {
                  const chatId = getChatId(chat);
                  const displayName = getChatDisplayName(chat);
                  
                  return (
                    <li key={chatId || index}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start rounded-md hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleChatClick(chat)}
                      >
                        <ConversationContextMenu
                          chatId={chatId}
                          isPinned={isConversationPinned(chatId)}
                          isMarkedForAnalysis={isConversationMarkedForAnalysis(chatId)}
                          analysisPriority={getAnalysisPriority(chatId)}
                          onTogglePin={togglePinConversation}
                          onToggleAnalysis={toggleAnalysisConversation}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              {isConversationPinned(chatId) && (
                                <Pin className="h-4 w-4 text-blue-500" />
                              )}
                              {isConversationMarkedForAnalysis(chatId) && (
                                <Brain className="h-4 w-4 text-green-500" />
                              )}
                              <span className="truncate">{displayName}</span>
                            </div>
                            {/* Badge com o tipo de contato */}
                            {(chat.isGroup || chat.type === 'group') && (
                              <Badge variant="secondary">Grupo</Badge>
                            )}
                            {chat.isBusiness && (
                              <Badge variant="outline">Business</Badge>
                            )}
                          </div>
                        </ConversationContextMenu>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Exibição de Mensagens */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedChat ? `Mensagens de ${getChatDisplayName(selectedChat)}` : 'Selecione uma conversa'}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${msg.fromMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${msg.fromMe ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      <p>{msg.processedText || msg.body || msg.text || 'Mensagem sem texto'}</p>
                      <span className="text-xs text-gray-500">{formatTimestamp(msg.timestamp)}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
