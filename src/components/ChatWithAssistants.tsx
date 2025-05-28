
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
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useVoiceTranscription } from '@/hooks/useVoiceTranscription';
import { VoiceRecordButton } from '@/components/VoiceRecordButton';
import { useToast } from "@/hooks/use-toast";
import { useClientConfig } from '@/contexts/ClientConfigContext';

interface Message {
  id: number;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  assistantId?: string;
  isVoice?: boolean;
}

export function ChatWithAssistants() {
  const [selectedAssistant, setSelectedAssistant] = useState('kairon');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { assistants } = useAssistantsConfig();
  const { config } = useClientConfig();
  const { isRecording, startRecording, stopRecording, audioLevel } = useVoiceRecording();
  const { transcribeAudio, isTranscribing } = useVoiceTranscription();
  const { toast } = useToast();

  // Verificar se OpenAI está configurada
  const isOpenAIConfigured = config.openai?.apiKey && config.openai.apiKey.startsWith('sk-');

  // Mensagem inicial baseada na configuração
  useEffect(() => {
    if (messages.length === 0) {
      const selectedAssistantData = assistants.find(a => a.id === selectedAssistant);
      const initialMessage: Message = {
        id: 1,
        type: 'assistant',
        content: isOpenAIConfigured 
          ? `Olá! Sou ${selectedAssistantData?.name}. ${getWelcomeMessage(selectedAssistant)}` 
          : 'Para usar o chat, configure sua API key da OpenAI em Configurações.',
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

  // Função para chat direto com OpenAI
  const chatWithOpenAI = async (userMessage: string, assistantId: string): Promise<string> => {
    const selectedAssistantData = assistants.find(a => a.id === assistantId);
    
    if (!isOpenAIConfigured) {
      throw new Error('API key da OpenAI não configurada.');
    }

    if (!selectedAssistantData) {
      throw new Error('Assistente não encontrado');
    }

    console.log('💬 Enviando mensagem para chat:', { assistantId, message: userMessage.substring(0, 50) + '...' });

    const systemPrompt = `${selectedAssistantData.prompt}

INSTRUÇÕES PARA CHAT:
- Você está conversando diretamente com o usuário
- Seja conversacional, direto e envolvente
- Mantenha respostas de 100-200 palavras
- Use sua personalidade única definida no prompt
- Responda sempre em português brasileiro
- Seja específico e prático em suas sugestões`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.openai.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 400,
        }),
      });

      console.log('📡 Resposta da OpenAI:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Erro da OpenAI:', errorData);
        throw new Error(`Erro da OpenAI (${response.status})`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0]) {
        throw new Error('Resposta inválida da OpenAI');
      }

      const assistantResponse = data.choices[0].message.content;
      console.log('✅ Resposta recebida do chat');
      
      return assistantResponse;
    } catch (error) {
      console.error('❌ Erro no chat:', error);
      throw error;
    }
  };

  const handleSendMessage = async (messageText?: string, isVoiceMessage = false) => {
    const textToSend = messageText || message.trim();
    if (!textToSend) return;

    if (!isOpenAIConfigured) {
      toast({
        title: "OpenAI não configurada",
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
      console.log('🔄 Processando chat:', textToSend.substring(0, 50) + '...');
      
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
        
        toast({
          title: "Resposta recebida",
          description: `${assistants.find(a => a.id === selectedAssistant)?.name} respondeu`,
        });
      }
    } catch (error) {
      console.error('❌ Erro no chat:', error);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}\n\n💡 Verifique sua configuração da OpenAI em Configurações.`,
        timestamp: new Date(),
        assistantId: selectedAssistant
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erro no chat",
        description: error instanceof Error ? error.message : "Erro ao processar mensagem",
        variant: "destructive",
      });
    }
    
    setIsTyping(false);
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      console.log('🛑 Parando gravação de voz...');
      const audioBase64 = await stopRecording();
      
      if (audioBase64) {
        console.log('📝 Transcrevendo áudio...');
        const transcribedText = await transcribeAudio(audioBase64);
        
        if (transcribedText) {
          console.log('✅ Texto transcrito:', transcribedText);
          await handleSendMessage(transcribedText, true);
        }
      }
    } else {
      console.log('🎤 Iniciando gravação de voz...');
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
        content: `Agora você está falando com ${selectedAssistantData.name}. ${getWelcomeMessage(assistantId)}`,
        timestamp: new Date(),
        assistantId: assistantId
      };
      setMessages(prev => [...prev, welcomeMessage]);
    }
  };

  const getWelcomeMessage = (assistantId: string): string => {
    const welcomeMessages = {
      kairon: "Vamos direto ao ponto: qual é a verdade que você está evitando?",
      oracle: "Estou aqui para explorar sua sombra emocional. O que você está sentindo?",
      guardian: "Vamos falar sobre recursos. Como você está gerenciando energia, tempo e atenção?",
      engineer: "Como está seu hardware corporal? Energia alta ou baixa hoje?",
      architect: "Hora de organizar suas prioridades. O que é mais importante agora?",
      weaver: "Vamos falar sobre propósito. O que realmente importa para você?",
      catalyst: "Precisa quebrar padrões limitantes? Qual sua maior limitação criativa?",
      mirror: "Seus relacionamentos são espelhos. O que eles refletem sobre você?"
    };

    return welcomeMessages[assistantId as keyof typeof welcomeMessages] || "Como posso te ajudar hoje?";
  };

  const activeAssistants = assistants.filter(a => a.isActive);
  const selectedAssistantData = assistants.find(a => a.id === selectedAssistant);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Chat com Assistentes IA</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Converse diretamente com nossos assistentes especializados
        </p>
      </div>

      {/* Status da Conexão */}
      {!isOpenAIConfigured && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>OpenAI não configurada:</strong> Configure sua API key da OpenAI em Configurações.
            <Button variant="link" className="ml-2 p-0 h-auto text-orange-600" onClick={() => window.location.href = '/dashboard/settings'}>
              Ir para Configurações
            </Button>
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
                <Badge className={`ml-auto ${isOpenAIConfigured ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
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
                      ? 'bg-blue-100 border-2 border-blue-300 shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  } ${!isOpenAIConfigured ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedAssistant === assistant.id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
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
                            ? 'bg-blue-100 text-blue-800' 
                            : isOpenAIConfigured 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-1 ${
                            selectedAssistant === assistant.id 
                              ? 'bg-blue-500' 
                              : isOpenAIConfigured 
                                ? 'bg-green-500' 
                                : 'bg-gray-400'
                          }`}></div>
                          {selectedAssistant === assistant.id ? 'Ativo' : isOpenAIConfigured ? 'Online' : 'Offline'}
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
            <div className={`border-b p-4 rounded-t-lg ${isOpenAIConfigured ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gradient-to-r from-gray-50 to-orange-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isOpenAIConfigured 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-r from-gray-400 to-orange-500'
                }`}>
                  <span className="text-white text-xl">{selectedAssistantData?.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{selectedAssistantData?.name}</h3>
                  <p className="text-sm text-gray-600">{selectedAssistantData?.description}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={`${isOpenAIConfigured ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    <div className={`w-2 h-2 rounded-full mr-1 ${isOpenAIConfigured ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    {isOpenAIConfigured ? 'Online' : 'Offline'}
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
                          : 'bg-gradient-to-r from-purple-500 to-blue-600'
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
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">{selectedAssistantData?.icon}</span>
                    </div>
                    <div className="bg-white rounded-lg rounded-bl-none p-4 border shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                    placeholder={isOpenAIConfigured ? "Digite sua mensagem..." : "Configure OpenAI para começar a conversar..."}
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
                  className="bg-blue-600 hover:bg-blue-700 rounded-full w-10 h-10 p-0 flex-shrink-0"
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
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Sugestões para Começar uma Conversa
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
                  className="text-left justify-start h-auto p-3 text-sm text-purple-700 border-purple-200 hover:bg-purple-100 whitespace-normal"
                  onClick={() => setMessage(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
