
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
    disconnectWhatsApp,
    sendMessage: sendWhatsAppMessage,
    getConnectionStatus 
  } = useRealWhatsAppConnection();
  
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Estados reais da API WPPConnect - SEM SIMULAÇÃO
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const connectionStatus = getConnectionStatus();
  const isConnected = connectionState.isConnected;

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Carregar conversas reais da API quando conectar
  useEffect(() => {
    if (isConnected) {
      loadRealChats();
    }
  }, [isConnected]);

  const loadRealChats = async () => {
    console.log('📱 Carregando conversas reais da API WPPConnect...');
    
    try {
      // Usar endpoint correto com token
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/${wppConfig.token}/all-chats`);

      if (response.ok) {
        const chatsData = await response.json();
        console.log('✅ Conversas carregadas:', chatsData);
        
        // Converter dados da API para o formato do componente
        const realContacts: Contact[] = chatsData.map((chat: any, index: number) => ({
          id: chat.id || `chat_${index}`,
          name: chat.name || chat.contact?.name || 'Contato sem nome',
          phone: chat.phone || chat.contact?.phone || 'Número não disponível',
          lastMessage: chat.lastMessage?.body || 'Sem mensagens',
          timestamp: chat.lastMessage?.timestamp || new Date().toISOString(),
          unread: chat.unreadCount || 0
        }));
        
        setContacts(realContacts);
        
        toast({
          title: "Conversas carregadas! 📱",
          description: `${realContacts.length} conversas encontradas`
        });
      } else {
        console.error('❌ Erro ao carregar conversas:', response.status);
        toast({
          title: "Erro ao carregar conversas",
          description: "Verifique se o WPPConnect está rodando",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro de conexão:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar com a API",
        variant: "destructive"
      });
    }
  };

  const loadRealMessages = async (contactId: string) => {
    console.log('📤 Carregando mensagens reais para:', contactId);
    
    try {
      // Usar endpoint correto com token
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/${wppConfig.token}/get-messages/${contactId}`);

      if (response.ok) {
        const messagesData = await response.json();
        console.log('✅ Mensagens carregadas:', messagesData);
        
        // Converter mensagens da API para o formato do componente
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
        
      } else {
        console.error('❌ Erro ao carregar mensagens:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
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
    
    // Carregar mensagens reais deste contato
    loadRealMessages(contact.id);
    
    // Marcar como lido
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

    // Enviar via API WPPConnect REAL
    try {
      const success = await sendWhatsAppMessage(contact.phone, messageText);
      
      if (success) {
        // Atualizar status da mensagem
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        ));
        
        toast({
          title: "Mensagem enviada! ✅",
          description: "Mensagem enviada via WPPConnect"
        });
      } else {
        // Falha no envio
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'sent' } : msg
        ));
      }
    } catch (error) {
      console.error('❌ Erro ao enviar:', error);
    }
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
      {/* Configuração WPPConnect */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Server className="h-5 w-5" />
            Configuração WPPConnect
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
            >
              <Settings className="h-4 w-4 mr-1" />
              {showConfig ? 'Ocultar' : 'Configurar'}
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Configure sua conexão com o servidor WPPConnect
          </CardDescription>
        </CardHeader>
        
        {showConfig && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionName" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Nome da Sessão
                </Label>
                <Input
                  id="sessionName"
                  value={wppConfig.sessionName || ''}
                  onChange={(e) => updateWPPConfig({ sessionName: e.target.value })}
                  placeholder="NERDWHATS_AMERICA"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secretKey" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Secret Key
                </Label>
                <Input
                  id="secretKey"
                  value={wppConfig.secretKey || ''}
                  onChange={(e) => updateWPPConfig({ secretKey: e.target.value })}
                  placeholder="THISISMYSECURETOKEN"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="token" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Token Gerado
              </Label>
              <Input
                id="token"
                value={wppConfig.token || ''}
                onChange={(e) => updateWPPConfig({ token: e.target.value })}
                placeholder="$2b$10$jKW5P3gzFYntHqLs0ttw2uRsoFGIxfiM6u4GSMWhsej15Kh6_ZyDa"
                className="font-mono text-xs"
              />
              <p className="text-xs text-blue-600">
                Este é o token gerado pelo endpoint /generate-token
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serverUrl" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                URL do Servidor
              </Label>
              <Input
                id="serverUrl"
                value={wppConfig.serverUrl || ''}
                onChange={(e) => updateWPPConfig({ serverUrl: e.target.value })}
                placeholder="http://localhost:21465"
              />
            </div>
          </CardContent>
        )}
      </Card>

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
              {isConnected && (
                <>
                  <Button onClick={loadRealChats} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Atualizar Conversas
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
                      onClick={loadRealChats}
                      className="mt-2"
                    >
                      Carregar Conversas
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
                  {/* Mensagens REAIS */}
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

                  {/* Enviar Mensagem REAL */}
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

      {/* Status da API */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Status da API WPPConnect</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700">
            <p><strong>🔗 URL:</strong> {wppConfig.serverUrl || 'Não configurado'}</p>
            <p><strong>🔑 Secret Key:</strong> {wppConfig.secretKey || 'Não configurado'}</p>
            <p><strong>🔐 Token:</strong> {wppConfig.token ? `${wppConfig.token.substring(0, 20)}...` : 'Não configurado'}</p>
            <p><strong>📡 Sessão:</strong> {wppConfig.sessionName || 'Não configurado'}</p>
            <p><strong>📡 Status:</strong> {isConnected ? '✅ Conectado' : '❌ Desconectado'}</p>
            <p className="mt-2 text-blue-600">
              Esta é a conexão REAL com sua API WPPConnect. Configure os campos acima!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
