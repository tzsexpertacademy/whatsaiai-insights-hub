import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWPPConnect } from '@/hooks/useWPPConnect';
import { ConversationMarker } from './ConversationMarker';
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
  Loader2,
  Download,
  Bug,
  Radio,
  RadioIcon,
  Pause,
  Play
} from 'lucide-react';

export function RealWhatsAppMirror() {
  const { toast } = useToast();
  const { 
    sessionStatus, 
    contacts,
    messages,
    isLoadingChats,
    isLoadingMessages,
    isLiveMode,
    currentChatId,
    generateQRCode, 
    checkConnectionStatus,
    disconnectWhatsApp,
    sendMessage: sendWhatsAppMessage,
    loadRealChats,
    loadRealMessages,
    getConnectionStatus,
    startLiveMode,
    stopLiveMode,
    updateMessageHistoryLimit
  } = useWPPConnect();
  
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAutoChecking, setIsAutoChecking] = useState(false);
  const [hasAutoChecked, setHasAutoChecked] = useState(false);
  const [hasAutoLoadedChats, setHasAutoLoadedChats] = useState(false);
  const [isForceLoading, setIsForceLoading] = useState(false);
  const [messageLimit, setMessageLimit] = useState<number>(50); // NOVO: limite de mensagens
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const connectionStatus = getConnectionStatus();
  const isConnected = sessionStatus.isConnected;

  // Verificação IMEDIATA ao entrar na página com logs detalhados
  useEffect(() => {
    const performImmediateCheck = async () => {
      if (hasAutoChecked) {
        console.log('🔄 [DEBUG] Verificação já executada, pulando...');
        return;
      }
      
      console.log('🚀 [DEBUG] === INICIANDO VERIFICAÇÃO AUTOMÁTICA ===');
      console.log('🚀 [DEBUG] Estado atual sessionStatus:', sessionStatus);
      
      setIsAutoChecking(true);
      setHasAutoChecked(true);
      
      try {
        console.log('🔍 [DEBUG] Chamando checkConnectionStatus...');
        const isCurrentlyConnected = await checkConnectionStatus();
        
        console.log('📊 [DEBUG] Resultado da verificação:', {
          isCurrentlyConnected,
          sessionStatusAfter: sessionStatus
        });
        
        if (isCurrentlyConnected) {
          console.log('✅ [DEBUG] WhatsApp conectado detectado! Preparando para carregar conversas...');
          
          // Aguardar um pouco para o estado ser atualizado
          setTimeout(async () => {
            console.log('📱 [DEBUG] Carregando conversas automaticamente...');
            await handleLoadRealChats(true);
            setHasAutoLoadedChats(true);
          }, 2000);
        } else {
          console.log('❌ [DEBUG] WhatsApp não conectado ou erro na verificação');
        }
      } catch (error) {
        console.error('❌ [DEBUG] Erro na verificação automática:', error);
      } finally {
        setIsAutoChecking(false);
      }
    };

    // Executar verificação imediatamente
    console.log('🎬 [DEBUG] useEffect disparado - iniciando verificação');
    performImmediateCheck();
  }, []); // Array vazio para executar apenas uma vez

  // Carregar conversas quando conectar
  useEffect(() => {
    console.log('🔄 [DEBUG] useEffect loadChats - Estado:', {
      isConnected,
      hasAutoLoadedChats,
      isLoadingChats,
      isForceLoading
    });
    
    if (isConnected && !hasAutoLoadedChats && !isLoadingChats && !isForceLoading) {
      console.log('✅ [DEBUG] Conexão detectada via useEffect, carregando conversas...');
      setHasAutoLoadedChats(true);
      handleLoadRealChats(true);
    }
  }, [isConnected, hasAutoLoadedChats, isLoadingChats, isForceLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- RESTORED: Função para carregar conversas reais ---
  const handleLoadRealChats = async (isAutomatic = false) => {
    console.log('📱 [DEBUG] handleLoadRealChats chamado:', {
      isAutomatic,
      isConnected,
      hasAutoLoadedChats
    });
    
    if (!isConnected && !isAutomatic) {
      toast({
        title: "WhatsApp não conectado",
        description: "Conecte seu WhatsApp primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('📱 [DEBUG] Carregando conversas reais do WPPConnect...');
      const chatsData = await loadRealChats();
      
      console.log('📊 [DEBUG] Resultado loadRealChats:', chatsData);
      
      if (!chatsData || chatsData.length === 0) {
        console.log('⚠️ [DEBUG] Nenhuma conversa encontrada');
        if (!isAutomatic) {
          toast({
            title: "Nenhuma conversa encontrada",
            description: "Não há conversas disponíveis no momento",
            variant: "destructive"
          });
        }
        return;
      }
      
      console.log(`✅ [DEBUG] ${chatsData.length} conversas carregadas com sucesso`);
      
      if (!isAutomatic) {
        toast({
          title: "🎉 Conversas carregadas!",
          description: `${chatsData.length} conversas encontradas`
        });
      }
      
    } catch (error) {
      console.error('❌ [DEBUG] Erro ao carregar conversas:', error);
      
      if (!isAutomatic) {
        toast({
          title: "❌ Erro ao carregar conversas",
          description: error instanceof Error ? error.message : "Verifique se o WPPConnect está rodando corretamente",
          variant: "destructive"
        });
      }
    }
  };

  // Função para atualizar o limite e recarregar mensagens do contato atual
  const handleChangeMessageLimit = (limit: number) => {
    setMessageLimit(limit);
    updateMessageHistoryLimit(limit);
    if (selectedContact) {
      handleLoadRealMessages(selectedContact, true); // true = silent (não mostra toast)
    }
  };

  // Corrigido: Agora não aceita "limit", só o silent (tipo boolean)
  const handleLoadRealMessages = async (contactId: string, silent: boolean = false) => {
    try {
      await loadRealMessages(contactId, silent);
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

    // Parar modo live anterior se houver
    if (isLiveMode && currentChatId !== contact.id) {
      stopLiveMode();
    }
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
    console.log('🔄 [DEBUG] handleCheckStatus - Verificação manual iniciada');
    
    toast({
      title: "🔄 Verificando status...",
      description: "Consultando servidor WPPConnect"
    });
    
    const connected = await checkConnectionStatus();
    
    console.log('📊 [DEBUG] handleCheckStatus - Resultado:', connected);
    
    if (connected && !hasAutoLoadedChats) {
      console.log('🔄 [DEBUG] Status verificado: conectado. Carregando conversas...');
      setTimeout(async () => {
        await handleLoadRealChats(false);
        setHasAutoLoadedChats(true);
      }, 1000);
    }
  };

  const handleForceLoadChats = async () => {
    console.log('🔄 [DEBUG] FORÇANDO carregamento de conversas...');
    setIsForceLoading(true);
    
    try {
      await handleLoadRealChats(false);
      
      toast({
        title: "🚀 Conversas recarregadas!",
        description: "Lista de conversas foi atualizada manualmente"
      });
    } catch (error) {
      console.error('❌ [DEBUG] Erro ao forçar carregamento:', error);
      toast({
        title: "❌ Erro ao forçar carregamento",
        description: "Não foi possível carregar as conversas",
        variant: "destructive"
      });
    } finally {
      setIsForceLoading(false);
    }
  };

  const handleToggleLiveMode = () => {
    if (isLiveMode) {
      stopLiveMode();
    } else if (selectedContact) {
      startLiveMode(selectedContact);
    } else {
      toast({
        title: "Selecione uma conversa",
        description: "Primeiro selecione uma conversa para ativar o modo live",
        variant: "destructive"
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
    console.log('🔍 [DEBUG] getConnectionStatusInfo - Status atual:', {
      connectionStatus,
      isConnected,
      sessionStatus
    });
    
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

  // Ordenar mensagens cronologicamente (mais antigas primeiro, mais recentes embaixo)
  const sortedMessages = messages
    .filter(m => m.chatId === selectedContact)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="space-y-6">
      {/* Debug Info Simplificado */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Bug className="h-5 w-5" />
            📊 Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="font-semibold">Conexão:</span> {sessionStatus.isConnected ? '✅ Conectado' : '❌ Desconectado'}
            </div>
            <div>
              <span className="font-semibold">Conversas:</span> {contacts.length} carregadas
            </div>
            <div>
              <span className="font-semibold">Modo Live:</span> {isLiveMode ? '🔴 ATIVO' : '⏸️ Inativo'}
            </div>
          </div>
          
          {isLiveMode && currentChatId && (
            <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
              <p className="text-red-700 font-medium">
                🔴 LIVE: Atualizando mensagens automaticamente a cada 3 segundos
              </p>
              <p className="text-red-600 text-xs">
                Conversa ativa: {contacts.find(c => c.id === currentChatId)?.name || currentChatId}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Header com Status */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Smartphone className="h-5 w-5" />
            WPPConnect Real - Tempo Real
            {isConnected && <CheckCircle className="h-5 w-5 text-green-500" />}
            {isLiveMode && <Radio className="h-5 w-5 text-red-500 animate-pulse" />}
            {(isAutoChecking || isLoadingChats || isForceLoading) && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
          </CardTitle>
          <CardDescription className="text-green-700">
            Sistema de mensagens em tempo real via WPPConnect API
            {isAutoChecking && (
              <span className="block text-blue-600 font-medium mt-1">
                🔄 Verificando status automaticamente...
              </span>
            )}
            {(isLoadingChats || isForceLoading) && (
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
              
              <Button 
                onClick={handleForceLoadChats} 
                variant="default" 
                size="sm"
                disabled={isLoadingChats || isForceLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className={`h-4 w-4 mr-1 ${(isLoadingChats || isForceLoading) ? 'animate-spin' : ''}`} />
                {(isLoadingChats || isForceLoading) ? 'Carregando...' : 'Atualizar Conversas'}
              </Button>
              
              {selectedContact && (
                <Button 
                  onClick={handleToggleLiveMode}
                  variant={isLiveMode ? "destructive" : "default"}
                  size="sm"
                  className={isLiveMode ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {isLiveMode ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Parar Live
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Modo Live
                    </>
                  )}
                </Button>
              )}
              
              {isConnected && (
                <Button onClick={disconnectWhatsApp} variant="outline" size="sm">
                  Desconectar
                </Button>
              )}
            </div>
          </div>

          {!isConnected && !sessionStatus.qrCode && (
            <Button 
              onClick={generateQRCode} 
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
                  Conversas {isLiveMode && <Radio className="h-4 w-4 text-red-500 animate-pulse" />}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{filteredContacts.length}</Badge>
                  <Button 
                    onClick={handleForceLoadChats} 
                    variant="outline" 
                    size="sm"
                    disabled={isLoadingChats || isForceLoading}
                    title="Atualizar lista de conversas"
                  >
                    <Download className={`h-4 w-4 ${(isLoadingChats || isForceLoading) ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 mb-2">
                <label htmlFor="messageLimit" className="text-xs text-gray-500">
                  Mensagens/carregar:
                </label>
                <select
                  id="messageLimit"
                  value={messageLimit}
                  onChange={e => handleChangeMessageLimit(Number(e.target.value))}
                  className="border rounded px-1 py-0.5 text-xs"
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                </select>
              </div>
              
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
                {(isLoadingChats || isForceLoading) ? (
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
                        <p className="text-xs mb-2">WhatsApp conectado mas sem conversas carregadas</p>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={handleForceLoadChats}
                          disabled={isLoadingChats || isForceLoading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {(isLoadingChats || isForceLoading) ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                              Carregando...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-1" />
                              Carregar Conversas
                            </>
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
                      } ${
                        currentChatId === contact.id && isLiveMode ? 'border-l-4 border-l-red-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3" onClick={() => selectContact(contact)}>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center relative">
                          <User className="h-6 w-6 text-green-600" />
                          {currentChatId === contact.id && isLiveMode && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <Radio className="h-2 w-2 text-white animate-pulse" />
                            </div>
                          )}
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
                      
                      {/* Botão de Marcação para Análise */}
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <ConversationMarker
                          chatId={contact.id}
                          contactName={contact.name}
                          contactPhone={contact.phone}
                          messages={sortedMessages}
                          className="w-full justify-center"
                        />
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
                    <div className="flex items-center gap-2">
                      {isLiveMode && currentChatId === selectedContact && (
                        <Badge variant="destructive" className="animate-pulse">
                          🔴 LIVE
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {sortedMessages.length} mensagens
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="h-[400px] overflow-y-auto p-4 space-y-3">
                    {sortedMessages.map((message) => (
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
                  <p className="text-xs mt-2">Use o botão "Modo Live" para ativar atualizações automáticas</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
