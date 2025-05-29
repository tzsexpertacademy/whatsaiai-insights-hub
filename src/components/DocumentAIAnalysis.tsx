
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CostEstimator } from '@/components/CostEstimator';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';
import { 
  Brain, 
  Send, 
  Loader2, 
  User, 
  Bot,
  FileText,
  Calculator,
  MessageSquare,
  Zap,
  Settings2,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

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

const ANALYSIS_TYPES = {
  micro: { label: 'Análise Micro', maxTokens: 100, description: 'Resumo ultra conciso (50-100 tokens)' },
  simples: { label: 'Análise Simples', maxTokens: 250, description: 'Resumo básico com pontos principais (100-250 tokens)' },
  completa: { label: 'Análise Completa', maxTokens: 500, description: 'Análise equilibrada com insights práticos (250-500 tokens)' },
  detalhada: { label: 'Análise Detalhada', maxTokens: 800, description: 'Análise profunda e completa (500-800 tokens)' }
};

// Função para truncar texto de forma inteligente
function truncateTextForAnalysis(text: string, maxTokens: number = 100000): string {
  console.log(`📏 Texto original: ${text.length} caracteres`);
  
  // Estimar tokens (aproximadamente 4 caracteres por token)
  const estimatedTokens = Math.ceil(text.length / 4);
  
  if (estimatedTokens <= maxTokens) {
    console.log(`✅ Texto dentro do limite: ${estimatedTokens} tokens`);
    return text;
  }
  
  // Calcular quantos caracteres manter (deixando margem para o prompt do sistema)
  const maxChars = Math.floor(maxTokens * 3.5); // Margem de segurança
  
  console.log(`✂️ Truncando texto de ${text.length} para ${maxChars} caracteres`);
  
  // Truncar e tentar cortar em uma quebra de parágrafo próxima
  let truncatedText = text.substring(0, maxChars);
  
  // Procurar por uma quebra de parágrafo nos últimos 500 caracteres
  const lastParagraphBreak = truncatedText.lastIndexOf('\n\n');
  if (lastParagraphBreak > maxChars - 1000 && lastParagraphBreak > 0) {
    truncatedText = truncatedText.substring(0, lastParagraphBreak);
  }
  
  // Adicionar indicação de truncamento
  truncatedText += '\n\n[DOCUMENTO TRUNCADO - Analisando apenas a primeira parte do texto]';
  
  console.log(`📋 Texto final: ${truncatedText.length} caracteres (~${Math.ceil(truncatedText.length / 4)} tokens)`);
  
  return truncatedText;
}

export function DocumentAIAnalysis({ selectedDocument }: DocumentAIAnalysisProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showCostCalculator, setShowCostCalculator] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('simples');
  const { config } = useClientConfig();
  const { user } = useAuth();
  const { toast } = useToast();
  const { assistants } = useAssistantsConfig();

  const isOpenAIConfigured = config.openai?.apiKey && config.openai.apiKey.startsWith('sk-');

  // Filtrar apenas assistentes ativos
  const activeAssistants = assistants.filter(assistant => assistant.isActive);

  // Estimar tokens baseado no texto (aproximadamente 4 caracteres por token)
  const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
  };

  // Verificar se o documento é muito grande
  const isDocumentTooLarge = selectedDocument ? estimateTokens(selectedDocument.text) > 100000 : false;

  const handleAnalyzeDocument = async () => {
    console.log('🤖 Iniciando análise do documento...');
    
    if (!selectedDocument || !isOpenAIConfigured) {
      toast({
        title: "Erro",
        description: "Selecione um documento e configure a OpenAI",
        variant: "destructive"
      });
      return;
    }

    if (!selectedAssistant) {
      toast({
        title: "Erro",
        description: "Selecione um assistente para fazer a análise",
        variant: "destructive"
      });
      return;
    }

    // Verificar se o documento tem conteúdo válido
    if (!selectedDocument.text || selectedDocument.text.length < 50) {
      toast({
        title: "Documento sem conteúdo",
        description: "O documento não contém texto suficiente para análise. Verifique se o arquivo foi processado corretamente.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const assistant = activeAssistants.find(a => a.id === selectedAssistant);
      if (!assistant) {
        throw new Error('Assistente não encontrado');
      }

      const analysisConfig = ANALYSIS_TYPES[selectedAnalysisType as keyof typeof ANALYSIS_TYPES];
      
      // Truncar o texto se necessário
      const documentText = truncateTextForAnalysis(selectedDocument.text);
      const finalTokens = estimateTokens(documentText);
      
      console.log('📊 Configuração da análise:', {
        type: selectedAnalysisType,
        maxTokens: analysisConfig.maxTokens,
        assistant: assistant.name,
        originalDocumentSize: selectedDocument.text.length,
        processedDocumentSize: documentText.length,
        estimatedTokens: finalTokens
      });

      const systemPrompt = `${assistant.prompt}

CONTEXTO DE ANÁLISE DE DOCUMENTO:
- Você é o assistente "${assistant.name}" especializado em "${assistant.area}"
- Sua função é analisar o CONTEÚDO do documento e fornecer insights práticos na sua área de especialização
- Tipo de análise solicitado: ${analysisConfig.label}
- IMPORTANTE: Analise o CONTEÚDO e SIGNIFICADO do documento, não suas características técnicas

DIRETRIZES DE ANÁLISE:
- Micro (50-100 tokens): Resumo ultra conciso e direto do conteúdo
- Simples (100-250 tokens): Resumo básico com pontos principais do conteúdo
- Completa (250-500 tokens): Análise equilibrada do conteúdo com insights práticos
- Detalhada (500-800 tokens): Análise profunda e completa do conteúdo com recomendações

INSTRUÇÕES ESPECÍFICAS:
- Analise o CONTEÚDO do documento do ponto de vista da sua especialização
- Identifique os pontos mais relevantes do conteúdo para sua área
- Forneça insights práticos e acionáveis baseados no conteúdo
- Mantenha o limite de tokens para o tipo de análise selecionado
- Responda sempre em português brasileiro
- Seja objetivo e construtivo
- Foque no SIGNIFICADO e CONTEÚDO, não na estrutura técnica do arquivo

DOCUMENTO PARA ANÁLISE:
Arquivo: ${selectedDocument.metadata.fileName}
Tipo: ${selectedDocument.metadata.fileType}
Tamanho: ${selectedDocument.metadata.fileSize} bytes`;

      console.log('🚀 Enviando requisição para OpenAI...');
      console.log('📋 Tokens estimados do prompt:', estimateTokens(systemPrompt));
      console.log('📋 Tokens estimados do documento:', finalTokens);
      console.log('📋 Total estimado:', estimateTokens(systemPrompt) + finalTokens);

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
            { role: 'user', content: `Analise o seguinte conteúdo do documento:\n\n${documentText}` }
          ],
          temperature: 0.7,
          max_tokens: analysisConfig.maxTokens,
        }),
      });

      console.log('📡 Resposta da OpenAI:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na API OpenAI:', errorText);
        throw new Error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Dados recebidos da OpenAI:', data);
      
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
        
        console.log('✅ Análise concluída com sucesso');
        
        toast({
          title: "✅ Análise concluída",
          description: `Documento analisado por ${assistant.name} (${analysisConfig.label})`,
        });
      } else {
        throw new Error('Resposta vazia da OpenAI');
      }

    } catch (error: any) {
      console.error('❌ Erro ao analisar documento:', error);
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
    if (!input.trim() || !analysisResult || !isOpenAIConfigured || !selectedAssistant) return;

    const assistant = activeAssistants.find(a => a.id === selectedAssistant);
    if (!assistant) return;

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
        `${m.sender === 'user' ? 'Usuário' : assistant.name}: ${m.text}`
      ).join('\n\n');

      const systemPrompt = `${assistant.prompt}

CONTEXTO DA CONVERSA:
- Você é o assistente "${assistant.name}" especializado em "${assistant.area}"
- Você já analisou um documento e agora está conversando com o usuário sobre essa análise
- Mantenha o foco na sua área de especialização

ANÁLISE ANTERIOR REALIZADA:
${analysisResult}

DOCUMENTO ANALISADO:
Arquivo: ${selectedDocument?.metadata.fileName}
Tipo: ${selectedDocument?.metadata.fileType}

HISTÓRICO DA CONVERSA:
${conversationContext}

INSTRUÇÕES:
- Responda perguntas sobre a análise realizada
- Forneça esclarecimentos e detalhamentos quando solicitado
- Mantenha o foco no documento analisado e na sua área de especialização
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
        const errorText = await response.text();
        throw new Error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
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
      console.error('❌ Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Ocorreu um erro ao processar a mensagem.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se não há documento selecionado, mostrar mensagem
  if (!selectedDocument) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Selecione um documento na aba "Arquivos" para iniciar a análise</p>
        </CardContent>
      </Card>
    );
  }

  const estimatedTokens = estimateTokens(selectedDocument.text);
  const selectedAnalysisConfig = ANALYSIS_TYPES[selectedAnalysisType as keyof typeof ANALYSIS_TYPES];

  return (
    <div className="space-y-6">
      {/* Informações do Documento Selecionado */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <FileText className="h-5 w-5" />
            Documento Selecionado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">{selectedDocument.metadata.fileName}</h3>
              <p className="text-sm text-blue-600">
                {(selectedDocument.metadata.fileSize / 1024).toFixed(1)} KB • 
                {estimatedTokens.toLocaleString()} tokens estimados
              </p>
            </div>
          </div>
          
          {/* Aviso para documentos muito grandes */}
          {isDocumentTooLarge && (
            <Alert className="mt-3 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>⚠️ Documento grande:</strong> O documento será automaticamente truncado para caber no limite da IA. 
                Apenas a primeira parte será analisada.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Seletor de Assistente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Escolher Assistente para Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Selecione o assistente especializado:</label>
            <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha um assistente para fazer a análise" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {activeAssistants.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    <div className="flex items-center gap-2">
                      <span>{assistant.icon || '🤖'}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{assistant.name}</span>
                        <span className="text-xs text-gray-500">
                          Especialista em {assistant.area}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAssistant && (
              <p className="text-sm text-green-600 mt-2">
                ✅ {activeAssistants.find(a => a.id === selectedAssistant)?.name} selecionado
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seletor de Tipo de Análise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Configuração da Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Análise:</label>
              <Select value={selectedAnalysisType} onValueChange={setSelectedAnalysisType}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha o tipo de análise" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {Object.entries(ANALYSIS_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex flex-col">
                        <span className="font-medium">{config.label}</span>
                        <span className="text-xs text-gray-500">{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calculadora de Custo */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Calculadora de Custo</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCostCalculator(!showCostCalculator)}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  {showCostCalculator ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>
              
              {showCostCalculator && (
                <CostEstimator
                  estimatedTokens={Math.min(estimatedTokens, 100000)}
                  maxTokens={selectedAnalysisConfig.maxTokens}
                  model={config.openai?.model || 'gpt-4o-mini'}
                  fileName={selectedDocument.metadata.fileName}
                />
              )}
            </div>

            <Button
              onClick={handleAnalyzeDocument}
              disabled={isAnalyzing || !selectedAssistant || !isOpenAIConfigured}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Gerar {selectedAnalysisConfig.label}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Área de Chat com o Assistente */}
      {analysisResult && selectedAssistant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Chat com {activeAssistants.find(a => a.id === selectedAssistant)?.name}
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
                        <pre className="whitespace-pre-wrap font-sans">{message.text}</pre>
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
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
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
