
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIAnalysisSelector } from '@/components/AIAnalysisSelector';
import { CostEstimator } from '@/components/CostEstimator';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Send, 
  Loader2, 
  User, 
  Bot,
  FileText,
  Calculator
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface AnalysisConfig {
  type: string;
  maxTokens: number;
  temperature: number;
}

interface ParsedDocument {
  text: string;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
    pageCount?: number;
  };
}

interface DocumentAIAnalysisProps {
  selectedDocument: ParsedDocument | null;
}

export function DocumentAIAnalysis({ selectedDocument }: DocumentAIAnalysisProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showCostCalculator, setShowCostCalculator] = useState(false);
  const { config } = useClientConfig();
  const { user } = useAuth();
  const { toast } = useToast();

  const isOpenAIConfigured = config.openai?.apiKey && config.openai.apiKey.startsWith('sk-');

  // Estimar tokens baseado no texto (aproximadamente 4 caracteres por token)
  const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
  };

  const handleAnalyzeDocument = async (analysisConfig: AnalysisConfig) => {
    if (!selectedDocument || !isOpenAIConfigured) {
      toast({
        title: "Erro",
        description: "Selecione um documento e configure a OpenAI",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const systemPrompt = `Você é um especialista em análise de documentos. Analise o documento fornecido e forneça insights detalhados baseados no tipo de análise solicitado:

TIPO DE ANÁLISE: ${analysisConfig.type}
- Micro (50-100 tokens): Resumo ultra conciso
- Simples (100-250 tokens): Resumo básico com pontos principais
- Completa (250-500 tokens): Análise equilibrada com insights
- Detalhada (500-800 tokens): Análise profunda e completa

INSTRUÇÕES:
- Responda sempre em português brasileiro
- Foque nos aspectos mais importantes do documento
- Forneça insights práticos e acionáveis
- Mantenha o limite de tokens para o tipo de análise selecionado

DOCUMENTO PARA ANÁLISE:
Arquivo: ${selectedDocument.metadata.fileName}
Tipo: ${selectedDocument.metadata.fileType}
Tamanho: ${selectedDocument.metadata.fileSize} bytes

Conteúdo:
${selectedDocument.text}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openai?.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.openai?.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Analise este documento conforme as instruções.' }
          ],
          temperature: analysisConfig.temperature,
          max_tokens: analysisConfig.maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API OpenAI: ${response.statusText}`);
      }

      const data = await response.json();
      const analysis = data.choices[0]?.message?.content;

      if (analysis) {
        setAnalysisResult(analysis);
        
        const analysisMessage: Message = {
          id: Date.now().toString() + '-analysis',
          sender: 'bot',
          text: analysis,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setMessages([analysisMessage]);
        
        toast({
          title: "✅ Análise concluída",
          description: `Documento analisado com sucesso (${analysisConfig.type})`,
        });
      }

    } catch (error: any) {
      console.error('Erro ao analisar documento:', error);
      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível analisar o documento",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !analysisResult || !isOpenAIConfigured) return;

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
      const conversationContext = messages.map(m => 
        `${m.sender === 'user' ? 'Usuário' : 'Assistente'}: ${m.text}`
      ).join('\n\n');

      const systemPrompt = `Você é um assistente especializado em análise de documentos. Você já analisou um documento e agora está conversando com o usuário sobre essa análise.

CONTEXTO DA ANÁLISE ANTERIOR:
${analysisResult}

DOCUMENTO ANALISADO:
Arquivo: ${selectedDocument?.metadata.fileName}
Tipo: ${selectedDocument?.metadata.fileType}

HISTÓRICO DA CONVERSA:
${conversationContext}

INSTRUÇÕES:
- Responda perguntas sobre a análise realizada
- Forneça esclarecimentos e detalhamentos quando solicitado
- Mantenha o foco no documento analisado
- Seja objetivo e útil
- Responda sempre em português brasileiro
- Máximo 300 palavras por resposta`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openai?.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.openai?.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input }
          ],
          temperature: 0.7,
          max_tokens: 400,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API OpenAI: ${response.statusText}`);
      }

      const data = await response.json();
      const botResponse = data.choices[0]?.message?.content;

      if (botResponse) {
        const botMessage: Message = {
          id: Date.now().toString() + '-bot',
          sender: 'bot',
          text: botResponse,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);
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

  if (!selectedDocument) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Selecione um documento para iniciar a análise</p>
        </CardContent>
      </Card>
    );
  }

  const estimatedTokens = estimateTokens(selectedDocument.text);

  return (
    <div className="space-y-6">
      {/* Seletor de Análise */}
      <AIAnalysisSelector 
        onAnalyze={handleAnalyzeDocument}
        isAnalyzing={isAnalyzing}
      />

      {/* Calculadora de Custo */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCostCalculator(!showCostCalculator)}
        >
          <Calculator className="w-4 h-4 mr-2" />
          {showCostCalculator ? 'Ocultar' : 'Mostrar'} Calculadora de Custo
        </Button>
      </div>

      {showCostCalculator && (
        <CostEstimator
          estimatedTokens={estimatedTokens}
          maxTokens={800} // Máximo para análise detalhada
          model={config.openai?.model || 'gpt-4o-mini'}
          fileName={selectedDocument.metadata.fileName}
        />
      )}

      {/* Área de Chat com o Assistente */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Chat sobre a Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className={`flex-1 ${message.sender === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block rounded-lg p-3 text-sm max-w-[80%] ${
                        message.sender === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {message.text}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Faça perguntas sobre a análise..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                disabled={isSubmitting || !isOpenAIConfigured}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isSubmitting || !input.trim()}
              >
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
    </div>
  );
}
