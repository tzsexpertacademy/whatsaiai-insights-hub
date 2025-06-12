
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWPPConnect } from "@/hooks/useWPPConnect";
import { useConversationMarking } from "@/hooks/useConversationMarking";
import { ConversationContextMenu } from "./ConversationContextMenu";
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
  Settings,
  Brain,
  Star
} from 'lucide-react';

export function WPPConnectMirror() {
  const { toast } = useToast();
  const { 
    sessionStatus, 
    chats, 
    messages, 
    isLoadingMessages,
    isLiveMode,
    currentChatId,
    createSession, 
    checkSessionStatus,
    loadChats,
    loadChatMessages,
    sendMessage,
    startLiveMode,
    stopLiveMode,
    disconnect
  } = useWPPConnect();
  
  const { markConversationForAnalysis, updateConversationPriority, isMarking } = useConversationMarking();
  
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [markedConversations, setMarkedConversations] = useState<Set<string>>(new Set());
  const [pinnedConversations, setPinnedConversations] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Verificar status ao montar
  useEffect(() => {
    checkSessionStatus();
  }, [checkSessionStatus]);

  const handleCreateSession = async () => {
    toast({
      title: "Criando sessão WPPConnect...",
      description: "Aguarde enquanto geramos o QR Code"
    });
    
    await createSession();
  };

  const selectContact = (contact: any) => {
    setSelectedContact(contact.chatId);
    loadChatMessages(contact.chatId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const success = await sendMessage(selectedContact, newMessage);
    if (success) {
      setNewMessage('');
    }
  };

  const toggleLiveMode = () => {
    if (!selectedContact) {
      toast({
        title: "Selecione uma conversa",
        description: "Escolha uma conversa primeiro para ativar o modo ao vivo",
        variant: "destructive"
      });
      return;
    }

    if (isLiveMode && currentChatId === selectedContact) {
      stopLiveMode();
    } else {
      startLiveMode(selectedContact);
    }
  };

  const handleTogglePin = (chatId: string) => {
    setPinnedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
        toast({ title: "Conversa desfixada" });
      } else {
        newSet.add(chatId);
        toast({ title: "Conversa fixada" });
      }
      return newSet;
    });
  };

  const handleToggleAnalysis = async (chatId: string, priority?: 'high' | 'medium' | 'low') => {
    const chat = chats.find(c => c.chatId === chatId);
    if (!chat) return;

    console.log('🏷️ Toggle análise para:', { chatId, chatName: chat.name, priority });

    if (priority && markedConversations.has(chatId)) {
      // Atualizar prioridade
      await updateConversationPriority(chatId, priority);
    } else {
      // Marcar/desmarcar para análise
      const isMarked = await markConversationForAnalysis(
        chatId, 
        chat.name, 
        chat.chatId, // usando chatId como phone por enquanto
        priority || 'medium'
      );

      setMarkedConversations(prev => {
        const newSet = new Set(prev);
        if (isMarked) {
          newSet.add(chatId);
        } else {
          newSet.delete(chatId);
        }
        return newSet;
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = () => {
    if (sessionStatus.isConnected) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    return <AlertCircle className="h-6 w-6 text-gray-400" />;
  };

  const getStatusText = () => {
    if (sessionStatus.isConnected) {
      return 'Conectado e Ativo';
    }
    return 'Desconectado';
  };

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Smartphone className="h-5 w-5" />
            WPPConnect - WhatsApp Local
            {sessionStatus.isConnected && <CheckCircle className="h-5 w-5 text-green-500" />}
          </CardTitle>
          <CardDescription className="text-green-700">
            Conecta com WPPConnect rodando em localhost:21465
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <span className="font-medium text-green-600">{getStatusText()}</span>
                {sessionStatus.phoneNumber && (
                  <p className="text-sm text-gray-500">{sessionStatus.phoneNumber}</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {sessionStatus.isConnected && (
                <>
                  <Button onClick={disconnect} variant="outline" size="sm">
                    Desconectar
                  </Button>
                  <Button onClick={() => loadChats()} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Atualizar
                  </Button>
                </>
              )}
            </div>
          </div>

          {!sessionStatus.isConnected && !sessionStatus.qrCode && (
            <Button 
              onClick={handleCreateSession} 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={sessionStatus.isLoading}
            >
              {sessionStatus.isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Conectar WPPConnect
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* QR Code para Conexão */}
      {sessionStatus.qrCode && !sessionStatus.isConnected && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <QrCode className="h-5 w-5" />
              Escaneie com WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-white p-6 rounded-lg inline-block mb-4 shadow-lg">
              <img 
                src={sessionStatus.qrCode} 
                alt="QR Code WPPConnect" 
                className="w-80 h-80 mx-auto"
              />
            </div>
            <div className="space-y-3">
              <div className="text-sm text-blue-700 space-y-2">
                <p><strong>1.</strong> Abra o WhatsApp no seu celular</p>
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
      {sessionStatus.isConnected && (
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
                  <Badge variant="secondary">{chats.length}</Badge>
                  {markedConversations.size > 0 && (
                    <Badge variant="outline" className="bg-blue-50">
                      <Brain className="h-3 w-3 mr-1" />
                      {markedConversations.size}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {chats.map((chat) => (
                  <ConversationContextMenu
                    key={chat.chatId}
                    chatId={chat.chatId}
                    isPinned={pinnedConversations.has(chat.chatId)}
                    isMarkedForAnalysis={markedConversations.has(chat.chatId)}
                    analysisPriority="medium"
                    onTogglePin={handleTogglePin}
                    onToggleAnalysis={handleToggleAnalysis}
                  >
                    <div 
                      onClick={() => selectContact(chat)}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedContact === chat.chatId ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{chat.name}</span>
                              {pinnedConversations.has(chat.chatId) && (
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              )}
                              {markedConversations.has(chat.chatId) && (
                                <Brain className="h-3 w-3 text-blue-500" />
                              )}
                            </div>
                            <span className="text-xs text-gray-400">{formatTime(chat.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-500 truncate mt-1">{chat.lastMessage}</p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <Badge className="bg-green-500 text-white">{chat.unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                  </ConversationContextMenu>
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
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {chats.find(c => c.chatId === selectedContact)?.name}
                      </CardTitle>
                    </div>
                    <Button
                      variant={isLiveMode && currentChatId === selectedContact ? "destructive" : "default"}
                      size="sm"
                      onClick={toggleLiveMode}
                    >
                      {isLiveMode && currentChatId === selectedContact ? (
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
                  </div>
                </CardHeader>
                
                <CardContent className="flex flex-col h-[500px]">
                  {/* Mensagens */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {isLoadingMessages ? (
                      <div className="text-center text-gray-500 py-8">
                        <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                        <p>Carregando mensagens...</p>
                      </div>
                    ) : (
                      messages
                        .filter(msg => msg.chatId === selectedContact)
                        .map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`rounded-lg px-4 py-2 max-w-[75%] ${
                                msg.sender === 'user'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <p className="text-sm">{msg.text}</p>
                              <div className={`text-xs mt-1 ${
                                msg.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                              }`}>
                                {formatTime(msg.timestamp)}
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Enviar Mensagem */}
                  <div className="border-t pt-4">
                    <div className="flex gap-3">
                      <Input 
                        placeholder="Digite uma mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
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
                  <p className="text-xs mt-2 text-blue-600">
                    💡 Clique com o botão direito nas conversas para marcar para análise IA
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Instruções */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">WPPConnect localhost:21465</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700">
            <p className="mb-2">
              <strong>✅ Funcionando:</strong> Sistema conectado com sua API WPPConnect local
            </p>
            <p className="mb-2">
              <strong>🔧 Configuração:</strong> localhost:21465 com token "MySecretKeyToGenerateToken"
            </p>
            <p className="mb-2">
              <strong>📱 Status:</strong> {sessionStatus.isConnected ? 'Conectado e funcionando' : 'Pronto para conectar'}
            </p>
            <p>
              <strong>🤖 IA:</strong> Clique com botão direito nas conversas para marcar para análise IA
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
