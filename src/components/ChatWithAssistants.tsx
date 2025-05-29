import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Send, Bot, User, Loader2, RefreshCw, Zap, Settings, BarChart3, Brain } from 'lucide-react';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';
import { useAIReportUpdate } from '@/hooks/useAIReportUpdate';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface Assistant {
  id: string;
  name: string;
  prompt: string;
  model: string;
  area: string;
  isActive: boolean;
}

export function ChatWithAssistants() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { config } = useClientConfig();
  const { user } = useAuth();
  const { toast } = useToast();
  const { assistants, updateAssistant } = useAssistantsConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const { updateReport: updateAIReport, isUpdating } = useAIReportUpdate();

  const isOpenAIConfigured = config.openai?.apiKey && config.openai.apiKey.startsWith('sk-');

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedAssistant) return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsSubmitting(true);

    try {
      const assistant = assistants.find(a => a.id === selectedAssistant);
      if (!assistant) throw new Error('Assistente não encontrado');

      const systemPrompt = `${assistant.prompt}

CONTEXTO DE ANÁLISE:
- Você é o assistente "${assistant.name}" especializado em "${assistant.area}"
- Sua função é analisar as mensagens do usuário e gerar respostas relevantes
- Foque na sua área de especialização: ${assistant.area}

INSTRUÇÕES ESPECÍFICAS:
- Analise a mensagem do usuário
- Gere insights práticos e acionáveis
- Seja objetivo e construtivo  
- Máximo 150 palavras
- Responda sempre em português brasileiro
- Identifique padrões comportamentais relevantes à sua área

DADOS PARA ANÁLISE:
${input}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openai?.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: assistant.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Analise a mensagem e responda.` }
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro OpenAI:', response.status, errorText);
        throw new Error(`Erro na API OpenAI: ${errorText}`);
      }

      const aiData = await response.json();
      const botResponseText = aiData.choices[0]?.message?.content;

      if (botResponseText) {
        const botMessage: Message = {
          id: Date.now().toString() + '-bot',
          sender: 'bot',
          text: botResponseText,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } else {
        throw new Error('Resposta vazia da OpenAI');
      }

    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Ocorreu um erro ao processar a mensagem.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAssistant = async (assistantId: string) => {
    setIsConfiguring(true);
    try {
      const assistantToUpdate = assistants.find(a => a.id === assistantId);
      if (!assistantToUpdate) throw new Error('Assistente não encontrado');

      await updateAssistant(assistantId, { isActive: !assistantToUpdate.isActive });
      toast({
        title: "Assistente atualizado",
        description: `Assistente "${assistantToUpdate.name}" ${!assistantToUpdate.isActive ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar assistente:', error);
      toast({
        title: "Erro ao atualizar assistente",
        description: error.message || "Ocorreu um erro ao atualizar o assistente.",
        variant: "destructive"
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header e Seleção de Assistente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Chat com Assistentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecione um assistente para iniciar a conversa:
          </p>
          <div className="flex flex-wrap gap-2">
            {assistants.map(assistant => (
              <Button
                key={assistant.id}
                variant={selectedAssistant === assistant.id ? 'default' : 'outline'}
                onClick={() => setSelectedAssistant(assistant.id)}
                disabled={isConfiguring}
              >
                {assistant.name}
              </Button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Gerenciar assistentes:
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsConfiguring(prev => !prev)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuração dos Assistentes (Modal) */}
      {isConfiguring && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 space-y-4">
            <h4 className="font-semibold text-yellow-800">Configurar Assistentes</h4>
            <p className="text-sm text-yellow-600">
              Ative ou desative os assistentes para usar no chat:
            </p>
            <div className="flex flex-col gap-3">
              {assistants.map(assistant => (
                <div key={assistant.id} className="flex items-center justify-between p-3 rounded-md bg-white shadow-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{assistant.name}</span>
                  </div>
                  <Button
                    variant={assistant.isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleAssistant(assistant.id)}
                    disabled={isSubmitting}
                  >
                    {assistant.isActive ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              onClick={() => setIsConfiguring(false)}
            >
              Fechar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Área de Chat */}
      {selectedAssistant && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Chat com {assistants.find(a => a.id === selectedAssistant)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[400px] rounded-md" ref={chatContainerRef}>
              <div className="p-4 space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`rounded-lg p-3 text-sm max-w-xs ${message.sender === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {message.text}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {message.timestamp} - {message.sender === 'user' ? 'Você' : assistants.find(a => a.id === selectedAssistant)?.name}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Digite sua mensagem..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                disabled={isSubmitting}
              />
              <Button onClick={handleSendMessage} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão de Atualizar Relatórios com IA */}
      {isOpenAIConfigured && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-purple-800 mb-1">Análise Inteligente</h3>
                <p className="text-sm text-purple-600">
                  Gere relatórios automáticos baseados nas suas conversas
                </p>
              </div>
              <Button
                onClick={() => updateAIReport()}
                disabled={isUpdating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    <BarChart3 className="w-3 h-3 mr-1" />
                    <Zap className="w-3 h-3 mr-1" />
                    Atualizar Relatórios
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
