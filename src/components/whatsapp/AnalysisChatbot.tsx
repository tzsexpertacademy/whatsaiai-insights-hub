
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';
import { AssistantSelector } from '@/components/AssistantSelector';
import { 
  Brain, 
  Send, 
  Bot, 
  User, 
  MessageCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface AnalysisChatbotProps {
  analysisResults: any[];
  conversationData: {
    contact_name: string;
    contact_phone: string;
    analysis_status: string;
  };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AnalysisChatbot({ analysisResults, conversationData }: AnalysisChatbotProps) {
  const { config } = useClientConfig();
  const { assistants } = useAssistantsConfig();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState(assistants.length > 0 ? assistants[0].id : 'oracle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Welcome message when analysis results are available
    if (analysisResults.length > 0 && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Olá! Sou o assistente de análise. Acabei de analisar a conversa com ${conversationData.contact_name}. Posso esclarecer qualquer dúvida sobre os resultados da análise, explicar insights específicos, ou discutir estratégias baseadas nos dados coletados. Como posso ajudar?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [analysisResults, conversationData.contact_name, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildAnalysisContext = () => {
    const context = {
      conversation_info: {
        contact_name: conversationData.contact_name,
        contact_phone: conversationData.contact_phone,
        analysis_status: conversationData.analysis_status
      },
      analysis_results: analysisResults,
      total_insights: analysisResults.length
    };

    return `CONTEXTO DA ANÁLISE:
${JSON.stringify(context, null, 2)}

INSTRUÇÕES:
- Você é um assistente especializado em análise de conversas
- Responda perguntas sobre os resultados da análise acima
- Seja específico e cite dados dos insights quando relevante
- Forneça explicações claras e actionáveis
- Mantenha um tom profissional mas acessível`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!config?.openai?.apiKey) {
      toast({
        title: "Configuração necessária",
        description: "Configure sua chave OpenAI nas configurações",
        variant: "destructive"
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const selectedAssistantData = assistants.find(a => a.id === selectedAssistant);
      const systemPrompt = selectedAssistantData?.prompt || '';
      
      const analysisContext = buildAnalysisContext();
      
      const messagesForAPI = [
        { role: 'system', content: `${systemPrompt}\n\n${analysisContext}` },
        ...messages.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content: inputMessage }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.openai.model || 'gpt-4o-mini',
          messages: messagesForAPI,
          temperature: config.openai.temperature || 0.7,
          max_tokens: config.openai.maxTokens || 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.choices[0]?.message?.content;

      if (assistantResponse) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('Erro no chat:', error);
      toast({
        title: "Erro na conversa",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (analysisResults.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Chat não disponível</h3>
          <p className="text-gray-500">Execute uma análise primeiro para conversar sobre os resultados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-purple-500" />
            Chat sobre a Análise
          </CardTitle>
          <div className="text-sm text-gray-500">
            {conversationData.contact_name}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span>Assistente:</span>
          <AssistantSelector
            selectedAssistant={selectedAssistant}
            onAssistantChange={setSelectedAssistant}
            className="h-8"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 gap-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-purple-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-BR')}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="Digite sua pergunta sobre a análise..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            size="sm"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {!config?.openai?.apiKey && (
          <div className="text-center text-sm text-amber-600 bg-amber-50 p-2 rounded">
            ⚠️ Configure sua chave OpenAI nas configurações para usar o chat
          </div>
        )}
      </CardContent>
    </Card>
  );
}
