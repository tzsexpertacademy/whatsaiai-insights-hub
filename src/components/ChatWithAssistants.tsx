
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Bot, 
  Send, 
  Smile,
  Heart,
  Brain,
  Target,
  Users,
  Sparkles,
  User,
  Paperclip,
  Mic
} from 'lucide-react';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  assistantId?: string;
}

export function ChatWithAssistants() {
  const [selectedAssistant, setSelectedAssistant] = useState('kairon');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'assistant',
      content: 'Olá! Eu sou Kairon, seu conselheiro principal. Estou aqui para te confrontar com verdades que talvez você não queira ouvir, mas precisa. O que está te incomodando hoje?',
      timestamp: new Date(),
      assistantId: 'kairon'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { assistants } = useAssistantsConfig();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setIsTyping(true);

    const selectedAssistantData = assistants.find(a => a.id === selectedAssistant);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: messages.length + 2,
        type: 'assistant',
        content: getAssistantResponse(selectedAssistant, message),
        timestamp: new Date(),
        assistantId: selectedAssistant
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAssistantResponse = (assistantId: string, userMessage: string): string => {
    const responses = {
      kairon: [
        "Interessante. Mas me diga: o que você está evitando enxergar nessa situação?",
        "Você está sendo honesto comigo ou está contando a versão que te deixa mais confortável?",
        "Percebo um padrão aqui. Quando foi a última vez que você assumiu total responsabilidade por isso?",
        "Boa pergunta. Agora me responda: você quer a verdade ou quer que eu confirme o que você já acredita?"
      ],
      oracle: [
        "Vejo algumas resistências emocionais em sua fala. Que sentimento você está tentando evitar?",
        "Suas palavras revelam um padrão de autossabotagem. Você percebe isso?",
        "Há uma sombra emocional que você não está querendo olhar. O que é?",
        "Sua mente está criando uma narrativa de proteção. Mas proteção do quê, exatamente?"
      ],
      guardian: [
        "Falando de dinheiro: você tem controle real sobre seus recursos ou está no piloto automático?",
        "Sua relação com dinheiro reflete sua relação com poder pessoal. Como você se sente sobre isso?",
        "Quantas decisões financeiras você toma por medo vs quantas por estratégia?",
        "Dinheiro é energia. Como está a sua energia financeira: dispersa ou focada?"
      ]
    };

    const assistantResponses = responses[assistantId as keyof typeof responses] || responses.kairon;
    return assistantResponses[Math.floor(Math.random() * assistantResponses.length)];
  };

  const handleAssistantChange = (assistantId: string) => {
    setSelectedAssistant(assistantId);
    const selectedAssistantData = assistants.find(a => a.id === assistantId);
    
    if (selectedAssistantData) {
      const welcomeMessage: Message = {
        id: messages.length + 1,
        type: 'assistant',
        content: getWelcomeMessage(assistantId, selectedAssistantData.name),
        timestamp: new Date(),
        assistantId: assistantId
      };
      setMessages(prev => [...prev, welcomeMessage]);
    }
  };

  const getWelcomeMessage = (assistantId: string, name: string): string => {
    const welcomeMessages = {
      kairon: "Então você quer falar comigo agora? Ótimo. Vamos direto ao ponto: qual é a verdade que você está evitando?",
      oracle: "Bem-vindo ao espaço da sua sombra emocional. Estou aqui para te ajudar a olhar para dentro. O que você está sentindo?",
      guardian: "Vamos falar sobre seus recursos. Não só dinheiro, mas energia, tempo, atenção. Como você está gerenciando tudo isso?",
      engineer: "Seu corpo é seu hardware. Como ele está rodando? Energia alta, baixa? Me conte sobre seu estado físico.",
      architect: "Hora de organizar o caos mental. Quais são suas prioridades reais neste momento?",
      weaver: "Vamos falar sobre propósito. O que realmente importa para você quando toda a superficialidade é removida?",
      catalyst: "Precisa quebrar alguns padrões mentais? Estou aqui para isso. Qual sua maior limitação criativa?",
      mirror: "Seus relacionamentos são espelhos. O que eles estão refletindo sobre você ultimamente?"
    };

    return welcomeMessages[assistantId as keyof typeof welcomeMessages] || `Olá, sou ${name}. Como posso te ajudar hoje?`;
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
          Converse diretamente com nossos assistentes especializados para análise personalizada
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Lista de Assistentes */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Assistentes Online
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
              {activeAssistants.map((assistant) => (
                <div
                  key={assistant.id}
                  onClick={() => handleAssistantChange(assistant.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedAssistant === assistant.id
                      ? 'bg-blue-100 border-2 border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">{assistant.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-800 truncate">
                        {assistant.name}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {assistant.description}
                      </p>
                      <div className="mt-1">
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          Online
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
          <Card className="h-[600px] flex flex-col bg-white">
            {/* Header do Chat estilo WhatsApp */}
            <div className="border-b bg-gray-50 p-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">{selectedAssistantData?.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{selectedAssistantData?.name}</h3>
                  <p className="text-sm text-gray-600">{selectedAssistantData?.description}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Online
                </Badge>
              </div>
            </div>

            {/* Área de Mensagens estilo WhatsApp */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.type === 'user' 
                        ? 'bg-blue-500' 
                        : 'bg-gradient-to-r from-purple-500 to-blue-600'
                    }`}>
                      {msg.type === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white text-sm">{assistants.find(a => a.id === msg.assistantId)?.icon}</span>
                      )}
                    </div>

                    {/* Mensagem */}
                    <div
                      className={`rounded-lg p-3 shadow-sm ${
                        msg.type === 'user'
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none border'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Indicador de digitação */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[80%]">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">{selectedAssistantData?.icon}</span>
                    </div>
                    <div className="bg-white rounded-lg rounded-bl-none p-3 border">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem estilo WhatsApp */}
            <div className="border-t bg-white p-4 rounded-b-lg">
              <div className="flex gap-2 items-center">
                <Button size="sm" variant="ghost" className="p-2">
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="pr-12 rounded-full border-gray-300"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-1 h-8 w-8 p-0 rounded-full"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>

                <Button size="sm" variant="ghost" className="p-2">
                  <Mic className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="bg-blue-600 hover:bg-blue-700 rounded-full w-10 h-10 p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Sugestões de Conversa */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Sugestões para Começar
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
                className="text-left justify-start h-auto p-3 text-sm text-purple-700 border-purple-200 hover:bg-purple-100"
                onClick={() => setMessage(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
