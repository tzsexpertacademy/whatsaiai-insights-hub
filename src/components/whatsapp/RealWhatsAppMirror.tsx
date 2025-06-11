
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRealWhatsAppConnection } from "@/hooks/useRealWhatsAppConnection";
import { 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  MessageSquare, 
  Send,
  Wifi,
  Clock,
  User,
  AlertCircle,
  RefreshCw,
  Settings,
  Key,
  Server,
  Lock
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface Message {
  id: string;
  contactId: string;
  text: string;
  sent: boolean;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export function RealWhatsAppMirror() {
  const { toast } = useToast();
  const { 
    connectionState, 
    isLoading, 
    webhooks, 
    wppConfig,
    updateWebhooks, 
    updateWPPConfig,
    generateQRCode, 
    checkConnectionStatus,
    disconnectWhatsApp,
    sendMessage: sendWhatsAppMessage,
    loadRealChats,
    loadRealMessages,
    getConnectionStatus 
  } = useRealWhatsAppConnection();
  
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  const connectionStatus = getConnectionStatus();
  const isConnected = connectionState.isConnected;

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
      console.log('🔄 Iniciando carregamento de conversas...');
      const chatsData = await loadRealChats();
      
      console.log('📋 Dados recebidos:', chatsData);
      
      if (!chatsData || chatsData.length === 0) {
        console.log('⚠️ Nenhuma conversa encontrada');
        setContacts([]);
        toast({
          title: "Nenhuma conversa encontrada",
          description: "Não há conversas disponíveis no momento",
          variant: "destructive"
        });
        return;
      }
      
      const realContacts: Contact[] = chatsData.map((chat: any, index: number) => {
        console.log(`📱 Processando chat ${index}:`, chat);
        
        return {
          id: chat.id || chat.chatId || `chat_${index}`,
          name: chat.name || chat.contact?.name || chat.title || 'Contato sem nome',
          phone: chat.phone || chat.contact?.phone || chat.id || 'Número não disponível',
          lastMessage: chat.lastMessage?.body || chat.lastMessage?.text || 'Sem mensagens',
          timestamp: chat.lastMessage?.timestamp || chat.timestamp || new Date().toISOString(),
          unread: chat.unreadCount || chat.unread || 0
        };
      });
      
      console.log('✅ Conversas processadas:', realContacts);
      setContacts(realContacts);
      
      toast({
        title: "Conversas carregadas! 📱",
        description: `${realContacts.length} conversas encontradas`
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      
      // Limpar estado em caso de erro
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
      
      const realMessages: Message[] = messagesData.map((msg: any, index: number) => ({
        id: msg.id || `msg_${index}`,
        contactId: contactId,
        text: msg.body || msg.text || 'Mensagem sem texto',
        sent: msg.fromMe || false,
        timestamp: msg.timestamp || new Date().toISOString(),
        status: msg.ack ? 'delivered' : 'sent'
      }));
      
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
    console.log('📱 Selecionando contato:', contact.name);
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

    console.log('📤 Enviando mensagem real via WPPConnect...');

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
      const success = await sendWhatsAppMessage(contact.phone, messageText);
      
      if (success) {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        ));
        
        toast({
          title: "Mensagem enviada! ✅",
          description: "Mensagem enviada via WPPConnect"
        });
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'sent' } : msg
        ));
      }
    } catch (error) {
      console.error('❌ Erro ao enviar:', error);
    }
  };

  const handleCheckStatus = async () => {
    console.log('🔍 Verificando status manualmente...');
    toast({
      title: "Verificando status...",
      description: "Consultando servidor WPPConnect"
    });
    
    await checkConnectionStatus();
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
    if (connectionStatus === 'active') {
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
          {/* Lista de Contatos REAL */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversas REAIS
                </CardTitle>
                <Badge variant="secondary">{contacts.length}</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {contacts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
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
                  </div>
                ) : (
                  contacts.map((contact) => (
                    <div 
                      key={contact.id}
                      onClick={() => selectContact(contact)}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedContact === contact.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{contact.name}</span>
                            <span className="text-xs text-gray-400">{formatTime(contact.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-500 truncate mt-1">{contact.lastMessage}</p>
                          <p className="text-xs text-gray-400">{contact.phone}</p>
                        </div>
                        {contact.unread > 0 && (
                          <Badge className="bg-green-500 text-white">{contact.unread}</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Área de Chat REAL */}
          <Card className="lg:col-span-2">
            {selectedContact ? (
              <>
                <CardHeader className="pb-3">
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
                </CardHeader>
                
                <CardContent className="flex flex-col h-[500px]">
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {messages
                      .filter(msg => msg.contactId === selectedContact)
                      .map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`rounded-lg px-4 py-2 max-w-[75%] ${
                              msg.sent
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <div className={`text-xs mt-1 flex items-center justify-between ${
                              msg.sent ? 'text-green-100' : 'text-gray-500'
                            }`}>
                              <span>{formatTime(msg.timestamp)}</span>
                              {msg.sent && (
                                <span className="ml-2">{getStatusIcon(msg.status)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex gap-3">
                      <Input 
                        placeholder="Digite uma mensagem REAL..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
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
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Selecione uma conversa REAL</h3>
                  <p className="text-sm">Escolha um contato para ver as mensagens reais</p>
                  <p className="text-xs mt-2">💡 Conectado via WPPConnect API</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
