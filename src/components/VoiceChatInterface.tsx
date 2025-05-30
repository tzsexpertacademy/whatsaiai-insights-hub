import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageSquare, 
  Bot, 
  Send, 
  User,
  Volume2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Settings,
  History,
  Trash2
} from 'lucide-react';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useVoiceTranscription } from '@/hooks/useVoiceTranscription';
import { useChatHistory } from '@/hooks/useChatHistory';
import { VoiceRecordButton } from '@/components/VoiceRecordButton';
import { useToast } from "@/hooks/use-toast";
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { PageLayout } from '@/components/layout/PageLayout';

interface Message {
  id: number;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  assistantId?: string;
  isVoice?: boolean;
}

interface Assistant {
  id: string;
  name: string;
  prompt: string;
  model: string;
  area: string;
  isActive: boolean;
}

export function VoiceChatInterface() {
  const [selectedAssistant, setSelectedAssistant] = useState('kairon');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { assistants } = useAssistantsConfig();
  const { config } = useClientConfig();
  const { isRecording, startRecording, stopRecording, audioLevel } = useVoiceRecording();
  const { transcribeAudio, isTranscribing } = useVoiceTranscription();
  const { chatHistory, isLoading: isLoadingHistory, saveChatMessage, clearChatHistory } = useChatHistory();
  const { toast } = useToast();

  // Verificar se OpenAI está configurada
  const isOpenAIConfigured = config.openai?.apiKey && config.openai.apiKey.startsWith('sk-');

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowHistory(!showHistory)}
      >
        <History className="w-4 h-4 mr-2" />
        {showHistory ? 'Fechar' : 'Histórico'}
      </Button>
      <Badge className="bg-purple-100 text-purple-800 text-xs sm:text-sm">
        🤖 Chat com Assistentes
      </Badge>
    </div>
  );

  // Mensagem inicial
  useEffect(() => {
    if (messages.length === 0) {
      const selectedAssistantData = assistants.find(a => a.id === selectedAssistant);
      const initialMessage: Message = {
        id: 1,
        type: 'assistant',
        content: isOpenAIConfigured 
          ? `🤖 Olá! Sou ${selectedAssistantData?.name}. Estou conectado à OpenAI e pronto para conversar! Você pode digitar ou usar o microfone para falar comigo.` 
          : '❌ Para usar o chat REAL, configure sua API key da OpenAI em Configurações.',
        timestamp: new Date(),
        assistantId: selectedAssistant
      };
      setMessages([initialMessage]);
    }
  }, [selectedAssistant, isOpenAIConfigured, assistants]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Chat REAL com OpenAI
  const chatWithOpenAI = async (userMessage: string, assistantId: string): Promise<string> => {
    const selectedAssistantData = assistants.find(a => a.id === assistantId);
    
    if (!isOpenAIConfigured) {
      throw new Error('❌ API key da OpenAI não configurada');
    }

    if (!selectedAssistantData) {
      throw new Error('❌ Assistente não encontrado');
    }

    console.log('🤖 CHAT REAL COM OPENAI:', { assistantId, message: userMessage.substring(0, 50) + '...' });

    const systemPrompt = `${selectedAssistantData.prompt}

INSTRUÇÕES PARA CHAT REAL:
- Responda como ${selectedAssistantData.name}
- Seja conversacional e direto
- Máximo 200 palavras
- Use sua personalidade única
- Responda sempre em português brasileiro`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.8,
          max_tokens: 300,
        }),
      });

      console.log('📡 Resposta OpenAI:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Erro OpenAI:', errorData);
        throw new Error(`❌ Erro da OpenAI (${response.status})`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0]) {
        throw new Error('❌ Resposta inválida da OpenAI');
      }

      const assistantResponse = data.choices[0].message.content;
      console.log('✅ RESPOSTA REAL RECEBIDA');
      
      return assistantResponse;
    } catch (error) {
      console.error('❌ ERRO NO CHAT REAL:', error);
      throw error;
    }
  };

  const handleSendMessage = async (messageText?: string, isVoiceMessage = false) => {
    const textToSend = messageText || message.trim();
    if (!textToSend) return;

    if (!isOpenAIConfigured) {
      toast({
        title: "❌ OpenAI não configurada",
        description: "Configure sua API key da OpenAI em Configurações",
        variant: "destructive",
      });
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: textToSend,
      timestamp: new Date(),
      isVoice: isVoiceMessage
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      console.log('🔄 PROCESSANDO CHAT REAL:', textToSend.substring(0, 50) + '...');
      
      const response = await chatWithOpenAI(textToSend, selectedAssistant);
      
      if (response) {
        const assistantMessage: Message = {
          id: Date.now() + 1,
          type: 'assistant',
          content: response,
          timestamp: new Date(),
          assistantId: selectedAssistant
        };
        
        setMessages(prev => [...prev, assistantMessage]);

        // Salvar no histórico
        await saveChatMessage(selectedAssistant, textToSend, response);
        
        toast({
          title: "✅ Resposta REAL recebida",
          description: `${assistants.find(a => a.id === selectedAssistant)?.name} respondeu via OpenAI`,
        });
      }
    } catch (error) {
      console.error('❌ ERRO NO CHAT REAL:', error);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `❌ Erro no chat REAL: ${error instanceof Error ? error.message : 'Erro desconhecido'}\n\n💡 Verifique sua configuração da OpenAI em Configurações.`,
        timestamp: new Date(),
        assistantId: selectedAssistant
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "❌ Erro no chat REAL",
        description: error instanceof Error ? error.message : "Erro ao processar mensagem",
        variant: "destructive",
      });
    }
    
    setIsTyping(false);
  };

  const loadHistoryToChat = (historyItem: any) => {
    const userMsg: Message = {
      id: Date.now(),
      type: 'user',
      content: historyItem.user_message,
      timestamp: new Date(historyItem.created_at),
      assistantId: historyItem.assistant_id
    };

    const botMsg: Message = {
      id: Date.now() + 1,
      type: 'assistant',
      content: historyItem.assistant_response,
      timestamp: new Date(historyItem.created_at),
      assistantId: historyItem.assistant_id
    };

    setMessages([userMsg, botMsg]);
    setSelectedAssistant(historyItem.assistant_id);
    setShowHistory(false);
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      console.log('🛑 Parando gravação...');
      const audioBase64 = await stopRecording();
      
      if (audioBase64) {
        console.log('📝 Transcrevendo...');
        const transcribedText = await transcribeAudio(audioBase64);
        
        if (transcribedText) {
          console.log('✅ Texto transcrito:', transcribedText);
          await handleSendMessage(transcribedText, true);
        }
      }
    } else {
      console.log('🎤 Iniciando gravação...');
      await startRecording();
    }
  };

  const handleAssistantChange = (assistantId: string) => {
    setSelectedAssistant(assistantId);
    const selectedAssistantData = assistants.find(a => a.id === assistantId);
    
    if (selectedAssistantData && isOpenAIConfigured) {
      const welcomeMessage: Message = {
        id: Date.now(),
        type: 'assistant',
        content: `🤖 Agora você está falando com ${selectedAssistantData.name} via OpenAI REAL. Como posso te ajudar?`,
        timestamp: new Date(),
        assistantId: assistantId
      };
      setMessages(prev => [...prev, welcomeMessage]);
    }
  };

  const activeAssistants = assistants.filter(a => a.isActive);
  const selectedAssistantData = assistants.find(a => a.id === selectedAssistant);

  return (
    <PageLayout
      title="Chat com Assistentes IA"
      description="Converse por voz ou texto com seus assistentes especializados"
      showBackButton={true}
      headerActions={headerActions}
    >
      {/* Histórico de Conversas */}
      {showHistory && (
        <Card className="border-blue-200 bg-blue-50 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico de Conversas
              </CardTitle>
              <Button
                variant="destructive"
                size="sm"
                onClick={clearChatHistory}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Histórico
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : chatHistory.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {chatHistory.map((item) => {
                  const assistant = assistants.find(a => a.id === item.assistant_id);
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 border"
                      onClick={() => loadHistoryToChat(item)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{assistant?.name || 'Assistente'}</Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(item.created_at || item.timestamp).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 truncate">{item.user_message}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {item.assistant_response.substring(0, 100)}...
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Nenhuma conversa salva ainda
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status da Conexão */}
      {!isOpenAIConfigured ? (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>❌ OpenAI não configurada:</strong> Configure sua API key da OpenAI em Configurações para chat REAL.
            <Button variant="link" className="ml-2 p-0 h-auto text-red-600" onClick={() => window.location.href = '/dashboard/settings'}>
              <Settings className="w-4 h-4 mr-1" />
              Ir para Configurações
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>✅ OpenAI configurada:</strong> Chat REAL ativo e funcionando!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Lista de Assistentes */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Assistentes
                <Badge className={`ml-auto ${isOpenAIConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isOpenAIConfigured ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Online
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Offline
                    </>
                  )}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
              {activeAssistants.map((assistant) => (
                <div
                  key={assistant.id}
                  onClick={() => handleAssistantChange(assistant.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedAssistant === assistant.id
                      ? 'bg-green-100 border-2 border-green-300 shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  } ${!isOpenAIConfigured ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedAssistant === assistant.id 
                        ? 'bg-gradient-to-r from-green-500 to-blue-600' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}>
                      <span className="text-white text-lg">{assistant.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-800 truncate">
                        {assistant.name}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {assistant.description}
                      </p>
                      <div className="mt-2">
                        <Badge className={`text-xs ${
                          selectedAssistant === assistant.id 
                            ? 'bg-green-100 text-green-800' 
                            : isOpenAIConfigured 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-1 ${
                            selectedAssistant === assistant.id 
                              ? 'bg-green-500' 
                              : isOpenAIConfigured 
                                ? 'bg-blue-500' 
                                : 'bg-gray-400'
                          }`}></div>
                          {selectedAssistant === assistant.id ? 'Ativo' : isOpenAIConfigured ? 'REAL' : 'Offline'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Principal */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col bg-white shadow-lg">
            {/* Header do Chat */}
            <div className={`border-b p-4 rounded-t-lg ${isOpenAIConfigured ? 'bg-gradient-to-r from-green-50 to-blue-50' : 'bg-gradient-to-r from-red-50 to-orange-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isOpenAIConfigured 
                    ? 'bg-gradient-to-r from-green-500 to-blue-600' 
                    : 'bg-gradient-to-r from-red-400 to-orange-500'
                }`}>
                  <span className="text-white text-xl">{selectedAssistantData?.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{selectedAssistantData?.name}</h3>
                  <p className="text-sm text-gray-600">{selectedAssistantData?.description}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={`${isOpenAIConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className={`w-2 h-2 rounded-full mr-1 ${isOpenAIConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {isOpenAIConfigured ? 'REAL' : 'Offline'}
                  </Badge>
                  {isOpenAIConfigured && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Volume2 className="w-3 h-3 mr-1" />
                      Voz
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.type === 'user' 
                        ? 'bg-blue-500' 
                        : msg.type === 'system'
                          ? 'bg-gray-500'
                          : 'bg-gradient-to-r from-green-500 to-blue-600'
                    }`}>
                      {msg.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : msg.type === 'system' ? (
                        <MessageSquare className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-white text-sm">{assistants.find(a => a.id === msg.assistantId)?.icon}</span>
                      )}
                    </div>

                    {/* Mensagem */}
                    <div
                      className={`rounded-lg p-4 shadow-sm ${
                        msg.type === 'user'
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : msg.type === 'system'
                            ? 'bg-gray-100 text-gray-700 rounded-bl-none border'
                            : 'bg-white text-gray-800 rounded-bl-none border'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                        </div>
                        {msg.isVoice && (
                          <div className={`flex-shrink-0 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                            <Volume2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <p className={`text-xs mt-2 ${
                        msg.type === 'user' 
                          ? 'text-blue-100' 
                          : msg.type === 'system'
                            ? 'text-gray-500'
                            : 'text-gray-500'
                      }`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.isVoice && ' • Mensagem de voz'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Indicador de digitação */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">{selectedAssistantData?.icon}</span>
                    </div>
                    <div className="bg-white rounded-lg rounded-bl-none p-4 border shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedAssistantData?.name} está pensando...
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <div className="border-t bg-white p-4 rounded-b-lg">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Input
                    placeholder={isOpenAIConfigured ? "Digite sua mensagem ou use o microfone..." : "Configure OpenAI para chat REAL..."}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && isOpenAIConfigured && handleSendMessage()}
                    className="pr-12 rounded-xl border-gray-300 min-h-[40px]"
                    disabled={isRecording || isTranscribing || isTyping || !isOpenAIConfigured}
                  />
                </div>

                {/* Botão de Gravação de Voz */}
                {isOpenAIConfigured && (
                  <VoiceRecordButton
                    isRecording={isRecording}
                    isTranscribing={isTranscribing}
                    audioLevel={audioLevel}
                    onStartRecording={handleVoiceRecording}
                    onStopRecording={handleVoiceRecording}
                    disabled={isTyping}
                  />
                )}
                
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!message.trim() || isRecording || isTranscribing || isTyping || !isOpenAIConfigured}
                  className={`rounded-full w-10 h-10 p-0 flex-shrink-0 ${
                    isOpenAIConfigured 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {/* Status de gravação */}
              {(isRecording || isTranscribing) && (
                <div className="mt-2 text-center">
                  <p className="text-sm text-gray-600">
                    {isRecording && "🎤 Gravando... Clique no microfone para parar"}
                    {isTranscribing && "📝 Transcrevendo áudio..."}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Sugestões de Conversa */}
      {isOpenAIConfigured && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Sugestões para Conversa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                "Como posso melhorar minha autoestima?",
                "Estou tendo problemas no relacionamento",
                "Quero definir metas para minha carreira",
                "Como lidar com ansiedade?",
                "Preciso de ajuda com produtividade",
                "Como melhorar minha comunicação?"
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left justify-start h-auto p-3 text-sm text-green-700 border-green-200 hover:bg-green-100 whitespace-normal"
                  onClick={() => setMessage(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
