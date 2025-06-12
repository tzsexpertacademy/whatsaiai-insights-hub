import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRealWhatsAppConnection } from "@/hooks/useRealWhatsAppConnection";
import { ConversationContextMenu } from "./ConversationContextMenu";
import { 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  MessageSquare, 
  Send,
  Clock,
  User,
  AlertCircle,
  RefreshCw,
  Settings,
  Pin,
  Brain,
  Star,
  TrendingUp,
  AlertTriangle,
  Search,
  Volume2
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  lastMessageTimestamp?: number;
}

interface Message {
  id: string;
  contactId: string;
  text: string;
  sent: boolean;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isAudio?: boolean;
}

export function RealWhatsAppMirror() {
  const { toast } = useToast();
  const { 
    connectionState, 
    isLoading, 
    webhooks, 
    wppConfig,
    messageHistoryLimit,
    updateWebhooks, 
    updateWPPConfig,
    updateMessageHistoryLimit,
    generateQRCode, 
    checkConnectionStatus,
    disconnectWhatsApp,
    sendMessage: sendWhatsAppMessage,
    loadRealChats,
    loadRealMessages,
    getConnectionStatus,
    togglePinConversation,
    toggleAnalysisConversation,
    isConversationPinned,
    isConversationMarkedForAnalysis,
    getAnalysisPriority
  } = useRealWhatsAppConnection();
  
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistoryConfig, setShowHistoryConfig] = useState(false);
  const [tempHistoryLimit, setTempHistoryLimit] = useState(messageHistoryLimit);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentConnectionStatus, setCurrentConnectionStatus] = useState<'active' | 'inactive'>('inactive');
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  const isConnected = connectionState.isConnected;

  // Check connection status on mount and periodically
  useEffect(() => {
    const checkStatus = async () => {
      const status = await getConnectionStatus();
      setCurrentConnectionStatus(status.connected ? 'active' : 'inactive');
    };
    checkStatus();
  }, [getConnectionStatus]);

  // Helper functions
  const extractPhoneNumber = (phoneData: any): string => {
    if (typeof phoneData === 'string') {
      return phoneData;
    }
    if (phoneData && typeof phoneData === 'object') {
      if (phoneData._serialized) return phoneData._serialized;
      if (phoneData.user) return phoneData.user;
      if (phoneData.number) return phoneData.number;
    }
    return 'Número não disponível';
  };

  const extractContactName = (chat: any): string => {
    if (chat.name) return chat.name;
    if (chat.contact?.name) return chat.contact.name;
    if (chat.contact?.formattedName) return chat.contact.formattedName;
    if (chat.contact?.pushname) return chat.contact.pushname;
    if (chat.title) return chat.title;
    
    const phoneNumber = extractPhoneNumber(chat.id || chat.contact?.id || chat.phone);
    if (phoneNumber && phoneNumber !== 'Número não disponível') {
      if (phoneNumber.includes('@g.us')) {
        return chat.id || 'Grupo sem nome';
      }
      const cleanNumber = phoneNumber.replace('@c.us', '');
      return `+${cleanNumber}`;
    }
    
    return 'Contato sem nome';
  };

  const extractPhoneForSending = (contact: Contact): string => {
    return contact.phone;
  };

  const extractTimestamp = (chat: any): number => {
    if (chat.lastMessage?.timestamp) {
      return typeof chat.lastMessage.timestamp === 'number' 
        ? chat.lastMessage.timestamp 
        : new Date(chat.lastMessage.timestamp).getTime();
    }
    
    if (chat.timestamp) {
      return typeof chat.timestamp === 'number'
        ? chat.timestamp
        : new Date(chat.timestamp).getTime();
    }
    
    if (chat.t) {
      return chat.t * 1000;
    }
    
    if (chat.lastMessageTime) {
      return typeof chat.lastMessageTime === 'number'
        ? chat.lastMessageTime
        : new Date(chat.lastMessageTime).getTime();
    }
    
    return new Date().getTime();
  };

  // Função para filtrar e ordenar conversas
  const filteredAndSortedContacts = useMemo(() => {
    let filtered = contacts;
    
    if (searchTerm.trim()) {
      filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return [...filtered].sort((a, b) => {
      const aPinned = isConversationPinned(a.id);
      const bPinned = isConversationPinned(b.id);
      
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      
      const aTime = a.lastMessageTimestamp || new Date(a.timestamp).getTime();
      const bTime = b.lastMessageTimestamp || new Date(b.timestamp).getTime();
      
      return bTime - aTime;
    });
  }, [contacts, searchTerm, isConversationPinned]);

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'medium': return <TrendingUp className="h-3 w-3 text-yellow-500" />;
      case 'low': return <Star className="h-3 w-3 text-blue-500" />;
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isConnected) {
      handleLoadRealChats();
    }
  }, [isConnected]);

  const handleLoadRealChats = async () => {
    if (!isConnected) {
      toast({
        title: "WhatsApp não conectado",
        description: "Conecte seu WhatsApp primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingChats(true);
    
    try {
      const chatsData = await loadRealChats();
      
      if (!chatsData || chatsData.length === 0) {
        setContacts([]);
        toast({
          title: "Nenhuma conversa encontrada",
          description: "Não há conversas disponíveis no momento",
          variant: "destructive"
        });
        return;
      }
      
      const realContacts: Contact[] = chatsData.map((chat: any, index: number) => {
        const chatId = chat.id?._serialized || chat.id || chat.chatId || `chat_${index}`;
        const phoneNumber = extractPhoneNumber(chat.id || chat.contact?.id || chat.phone);
        const lastMessageTimestamp = extractTimestamp(chat);
        
        return {
          id: chatId,
          name: extractContactName(chat),
          phone: phoneNumber,
          lastMessage: chat.lastMessage?.body || chat.lastMessage?.text || chat.chatlistPreview?.reactionText || 'Sem mensagens',
          timestamp: new Date(lastMessageTimestamp).toISOString(),
          lastMessageTimestamp: lastMessageTimestamp,
          unread: chat.unreadCount || chat.unread || 0
        };
      });
      
      setContacts(realContacts);
      
      toast({
        title: "Conversas carregadas! 📱",
        description: `${realContacts.length} conversas encontradas`
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      
      setContacts([]);
      
      toast({
        title: "Erro ao carregar conversas",
        description: error instanceof Error ? error.message : "Verifique se o WPPConnect está rodando corretamente",
        variant: "destructive"
      });
    } finally {
      setIsLoadingChats(false);
    }
  };

  const handleLoadRealMessages = async (contactId: string) => {
    try {
      const messagesData = await loadRealMessages(contactId);
      
      if (!Array.isArray(messagesData)) {
        toast({
          title: "Erro ao carregar mensagens",
          description: "Formato de dados inválido",
          variant: "destructive"
        });
        return;
      }
      
      const realMessages: Message[] = messagesData.map((msg: any, index: number) => {
        const text = msg.processedText || msg.body || msg.text || msg.content || 'Mensagem sem texto';
        const isAudio = text.includes('🎤 [Áudio]');
        
        return {
          id: msg.id || `msg_${index}`,
          contactId: contactId,
          text: text,
          sent: msg.fromMe || false,
          timestamp: msg.timestamp ? new Date(msg.timestamp * 1000).toISOString() : new Date().toISOString(),
          status: msg.ack ? 'delivered' : 'sent',
          isAudio: isAudio
        };
      });
      
      setMessages(prev => [
        ...prev.filter(m => m.contactId !== contactId),
        ...realMessages
      ]);
      
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive"
      });
    }
  };

  const handleGenerateQR = async () => {
    const qrUrl = await generateQRCode();
    if (qrUrl) {
      toast({
        title: "QR Code gerado! 📱",
        description: "Escaneie com WhatsApp Business para conectar"
      });
    }
  };

  const selectContact = (contact: Contact) => {
    setSelectedContact(contact.id);
    handleLoadRealMessages(contact.id);
    setContacts(prev => prev.map(c => 
      c.id === contact.id ? { ...c, unread: 0 } : c
    ));
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const contact = contacts.find(c => c.id === selectedContact);
    if (!contact) return;

    const message: Message = {
      id: Date.now().toString(),
      contactId: selectedContact,
      text: newMessage,
      sent: true,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, message]);
    const messageText = newMessage;
    setNewMessage('');

    try {
      const phoneForSending = extractPhoneForSending(contact);
      const success = await sendWhatsAppMessage(phoneForSending, messageText);
      
      if (success) {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        ));
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'sent', text: `❌ ${msg.text} (Erro no envio)` } : msg
        ));
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'sent', text: `❌ ${msg.text} (Erro de conexão)` } : msg
      ));
      
      toast({
        title: "❌ Erro ao enviar",
        description: "Verifique se o WPPConnect está rodando e conectado",
        variant: "destructive"
      });
    }
  };

  const handleCheckStatus = async () => {
    toast({
      title: "Verificando status...",
      description: "Consultando servidor WPPConnect"
    });
    
    await checkConnectionStatus();
  };

  const handleUpdateHistoryLimit = () => {
    updateMessageHistoryLimit(tempHistoryLimit);
    setShowHistoryConfig(false);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending': return '🕐';
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  };

  const getConnectionStatusInfo = () => {
    if (currentConnectionStatus === 'active') {
      return {
        icon: <CheckCircle className="h-6 w-6 text-green-500" />,
        text: 'Conectado e Ativo',
        color: 'text-green-600'
      };
    }
    return {
      icon: <AlertCircle className="h-6 w-6 text-gray-400" />,
      text: 'Desconectado',
      color: 'text-gray-600'
    };
  };

  const statusInfo = getConnectionStatusInfo();

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Smartphone className="h-5 w-5" />
            WPPConnect Real - {wppConfig.sessionName}
            {isConnected && <CheckCircle className="h-5 w-5 text-green-500" />}
          </CardTitle>
          <CardDescription className="text-green-700">
            Conecta seu WhatsApp via WPPConnect API ({wppConfig.serverUrl})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {statusInfo.icon}
              <div>
                <span className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
                {connectionState.phoneNumber && (
                  <p className="text-sm text-gray-500">{connectionState.phoneNumber}</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCheckStatus} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Verificar Status
              </Button>
              
              {isConnected && (
                <>
                  <Button 
                    onClick={() => setShowHistoryConfig(!showHistoryConfig)} 
                    variant="outline" 
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Histórico ({messageHistoryLimit})
                  </Button>
                  <Button 
                    onClick={handleLoadRealChats} 
                    variant="outline" 
                    size="sm"
                    disabled={isLoadingChats}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingChats ? 'animate-spin' : ''}`} />
                    {isLoadingChats ? 'Carregando...' : 'Carregar Conversas'}
                  </Button>
                  <Button onClick={disconnectWhatsApp} variant="outline" size="sm">
                    Desconectar
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Configuração de Histórico */}
          {showHistoryConfig && (
            <Card className="mb-4 border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Configurar Histórico de Mensagens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Label htmlFor="historyLimit" className="text-sm">Limite:</Label>
                  <Input
                    id="historyLimit"
                    type="number"
                    min="10"
                    max="1000"
                    value={tempHistoryLimit}
                    onChange={(e) => setTempHistoryLimit(parseInt(e.target.value) || 50)}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">mensagens</span>
                  <Button onClick={handleUpdateHistoryLimit} size="sm">
                    Aplicar
                  </Button>
                  <Button onClick={() => setShowHistoryConfig(false)} variant="outline" size="sm">
                    Cancelar
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Maior histórico pode levar mais tempo para carregar e consumir mais recursos.
                </p>
              </CardContent>
            </Card>
          )}

          {!isConnected && !connectionState.qrCode && (
            <Button 
              onClick={handleGenerateQR} 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando QR Code...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Conectar WPPConnect Real
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* QR Code para Conexão */}
      {connectionState.qrCode && !isConnected && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <QrCode className="h-5 w-5" />
              Escaneie com WhatsApp Business
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-white p-6 rounded-lg inline-block mb-4 shadow-lg">
              <img 
                src={connectionState.qrCode} 
                alt="QR Code WhatsApp Business" 
                className="w-80 h-80 mx-auto"
              />
            </div>
            <div className="space-y-3">
              <div className="text-sm text-blue-700 space-y-2">
                <p><strong>1.</strong> Abra o WhatsApp Business no seu celular</p>
                <p><strong>2.</strong> Toque em <strong>Menu (⋮) → Dispositivos conectados</strong></p>
                <p><strong>3.</strong> Toque em <strong>"Conectar um dispositivo"</strong></p>
                <p><strong>4.</strong> Escaneie este código QR</p>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-700 text-sm font-medium">
                  🔄 Aguardando você escanear o QR Code...
                </p>
                <Button 
                  onClick={handleCheckStatus} 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Verificar se conectou
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interface de Conversas REAL */}
      {isConnected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
          {/* Lista de Contatos REAL com Pesquisa */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversas REAIS
                </CardTitle>
                <Badge variant="secondary">{filteredAndSortedContacts.length}</Badge>
              </div>
              
              {/* Barra de Pesquisa */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Pin className="h-3 w-3" />
                <span>Clique direito para fixar/analisar</span>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {filteredAndSortedContacts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? (
                      <>
                        <Search className="h-8 w-8 mx-auto mb-2" />
                        <p>Nenhuma conversa encontrada</p>
                        <p className="text-xs">para "{searchTerm}"</p>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                        <p>Nenhuma conversa encontrada</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleLoadRealChats}
                          disabled={isLoadingChats}
                          className="mt-2"
                        >
                          {isLoadingChats ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                              Carregando...
                            </>
                          ) : (
                            'Carregar Conversas'
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  filteredAndSortedContacts.map((contact) => {
                    const isPinned = isConversationPinned(contact.id);
                    const isMarkedForAnalysis = isConversationMarkedForAnalysis(contact.id);
                    const analysisPriority = getAnalysisPriority(contact.id);

                    return (
                      <ConversationContextMenu
                        key={contact.id}
                        chatId={contact.id}
                        isPinned={isPinned}
                        isMarkedForAnalysis={isMarkedForAnalysis}
                        analysisPriority={analysisPriority}
                        onTogglePin={togglePinConversation}
                        onToggleAnalysis={toggleAnalysisConversation}
                      >
                        <div 
                          onClick={() => selectContact(contact)}
                          className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedContact === contact.id ? 'bg-blue-50 border-blue-200' : ''
                          } ${isPinned ? 'bg-yellow-50 border-l-4 border-l-yellow-400' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center relative">
                              <User className="h-6 w-6 text-green-600" />
                              {isPinned && (
                                <Pin className="absolute -top-1 -right-1 h-4 w-4 text-yellow-600 fill-current" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{contact.name}</span>
                                  {isMarkedForAnalysis && (
                                    <div className="flex items-center gap-1">
                                      <Brain className="h-3 w-3 text-green-600" />
                                      {getPriorityIcon(analysisPriority)}
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400">{formatTime(contact.timestamp)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500 truncate pr-2">{contact.lastMessage}</p>
                                {contact.unread > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {contact.unread}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </ConversationContextMenu>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Área de Chat */}
          <Card className="lg:col-span-2">
            {selectedContact ? (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {contacts.find(c => c.id === selectedContact)?.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {contacts.find(c => c.id === selectedContact)?.phone}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {messages.filter(m => m.contactId === selectedContact).length} mensagens
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  {/* Mensagens */}
                  <div className="h-[400px] overflow-y-auto p-4 space-y-3">
                    {messages
                      .filter(m => m.contactId === selectedContact)
                      .map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-3 py-2 rounded-lg ${
                              message.sent
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {message.isAudio && <Volume2 className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                              <div className="flex-1">
                                <p className="text-sm">{message.text}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs opacity-70">
                                    {formatTime(message.timestamp)}
                                  </span>
                                  {message.sent && (
                                    <span className="text-xs opacity-70">
                                      {getStatusIcon(message.status)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Input de Mensagem */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>Selecione uma conversa para começar</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
