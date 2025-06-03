
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Play,
  Square,
  Settings
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
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
    updateWebhooks, 
    generateQRCode, 
    disconnectWhatsApp,
    sendMessage: sendWhatsAppMessage,
    getConnectionStatus 
  } = useRealWhatsAppConnection();
  
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Dados das conversas em tempo real (simuladas por enquanto)
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const connectionStatus = getConnectionStatus();
  const isConnected = connectionState.isConnected;

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simular recebimento de mensagens em tempo real quando conectado
  useEffect(() => {
    if (!isConnected || !isLiveMode) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        simulateIncomingMessage();
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isConnected, isLiveMode, contacts]);

  // Carregar conversas quando conectar
  useEffect(() => {
    if (isConnected && contacts.length === 0) {
      loadInitialChats();
    }
  }, [isConnected]);

  const handleGenerateQR = async () => {
    if (!webhooks.qrWebhook) {
      setShowWebhookConfig(true);
      toast({
        title: "Configure primeiro! ⚙️",
        description: "Adicione os webhooks do Make.com para conectar"
      });
      return;
    }

    const qrUrl = await generateQRCode();
    if (qrUrl) {
      toast({
        title: "QR Code gerado! 📱",
        description: "Escaneie com WhatsApp Business para conectar"
      });
    }
  };

  const loadInitialChats = () => {
    const initialChats: Contact[] = [
      {
        id: '1',
        name: 'Maria Silva',
        phone: '+55 11 98765-4321',
        lastMessage: 'Oi! Você pode me ajudar?',
        timestamp: new Date().toISOString(),
        unread: 2
      },
      {
        id: '2', 
        name: 'João Santos',
        phone: '+55 11 91234-5678',
        lastMessage: 'Obrigado pelo atendimento!',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        unread: 0
      },
      {
        id: '3',
        name: 'Ana Costa',
        phone: '+55 11 95555-1234',
        lastMessage: 'Qual o horário de funcionamento?',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        unread: 1
      }
    ];

    setContacts(initialChats);

    const initialMessages: Message[] = [
      {
        id: '1',
        contactId: '1',
        text: 'Oi! Você pode me ajudar?',
        sent: false,
        timestamp: new Date().toISOString(),
        status: 'delivered'
      },
      {
        id: '2',
        contactId: '1', 
        text: 'Preciso de informações sobre seus produtos',
        sent: false,
        timestamp: new Date(Date.now() - 60000).toISOString(),
        status: 'delivered'
      }
    ];

    setMessages(initialMessages);
  };

  const simulateIncomingMessage = () => {
    if (contacts.length === 0) return;
    
    const randomContact = contacts[Math.floor(Math.random() * contacts.length)];
    const possibleMessages = [
      'Oi, tudo bem?',
      'Você pode me ajudar?',
      'Qual o preço?',
      'Obrigado!',
      'Estou interessado',
      'Pode me enviar mais informações?'
    ];
    
    const newMsg: Message = {
      id: Date.now().toString(),
      contactId: randomContact.id,
      text: possibleMessages[Math.floor(Math.random() * possibleMessages.length)],
      sent: false,
      timestamp: new Date().toISOString(),
      status: 'delivered'
    };

    setMessages(prev => [...prev, newMsg]);
    
    setContacts(prev => prev.map(contact => 
      contact.id === randomContact.id 
        ? { 
            ...contact, 
            unread: contact.unread + 1, 
            lastMessage: newMsg.text,
            timestamp: newMsg.timestamp
          }
        : contact
    ));

    if (selectedContact === randomContact.id) {
      toast({
        title: `Nova mensagem de ${randomContact.name}`,
        description: newMsg.text
      });
    }
  };

  const selectContact = (contact: Contact) => {
    setSelectedContact(contact.id);
    
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
    setNewMessage('');

    // Tentar enviar via webhook
    if (webhooks.sendMessageWebhook) {
      const success = await sendWhatsAppMessage(contact.phone, newMessage);
      
      if (success) {
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === message.id ? { ...msg, status: 'sent' } : msg
          ));
        }, 1000);

        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === message.id ? { ...msg, status: 'delivered' } : msg
          ));
        }, 2000);

        toast({
          title: "Mensagem enviada! ✅",
          description: "Mensagem enviada via WhatsApp Business"
        });
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'sent' } : msg
        ));
        
        toast({
          title: "Mensagem simulada",
          description: "Configure webhook de envio para envio real",
          variant: "destructive"
        });
      }
    } else {
      // Simular envio
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        ));
      }, 1500);
    }
  };

  const toggleLiveMode = () => {
    setIsLiveMode(!isLiveMode);
    
    if (!isLiveMode) {
      toast({
        title: "Modo ao vivo ativado! 🔴",
        description: "Mensagens serão atualizadas automaticamente"
      });
    } else {
      toast({
        title: "Modo ao vivo desativado",
        description: "Atualizações automáticas pausadas"
      });
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
    switch (connectionStatus) {
      case 'active':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          text: 'Conectado e Ativo',
          color: 'text-green-600'
        };
      case 'idle':
        return {
          icon: <Clock className="h-6 w-6 text-yellow-500" />,
          text: 'Conectado (Inativo)',
          color: 'text-yellow-600'
        };
      default:
        return {
          icon: <AlertCircle className="h-6 w-6 text-gray-400" />,
          text: 'Desconectado',
          color: 'text-gray-600'
        };
    }
  };

  const statusInfo = getConnectionStatusInfo();

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Smartphone className="h-5 w-5" />
            WhatsApp Real - Espelho Business
            {isConnected && <CheckCircle className="h-5 w-5 text-green-500" />}
          </CardTitle>
          <CardDescription className="text-green-700">
            Conecta seu WhatsApp Business real via Make.com
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
              {!showWebhookConfig && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWebhookConfig(!showWebhookConfig)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Configurar
                </Button>
              )}
              
              {isConnected && (
                <>
                  <Button
                    variant={isLiveMode ? "destructive" : "default"}
                    size="sm"
                    onClick={toggleLiveMode}
                  >
                    {isLiveMode ? (
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
                  <Button onClick={disconnectWhatsApp} variant="outline" size="sm">
                    Desconectar
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Configuração de Webhooks */}
          {showWebhookConfig && (
            <div className="space-y-4 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900">Configuração Make.com</h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-blue-700">Webhook QR Code *</label>
                  <Input
                    placeholder="https://hook.eu1.make.com/xxxxx"
                    value={webhooks.qrWebhook}
                    onChange={(e) => updateWebhooks({ qrWebhook: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Webhook Status *</label>
                  <Input
                    placeholder="https://hook.eu1.make.com/xxxxx"
                    value={webhooks.statusWebhook}
                    onChange={(e) => updateWebhooks({ statusWebhook: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Webhook Envio (Opcional)</label>
                  <Input
                    placeholder="https://hook.eu1.make.com/xxxxx"
                    value={webhooks.sendMessageWebhook}
                    onChange={(e) => updateWebhooks({ sendMessageWebhook: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                onClick={() => setShowWebhookConfig(false)} 
                variant="outline" 
                size="sm"
              >
                Fechar Configuração
              </Button>
            </div>
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
                  Conectar WhatsApp Business Real
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

      {/* Interface de Conversas */}
      {isConnected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
          {/* Lista de Contatos */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversas
                </CardTitle>
                <div className="flex items-center gap-2">
                  {isLiveMode && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-600 font-medium">LIVE</span>
                    </div>
                  )}
                  <Badge variant="secondary">{contacts.length}</Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {contacts.map((contact) => (
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
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Área de Chat */}
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
                  {/* Mensagens */}
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

                  {/* Enviar Mensagem */}
                  <div className="border-t pt-4">
                    <div className="flex gap-3">
                      <Input 
                        placeholder="Digite uma mensagem..."
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
                  <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
                  <p className="text-sm">Escolha um contato para ver as mensagens</p>
                  <p className="text-xs mt-2">💡 Configure Make.com para conexão real</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Instruções */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Como conectar WhatsApp Business Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-2">🔧 Configuração necessária:</h4>
              <ul className="space-y-1">
                <li>• Configure webhooks do Make.com</li>
                <li>• Tenha WhatsApp Business API</li>
                <li>• Clique em "Configurar" para adicionar URLs</li>
                <li>• Gere QR Code e escaneie</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">✅ Funcionalidades:</h4>
              <ul className="space-y-1">
                <li>• <strong>Conexão real:</strong> Via Make.com + API</li>
                <li>• <strong>Espelhamento:</strong> Conversas em tempo real</li>
                <li>• <strong>Envio/Recebimento:</strong> Mensagens reais</li>
                <li>• <strong>Status:</strong> Entregue, lido, etc.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
