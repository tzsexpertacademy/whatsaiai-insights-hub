import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWPPConnect } from '@/hooks/useWPPConnect';
import { 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  MessageSquare, 
  Send,
  User,
  AlertCircle,
  RefreshCw,
  Search,
  Volume2,
  Loader2
} from 'lucide-react';

export function RealWhatsAppMirror() {
  const { toast } = useToast();
  const { 
    sessionStatus, 
    contacts,
    messages,
    isLoadingChats,
    isLoadingMessages,
    generateQRCode, 
    checkConnectionStatus,
    disconnectWhatsApp,
    sendMessage: sendWhatsAppMessage,
    loadRealChats,
    loadRealMessages,
    getConnectionStatus
  } = useWPPConnect();
  
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAutoChecking, setIsAutoChecking] = useState(false);
  const [hasAutoChecked, setHasAutoChecked] = useState(false);
  const [hasAutoLoadedChats, setHasAutoLoadedChats] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const connectionStatus = getConnectionStatus();
  const isConnected = sessionStatus.isConnected;

  // Verificação automática ao entrar na página
  useEffect(() => {
    const performAutoCheck = async () => {
      if (hasAutoChecked) return;
      
      console.log('🔄 [AUTO] Iniciando verificação automática...');
      setIsAutoChecking(true);
      setHasAutoChecked(true);
      
      try {
        console.log('🔍 [AUTO] Verificando status da conexão...');
        const isCurrentlyConnected = await checkConnectionStatus();
        
        if (isCurrentlyConnected) {
          console.log('✅ [AUTO] WhatsApp conectado! Carregando conversas...');
          
          toast({
            title: "✅ WhatsApp conectado!",
            description: "Carregando suas conversas automaticamente...",
          });
          
          // Carregar conversas imediatamente
          setTimeout(async () => {
            console.log('📱 [AUTO] Carregando conversas automaticamente...');
            await handleLoadRealChats(true);
            setHasAutoLoadedChats(true);
          }, 1000);
        } else {
          console.log('❌ [AUTO] WhatsApp não conectado');
          
          toast({
            title: "📱 WhatsApp desconectado",
            description: "Gere um QR Code para conectar seu WhatsApp",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('❌ [AUTO] Erro na verificação automática:', error);
        
        toast({
          title: "⚠️ Erro na verificação",
          description: "Não foi possível verificar o status automaticamente",
          variant: "destructive"
        });
      } finally {
        setIsAutoChecking(false);
      }
    };

    const timer = setTimeout(performAutoCheck, 500);
    return () => clearTimeout(timer);
  }, []);

  // Carregar conversas IMEDIATAMENTE quando conectar
  useEffect(() => {
    const loadChatsWhenConnected = async () => {
      if (isConnected && !hasAutoLoadedChats && !isLoadingChats) {
        console.log('✅ [EFFECT] WhatsApp conectado, carregando conversas IMEDIATAMENTE...');
        setHasAutoLoadedChats(true);
        
        // Carregar conversas sem delay
        await handleLoadRealChats(true);
      }
    };

    loadChatsWhenConnected();
  }, [isConnected, hasAutoLoadedChats, isLoadingChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLoadRealChats = async (isAutomatic = false) => {
    if (!isConnected && !isAutomatic) {
      toast({
        title: "WhatsApp não conectado",
        description: "Conecte seu WhatsApp primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('📱 Carregando conversas reais do WPPConnect...');
      const chatsData = await loadRealChats();
      
      if (!chatsData || chatsData.length === 0) {
        console.log('⚠️ Nenhuma conversa encontrada');
        if (!isAutomatic) {
          toast({
            title: "Nenhuma conversa encontrada",
            description: "Não há conversas disponíveis no momento",
            variant: "destructive"
          });
        }
        return;
      }
      
      console.log(`✅ ${chatsData.length} conversas carregadas com sucesso`);
      
      if (!isAutomatic) {
        toast({
          title: "Conversas carregadas! 📱",
          description: `${chatsData.length} conversas encontradas`
        });
      } else {
        toast({
          title: "✅ Conversas carregadas automaticamente",
          description: `${chatsData.length} conversas do WhatsApp encontradas`
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      
      if (!isAutomatic) {
        toast({
          title: "Erro ao carregar conversas",
          description: error instanceof Error ? error.message : "Verifique se o WPPConnect está rodando corretamente",
          variant: "destructive"
        });
      }
    }
  };

  const handleLoadRealMessages = async (contactId: string) => {
    try {
      await loadRealMessages(contactId);
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
    await generateQRCode();
  };

  const selectContact = (contact: any) => {
    setSelectedContact(contact.id);
    handleLoadRealMessages(contact.id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      await sendWhatsAppMessage(selectedContact, messageText);
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      
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
    
    const connected = await checkConnectionStatus();
    
    if (connected && !hasAutoLoadedChats) {
      console.log('🔄 Status verificado: conectado. Carregando conversas...');
      setTimeout(async () => {
        await handleLoadRealChats(false);
        setHasAutoLoadedChats(true);
      }, 1000);
    }
  };

  const handleForceLoadChats = async () => {
    console.log('🔄 Forçando carregamento de conversas...');
    await handleLoadRealChats(false);
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
    if (connectionStatus === 'connected' && isConnected) {
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
            WPPConnect Real - Sessão Ativa
            {isConnected && <CheckCircle className="h-5 w-5 text-green-500" />}
            {(isAutoChecking || isLoadingChats) && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
          </CardTitle>
          <CardDescription className="text-green-700">
            Conecta seu WhatsApp via WPPConnect API
            {isAutoChecking && (
              <span className="block text-blue-600 font-medium mt-1">
                🔄 Verificando status e carregando conversas automaticamente...
              </span>
            )}
            {isLoadingChats && (
              <span className="block text-blue-600 font-medium mt-1">
                📱 Carregando suas conversas do WhatsApp...
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {statusInfo.icon}
              <div>
                <span className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
                {sessionStatus.phoneNumber && (
                  <p className="text-sm text-gray-500">{sessionStatus.phoneNumber}</p>
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
                    onClick={handleForceLoadChats} 
                    variant="outline" 
                    size="sm"
                    disabled={isLoadingChats}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingChats ? 'animate-spin' : ''}`} />
                    {isLoadingChats ? 'Carregando...' : 'Forçar Conversas'}
                  </Button>
                  <Button onClick={disconnectWhatsApp} variant="outline" size="sm">
                    Desconectar
                  </Button>
                </>
              )}
            </div>
          </div>

          {!isConnected && !sessionStatus.qrCode && (
            <Button 
              onClick={handleGenerateQR} 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={sessionStatus.isLoading}
            >
              {sessionStatus.isLoading ? (
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
      {sessionStatus.qrCode && !isConnected && (
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
                src={sessionStatus.qrCode} 
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
                <Badge variant="secondary">{filteredContacts.length}</Badge>
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
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {isLoadingChats ? (
                  <div className="p-4 text-center text-gray-500">
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p>Carregando conversas...</p>
                    <p className="text-xs">Buscando suas conversas do WhatsApp</p>
                  </div>
                ) : filteredContacts.length === 0 ? (
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
                          onClick={handleForceLoadChats}
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
                  filteredContacts.map((contact) => (
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
                  ))
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
                      {messages.filter(m => m.chatId === selectedContact).length} mensagens
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  {/* Mensagens */}
                  <div className="h-[400px] overflow-y-auto p-4 space-y-3">
                    {messages
                      .filter(m => m.chatId === selectedContact)
                      .map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-3 py-2 rounded-lg ${
                              message.sender === 'user'
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
                                  {message.sender === 'user' && message.status && (
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
