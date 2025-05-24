import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Upload, Brain, AlertCircle, CheckCircle, XCircle, Info, Settings, Send, User, Bot, MessageSquare } from 'lucide-react';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { CostEstimator } from './CostEstimator';

// Modelos LLM disponíveis
const LLM_MODELS = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Rápido e econômico - Ideal para análises básicas',
    costPerK: { input: 0.00015, output: 0.0006 }
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Mais poderoso - Análises detalhadas e complexas',
    costPerK: { input: 0.005, output: 0.015 }
  }
];

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  assistantName?: string;
}

export function DocumentAnalysis() {
  const { assistants, isLoading } = useAssistantsConfig();
  const { config, connectionStatus } = useClientConfig();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini');
  const [maxTokens, setMaxTokens] = useState<number>(80000);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [currentAnalysisAssistant, setCurrentAnalysisAssistant] = useState<string | null>(null);
  const [documentInfo, setDocumentInfo] = useState<{ size: number; willBeTruncated: boolean; estimatedTokens: number } | null>(null);
  
  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatAssistant, setChatAssistant] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Opções de tokens disponíveis
  const tokenOptions = [
    { value: 40000, label: "40K tokens (Documentos pequenos)" },
    { value: 80000, label: "80K tokens (Recomendado)" },
    { value: 120000, label: "120K tokens (Documentos grandes)" },
    { value: 150000, label: "150K tokens (Máximo seguro)" }
  ];

  // Use the connection status from the client config context
  const apiStatus = connectionStatus.openai ? 'valid' : (config.openai.apiKey ? 'invalid' : 'unknown');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Aceitar qualquer arquivo de texto
      const isTextFile = file.type.includes('text') || 
                        file.name.match(/\.(txt|md|csv|json|xml|html|css|js|ts|jsx|tsx|py|java|cpp|c|h|sql|log|conf|config|ini|yaml|yml)$/i);
      
      if (isTextFile || file.type === 'application/json' || file.type === 'text/plain' || file.type === '') {
        setSelectedFile(file);
        
        // Calcular informações do documento
        const fileSizeKB = file.size / 1024;
        const estimatedTokens = Math.ceil(file.size / 3); // 1 token ≈ 3 caracteres
        const willBeTruncated = estimatedTokens > maxTokens;
        
        setDocumentInfo({
          size: fileSizeKB,
          willBeTruncated,
          estimatedTokens
        });
        
        toast({
          title: "Arquivo carregado",
          description: `${file.name} (${fileSizeKB.toFixed(1)} KB, ~${estimatedTokens.toLocaleString()} tokens) ${willBeTruncated ? '- será truncado para análise' : '- será analisado completamente'}`,
        });
      } else {
        toast({
          title: "Tipo de arquivo não suportado",
          description: "Por favor, selecione um arquivo de texto (txt, md, csv, json, xml, html, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  // Recalcular informações quando maxTokens mudar
  useEffect(() => {
    if (selectedFile && documentInfo) {
      const estimatedTokens = Math.ceil(selectedFile.size / 3);
      const willBeTruncated = estimatedTokens > maxTokens;
      
      setDocumentInfo({
        size: documentInfo.size,
        willBeTruncated,
        estimatedTokens
      });
    }
  }, [maxTokens, selectedFile]);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file, 'UTF-8');
    });
  };

  const truncateContent = (content: string, maxTokensLimit: number): { content: string; wasTruncated: boolean } => {
    // Estimativa conservadora: 1 token ≈ 3 caracteres
    const maxChars = Math.floor(maxTokensLimit * 3);
    
    console.log('📏 Truncagem:', {
      contentLength: content.length,
      maxChars,
      maxTokens: maxTokensLimit,
      willTruncate: content.length > maxChars
    });
    
    if (content.length <= maxChars) {
      return { content, wasTruncated: false };
    }
    
    // Truncar em uma quebra de linha próxima ao limite para manter contexto
    let truncateAt = maxChars;
    const nearbyNewline = content.lastIndexOf('\n', maxChars);
    if (nearbyNewline > maxChars * 0.9) { // Se há uma quebra de linha nos últimos 10%
      truncateAt = nearbyNewline;
    }
    
    const truncatedContent = content.substring(0, truncateAt) + 
      "\n\n[DOCUMENTO TRUNCADO PARA ANÁLISE - CONTEÚDO RESTANTE NÃO PROCESSADO]";
    
    console.log('✂️ Conteúdo truncado:', {
      originalLength: content.length,
      truncatedLength: truncatedContent.length,
      truncateAt,
      estimatedTokens: Math.ceil(truncatedContent.length / 3)
    });
    
    return { content: truncatedContent, wasTruncated: true };
  };

  const analyzeDocument = async () => {
    if (!selectedFile || !selectedAssistant || !user?.id) {
      console.log('❌ Parâmetros inválidos:', { 
        hasFile: !!selectedFile, 
        hasAssistant: !!selectedAssistant, 
        hasUser: !!user?.id 
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('📄 Iniciando análise do documento...');
      console.log('📊 Arquivo:', {
        nome: selectedFile.name,
        tamanho: selectedFile.size,
        tipo: selectedFile.type,
        maxTokensConfig: maxTokens,
        modeloSelecionado: selectedModel
      });
      
      // Verificar se a configuração OpenAI está válida
      if (!config.openai?.apiKey) {
        console.log('❌ API Key não encontrada');
        toast({
          title: "API Key não configurada",
          description: "Configure sua API Key do OpenAI na aba 'Configurações → OpenAI'",
          variant: "destructive",
        });
        return;
      }

      if (!config.openai.apiKey.startsWith('sk-')) {
        console.log('❌ API Key formato inválido');
        toast({
          title: "API Key inválida",
          description: "A API Key deve começar com 'sk-'",
          variant: "destructive",
        });
        return;
      }

      if (!connectionStatus.openai) {
        console.log('❌ Conexão OpenAI falhou');
        toast({
          title: "Problema com a conexão",
          description: "Teste a conexão OpenAI na aba 'Configurações → OpenAI'",
          variant: "destructive",
        });
        return;
      }
      
      // Ler conteúdo do arquivo
      console.log('📖 Lendo arquivo...');
      const fileContent = await readFileContent(selectedFile);
      console.log('📖 Arquivo lido:', fileContent.length, 'caracteres');
      
      // Truncar conteúdo com limite configurado
      const { content: processedContent, wasTruncated } = truncateContent(fileContent, maxTokens);
      
      if (wasTruncated) {
        console.log('✂️ Conteúdo truncado para análise segura');
        toast({
          title: "Documento truncado",
          description: `O documento foi truncado para ${maxTokens.toLocaleString()} tokens. Os primeiros segmentos serão analisados.`,
          variant: "default",
        });
      }
      
      // Buscar o assistente selecionado
      const assistant = assistants.find(a => a.id === selectedAssistant);
      if (!assistant) {
        console.log('❌ Assistente não encontrado');
        throw new Error('Assistente não encontrado');
      }

      console.log('🤖 Assistente selecionado para análise:', {
        id: assistant.id,
        name: assistant.name,
        area: assistant.area,
        modeloEscolhido: selectedModel
      });

      // Construir mensagens para OpenAI com prompt mais conciso
      const systemPrompt = `Você é ${assistant.name}, ${assistant.description}.

${assistant.prompt}

Analise o documento fornecido da perspectiva de ${assistant.area}. ${wasTruncated ? 'IMPORTANTE: Este documento foi truncado. Analise apenas o conteúdo fornecido e mencione que a análise é baseada nos primeiros segmentos.' : ''}

INSTRUÇÕES:
- Comece com: "**Análise de ${assistant.name}**"
- Forneça insights de ${assistant.area}
- Seja conciso mas informativo
- Use markdown para organização`;

      const userPrompt = `ARQUIVO: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)
ASSISTENTE: ${assistant.name}
MODELO: ${selectedModel}
LIMITE DE TOKENS: ${maxTokens.toLocaleString()}
${wasTruncated ? 'STATUS: Documento truncado\n' : ''}
CONTEÚDO:
${processedContent}`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt }
      ];

      // Estimar tokens totais antes de enviar
      const estimatedTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 3);
      console.log('🧮 Estimativa de tokens:', {
        systemPromptChars: systemPrompt.length,
        userPromptChars: userPrompt.length,
        totalChars: systemPrompt.length + userPrompt.length,
        estimatedTokens,
        maxTokensAllowed: 128000,
        configuredLimit: maxTokens,
        modeloUtilizado: selectedModel
      });

      if (estimatedTokens > 120000) { // Deixa margem de segurança
        throw new Error('Documento ainda muito grande após truncagem');
      }

      const requestBody = {
        model: selectedModel, // Usar o modelo selecionado pelo usuário
        messages: messages,
        temperature: config.openai.temperature || 0.7,
        max_tokens: Math.min(config.openai.maxTokens || 3000, 4000)
      };

      console.log('🚀 Fazendo chamada para OpenAI...', {
        model: requestBody.model,
        messagesCount: requestBody.messages.length,
        temperature: requestBody.temperature,
        maxTokens: requestBody.max_tokens,
        contentLength: processedContent.length,
        assistantName: assistant.name,
        estimatedInputTokens: estimatedTokens,
        configuredTokenLimit: maxTokens
      });

      // Fazer análise via OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Resposta OpenAI status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro OpenAI:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        let errorMessage = 'Erro na análise do documento';
        if (response.status === 401) {
          errorMessage = 'API Key inválida - verifique nas configurações';
        } else if (response.status === 429) {
          errorMessage = 'Limite de rate excedido - tente novamente em alguns minutos';
        } else if (response.status === 400) {
          errorMessage = 'Documento ainda muito complexo - tente reduzir o limite de tokens';
        }
        
        throw new Error(`${errorMessage} (${response.status})`);
      }

      const data = await response.json();
      console.log('📥 Resposta OpenAI recebida:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        hasContent: !!data.choices?.[0]?.message?.content,
        usage: data.usage,
        assistantUsed: assistant.name,
        modelUsed: selectedModel
      });
      
      const analysis = data.choices?.[0]?.message?.content;
      
      if (!analysis) {
        console.log('❌ Resposta vazia da OpenAI');
        throw new Error('Resposta vazia da OpenAI');
      }
      
      console.log('✅ Análise concluída por', assistant.name, 'usando', selectedModel, ':', analysis.length, 'caracteres');
      
      setAnalysisResult(analysis);
      setCurrentAnalysisAssistant(assistant.name);
      
      // Adicionar a análise como primeira mensagem do chat se ainda não há mensagens
      if (chatMessages.length === 0) {
        const analysisMessage: ChatMessage = {
          id: Date.now().toString(),
          text: analysis,
          sender: 'assistant',
          timestamp: new Date(),
          assistantName: assistant.name
        };
        setChatMessages([analysisMessage]);
        setChatAssistant(selectedAssistant); // Definir o assistente do chat como o mesmo da análise
      }
      
      toast({
        title: "Análise concluída",
        description: `${assistant.name} analisou seu documento com sucesso usando ${selectedModel}${wasTruncated ? ' (parcialmente devido ao limite de tokens)' : ''}`,
      });

    } catch (error) {
      console.error('❌ Erro completo na análise:', error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Não foi possível analisar o documento",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim()) return;

    // Verificar se há assistente selecionado para o chat
    const activeAssistant = chatAssistant || selectedAssistant;
    if (!activeAssistant) {
      toast({
        title: "Selecione um assistente",
        description: "Escolha um assistente para conversar",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const messageText = newMessage;
    setNewMessage('');
    setIsTyping(true);

    try {
      // Buscar o assistente selecionado
      const assistant = assistants.find(a => a.id === activeAssistant);
      if (!assistant) {
        throw new Error('Assistente não encontrado');
      }

      // Construir histórico de mensagens para contexto
      const chatHistory = chatMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const systemPrompt = `Você é ${assistant.name}, ${assistant.description}.

${assistant.prompt}

Você está conversando com o usuário. ${analysisResult ? 'Você já analisou um documento anteriormente nesta sessão.' : 'O usuário pode fazer perguntas gerais ou sobre análise de documentos.'}

INSTRUÇÕES:
- Seja conversacional e prestativo
- Use seu conhecimento de ${assistant.area}
- Mantenha as respostas concisas mas informativas
- Se relevante, mencione insights da análise anterior`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...chatHistory,
        { role: 'user' as const, content: messageText }
      ];

      const requestBody = {
        model: selectedModel,
        messages: messages,
        temperature: config.openai.temperature || 0.7,
        max_tokens: Math.min(config.openai.maxTokens || 1000, 2000)
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.choices?.[0]?.message?.content;

      if (assistantResponse) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: assistantResponse,
          sender: 'assistant',
          timestamp: new Date(),
          assistantName: assistant.name
        };

        setChatMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('Erro no chat:', error);
      toast({
        title: "Erro no chat",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Carregando assistentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Análise e Conselho</h2>
        <p className="text-slate-600">Analise documentos e converse com assistentes especializados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload e Configuração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Documento
            </CardTitle>
            <CardDescription>
              Configure o modelo, limite de tokens e faça upload do seu documento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Seleção de Modelo LLM */}
            <div>
              <Label className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Modelo de IA para Análise
              </Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Escolha o modelo de IA" />
                </SelectTrigger>
                <SelectContent>
                  {LLM_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-gray-500">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                GPT-4o Mini é mais rápido e econômico. GPT-4o oferece análises mais detalhadas.
              </p>
            </div>

            {/* Seleção de Limite de Tokens */}
            <div>
              <Label className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Limite de Tokens para Análise
              </Label>
              <Select value={maxTokens.toString()} onValueChange={(value) => setMaxTokens(parseInt(value))}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Escolha o limite de tokens" />
                </SelectTrigger>
                <SelectContent>
                  {tokenOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                1 token ≈ 3-4 caracteres. Maior limite = mais conteúdo analisado.
              </p>
            </div>

            <div>
              <Label htmlFor="file-upload">Arquivo de Texto</Label>
              <input
                id="file-upload"
                type="file"
                accept=".txt,.md,.csv,.json,.xml,.html,.css,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.sql,.log,.conf,.config,.ini,.yaml,.yml,text/*,application/json"
                onChange={handleFileSelect}
                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tipos suportados: TXT, MD, CSV, JSON, XML, HTML, CSS, JS, TS, Python, Java, C++, SQL, LOG, YAML e outros arquivos de texto
              </p>
            </div>

            {selectedFile && documentInfo && (
              <div className="p-3 bg-green-50 rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">{selectedFile.name}</span>
                </div>
                <div className="text-xs text-green-600 mt-1 space-y-1">
                  <p>{documentInfo.size.toFixed(1)} KB (~{documentInfo.estimatedTokens.toLocaleString()} tokens estimados)</p>
                  <p>Limite configurado: {maxTokens.toLocaleString()} tokens</p>
                  <p>Modelo selecionado: {LLM_MODELS.find(m => m.id === selectedModel)?.name}</p>
                </div>
                {documentInfo.willBeTruncated && (
                  <div className="flex items-center gap-1 mt-2">
                    <AlertCircle className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-600">
                      Documento será truncado - primeiros {maxTokens.toLocaleString()} tokens serão analisados
                    </span>
                  </div>
                )}
              </div>
            )}

            <div>
              <Label>Assistente para Análise</Label>
              <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Escolha um assistente" />
                </SelectTrigger>
                <SelectContent>
                  {assistants.filter(a => a.isActive).map((assistant) => (
                    <SelectItem key={assistant.id} value={assistant.id}>
                      <div className="flex items-center gap-2">
                        <span>{assistant.icon}</span>
                        <span>{assistant.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {assistant.area}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={analyzeDocument}
              disabled={!selectedFile || !selectedAssistant || isAnalyzing || apiStatus !== 'valid'}
              className="w-full"
            >
              <Brain className="h-4 w-4 mr-2" />
              {isAnalyzing ? 'Analisando...' : 'Analisar Documento'}
            </Button>
          </CardContent>
        </Card>

        {/* Chat com IA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat com IA
            </CardTitle>
            <CardDescription>
              Converse com o assistente sobre o documento ou faça perguntas gerais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Seletor de assistente para chat se não há análise */}
            {!analysisResult && (
              <div>
                <Label>Assistente para Conversa</Label>
                <Select value={chatAssistant} onValueChange={setChatAssistant}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Escolha um assistente para conversar" />
                  </SelectTrigger>
                  <SelectContent>
                    {assistants.filter(a => a.isActive).map((assistant) => (
                      <SelectItem key={assistant.id} value={assistant.id}>
                        <div className="flex items-center gap-2">
                          <span>{assistant.icon}</span>
                          <span>{assistant.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {assistant.area}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Área de mensagens */}
            <ScrollArea className="h-96 border rounded-md p-4">
              <div className="space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Inicie uma conversa ou analise um documento primeiro</p>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {message.sender === 'assistant' && message.assistantName && (
                          <div className="flex items-center gap-1 mb-1">
                            <Bot className="h-3 w-3" />
                            <span className="text-xs font-bold">{message.assistantName}</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Campo de entrada de mensagem */}
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={sendChatMessage} 
                disabled={!newMessage.trim() || isTyping || (!chatAssistant && !selectedAssistant) || apiStatus !== 'valid'}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {apiStatus !== 'valid' && (
              <div className="text-center text-sm text-red-600">
                Configure a API do OpenAI nas configurações para usar o chat
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estimador de Custo - aparece quando temos arquivo e assistente selecionados */}
      {selectedFile && selectedAssistant && documentInfo && (
        <CostEstimator
          estimatedTokens={documentInfo.estimatedTokens}
          maxTokens={maxTokens}
          model={selectedModel}
          fileName={selectedFile.name}
        />
      )}

      {/* Assistentes Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Assistentes Disponíveis</CardTitle>
          <CardDescription>
            Cada assistente oferece uma perspectiva especializada na análise e conversa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {assistants.filter(a => a.isActive).map((assistant) => (
              <div key={assistant.id} className="p-3 border rounded-md hover:bg-gray-50">
                <div className="text-center">
                  <div className="text-2xl mb-2">{assistant.icon}</div>
                  <h4 className="font-semibold text-sm">{assistant.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{assistant.description}</p>
                  <Badge variant="outline" className="mt-2">
                    {assistant.area}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
