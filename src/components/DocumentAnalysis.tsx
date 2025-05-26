import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Brain, AlertCircle, CheckCircle, XCircle, Info, Settings, Send, User, Bot, MessageSquare, Mic, MicOff, Link, FileVideo, FileAudio, Globe, Play, Pause, Square } from 'lucide-react';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';
import { useCommercialAssistantsConfig } from '@/hooks/useCommercialAssistantsConfig';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { CostEstimator } from './CostEstimator';
import { useLocation } from 'react-router-dom';

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

interface MediaRecorder {
  start(): void;
  stop(): void;
  ondataavailable: ((event: BlobEvent) => void) | null;
  onstop: (() => void) | null;
  state: 'inactive' | 'recording' | 'paused';
}

declare global {
  interface Window {
    MediaRecorder: {
      new (stream: MediaStream, options?: MediaRecorderOptions): MediaRecorder;
      isTypeSupported(type: string): boolean;
    };
  }
}

interface MediaRecorderOptions {
  mimeType?: string;
}

export function DocumentAnalysis() {
  const location = useLocation();
  const isCommercialModule = location.pathname.includes('/commercial');
  
  // Usar hook apropriado baseado no módulo
  const observatorioConfig = useAssistantsConfig();
  const commercialConfig = useCommercialAssistantsConfig();
  
  const { assistants, isLoading } = isCommercialModule ? commercialConfig : observatorioConfig;
  const { config, connectionStatus } = useClientConfig();
  
  // Estados existentes
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini');
  const [maxTokens, setMaxTokens] = useState<number>(80000);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [currentAnalysisAssistant, setCurrentAnalysisAssistant] = useState<string | null>(null);
  const [documentInfo, setDocumentInfo] = useState<{ size: number; willBeTruncated: boolean; estimatedTokens: number } | null>(null);
  
  // Estados do chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatAssistant, setChatAssistant] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Novos estados para áudio
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Estados para áudio do chat
  const [isChatRecording, setIsChatRecording] = useState(false);
  const [chatAudioBlob, setChatAudioBlob] = useState<Blob | null>(null);
  const [chatMediaRecorder, setChatMediaRecorder] = useState<MediaRecorder | null>(null);
  const [chatRecordingTime, setChatRecordingTime] = useState(0);
  const [isTranscribingChat, setIsTranscribingChat] = useState(false);
  const chatRecordingInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Estados para URL
  const [urlInput, setUrlInput] = useState('');
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  
  // Estados para mídia
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Opções de tokens disponíveis
  const tokenOptions = [
    { value: 40000, label: "40K tokens (Documentos pequenos)" },
    { value: 80000, label: "80K tokens (Recomendado)" },
    { value: 120000, label: "120K tokens (Documentos grandes)" },
    { value: 150000, label: "150K tokens (Máximo seguro)" }
  ];

  const apiStatus = connectionStatus.openai ? 'valid' : (config.openai.apiKey ? 'invalid' : 'unknown');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Timer para gravação
  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording]);

  // Timer para gravação do chat
  useEffect(() => {
    if (isChatRecording) {
      chatRecordingInterval.current = setInterval(() => {
        setChatRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (chatRecordingInterval.current) {
        clearInterval(chatRecordingInterval.current);
      }
      setChatRecordingTime(0);
    }

    return () => {
      if (chatRecordingInterval.current) {
        clearInterval(chatRecordingInterval.current);
      }
    };
  }, [isChatRecording]);

  // Função para iniciar gravação
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      const mimeType = window.MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      const recorder = new window.MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      toast({
        title: "Gravação iniciada",
        description: "Fale agora. Clique em parar quando terminar.",
      });
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      toast({
        title: "Erro no microfone",
        description: "Não foi possível acessar o microfone. Verifique as permissões.",
        variant: "destructive",
      });
    }
  };

  // Função para parar gravação
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      
      toast({
        title: "Gravação finalizada",
        description: "Áudio capturado com sucesso. Agora você pode transcrevê-lo.",
      });
    }
  };

  // Função para transcrever áudio
  const transcribeAudio = async () => {
    if (!audioBlob) return;
    
    setIsTranscribing(true);
    
    try {
      // Converter blob para base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = Array.from(uint8Array).map(byte => String.fromCharCode(byte)).join('');
      const base64Audio = btoa(binaryString);
      
      const response = await fetch('https://duyxbtfknilgrvgsvlyy.functions.supabase.co/functions/v1/voice-to-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audio: base64Audio }),
      });
      
      if (!response.ok) {
        throw new Error('Erro na transcrição');
      }
      
      const data = await response.json();
      setNewMessage(data.text);
      
      toast({
        title: "Transcrição concluída",
        description: "O áudio foi convertido em texto com sucesso.",
      });
    } catch (error) {
      console.error('Erro na transcrição:', error);
      toast({
        title: "Erro na transcrição",
        description: "Não foi possível transcrever o áudio.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  // Função para processar URL
  const processUrl = async () => {
    if (!urlInput.trim() || !selectedAssistant) {
      toast({
        title: "Dados incompletos",
        description: "Insira uma URL válida e selecione um assistente.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingUrl(true);
    
    try {
      const assistant = assistants.find(a => a.id === selectedAssistant);
      if (!assistant) {
        throw new Error('Assistente não encontrado');
      }

      // Simular processamento de URL (aqui você implementaria a lógica real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysis = `**Análise de URL por ${assistant.name}**\n\nURL analisada: ${urlInput}\n\nEsta é uma análise simulada da URL fornecida. A implementação real extrairia o conteúdo da página e faria uma análise completa baseada na especialidade do assistente em ${assistant.area}.`;
      
      setAnalysisResult(analysis);
      setCurrentAnalysisAssistant(assistant.name);
      
      const analysisMessage: ChatMessage = {
        id: Date.now().toString(),
        text: analysis,
        sender: 'assistant',
        timestamp: new Date(),
        assistantName: assistant.name
      };
      setChatMessages([analysisMessage]);
      setChatAssistant(selectedAssistant);
      
      toast({
        title: "URL processada",
        description: `${assistant.name} analisou a URL com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao processar URL:', error);
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar a URL.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingUrl(false);
    }
  };

  // Função para processar arquivo de mídia
  const processMediaFile = async () => {
    if (!selectedMediaFile || !selectedAssistant) {
      toast({
        title: "Dados incompletos",
        description: "Selecione um arquivo de mídia e um assistente.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingMedia(true);
    
    try {
      const assistant = assistants.find(a => a.id === selectedAssistant);
      if (!assistant) {
        throw new Error('Assistente não encontrado');
      }

      // Simular processamento de mídia (aqui você implementaria a lógica real)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mediaType = selectedMediaFile.type.startsWith('video/') ? 'vídeo' : 'áudio';
      const analysis = `**Análise de ${mediaType} por ${assistant.name}**\n\nArquivo: ${selectedMediaFile.name}\nTipo: ${selectedMediaFile.type}\nTamanho: ${(selectedMediaFile.size / 1024 / 1024).toFixed(2)} MB\n\nEsta é uma análise simulada do arquivo de ${mediaType}. A implementação real extrairia o conteúdo do arquivo e faria uma análise completa baseada na especialidade do assistente em ${assistant.area}.`;
      
      setAnalysisResult(analysis);
      setCurrentAnalysisAssistant(assistant.name);
      
      const analysisMessage: ChatMessage = {
        id: Date.now().toString(),
        text: analysis,
        sender: 'assistant',
        timestamp: new Date(),
        assistantName: assistant.name
      };
      setChatMessages([analysisMessage]);
      setChatAssistant(selectedAssistant);
      
      toast({
        title: `${mediaType} processado`,
        description: `${assistant.name} analisou o arquivo de ${mediaType} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao processar mídia:', error);
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar o arquivo de mídia.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingMedia(false);
    }
  };

  // Função para selecionar arquivo de mídia
  const handleMediaFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isVideoFile = file.type.startsWith('video/');
      const isAudioFile = file.type.startsWith('audio/');
      
      if (isVideoFile || isAudioFile) {
        setSelectedMediaFile(file);
        toast({
          title: "Arquivo carregado",
          description: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB) está pronto para análise.`,
        });
      } else {
        toast({
          title: "Tipo de arquivo não suportado",
          description: "Por favor, selecione um arquivo de vídeo ou áudio.",
          variant: "destructive",
        });
      }
    }
  };

  // Funções existentes mantidas...
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isTextFile = file.type.includes('text') || 
                        file.name.match(/\.(txt|md|csv|json|xml|html|css|js|ts|jsx|tsx|py|java|cpp|c|h|sql|log|conf|config|ini|yaml|yml)$/i);
      
      if (isTextFile || file.type === 'application/json' || file.type === 'text/plain' || file.type === '') {
        setSelectedFile(file);
        
        const fileSizeKB = file.size / 1024;
        const estimatedTokens = Math.ceil(file.size / 3);
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
    
    let truncateAt = maxChars;
    const nearbyNewline = content.lastIndexOf('\n', maxChars);
    if (nearbyNewline > maxChars * 0.9) {
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
      
      console.log('📖 Lendo arquivo...');
      const fileContent = await readFileContent(selectedFile);
      console.log('📖 Arquivo lido:', fileContent.length, 'caracteres');
      
      const { content: processedContent, wasTruncated } = truncateContent(fileContent, maxTokens);
      
      if (wasTruncated) {
        console.log('✂️ Conteúdo truncado para análise segura');
        toast({
          title: "Documento truncado",
          description: `O documento foi truncado para ${maxTokens.toLocaleString()} tokens. Os primeiros segmentos serão analisados.`,
          variant: "default",
        });
      }
      
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

      if (estimatedTokens > 120000) {
        throw new Error('Documento ainda muito grande após truncagem');
      }

      const requestBody = {
        model: selectedModel,
        messages: messages,
        temperature: config.openai.temperature || 0.7,
        max_tokens: Math.min(config.openai.maxTokens || 3000, 4000)
      };

      console.log('🚀 Fazendo chamada para OpenAI...');

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
      console.log('📥 Resposta OpenAI recebida');
      
      const analysis = data.choices?.[0]?.message?.content;
      
      if (!analysis) {
        console.log('❌ Resposta vazia da OpenAI');
        throw new Error('Resposta vazia da OpenAI');
      }
      
      console.log('✅ Análise concluída por', assistant.name, 'usando', selectedModel);
      
      setAnalysisResult(analysis);
      setCurrentAnalysisAssistant(assistant.name);
      
      if (chatMessages.length === 0) {
        const analysisMessage: ChatMessage = {
          id: Date.now().toString(),
          text: analysis,
          sender: 'assistant',
          timestamp: new Date(),
          assistantName: assistant.name
        };
        setChatMessages([analysisMessage]);
        setChatAssistant(selectedAssistant);
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
      const assistant = assistants.find(a => a.id === activeAssistant);
      if (!assistant) {
        throw new Error('Assistente não encontrado');
      }

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const moduleTitle = isCommercialModule ? "Análise Comercial" : "Análise e Conselho";
  const moduleDescription = isCommercialModule 
    ? "Analise documentos, áudio, vídeo, URLs e converse com assistentes especializados em vendas e gestão comercial"
    : "Analise documentos, áudio, vídeo, URLs e converse com assistentes especializados";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{moduleTitle}</h2>
        <p className="text-slate-600">{moduleDescription}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload e Configuração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Análise de Conteúdo
            </CardTitle>
            <CardDescription>
              Configure o modelo, escolha o tipo de conteúdo e faça a análise
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
            </div>

            {/* Seleção de Assistente */}
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

            {/* Tabs para diferentes tipos de conteúdo */}
            <Tabs defaultValue="document" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="document" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Documento
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center gap-1">
                  <Mic className="h-3 w-3" />
                  Áudio
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-1">
                  <FileVideo className="h-3 w-3" />
                  Mídia
                </TabsTrigger>
              </TabsList>

              {/* Aba Documento */}
              <TabsContent value="document" className="space-y-4">
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
                </div>

                {selectedFile && documentInfo && (
                  <div className="p-3 bg-green-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">{selectedFile.name}</span>
                    </div>
                    <div className="text-xs text-green-600 mt-1 space-y-1">
                      <p>{documentInfo.size.toFixed(1)} KB (~{documentInfo.estimatedTokens.toLocaleString()} tokens estimados)</p>
                      {documentInfo.willBeTruncated && (
                        <div className="flex items-center gap-1 mt-2">
                          <AlertCircle className="h-3 w-3 text-blue-600" />
                          <span className="text-xs text-blue-600">
                            Documento será truncado - primeiros {maxTokens.toLocaleString()} tokens serão analisados
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={analyzeDocument}
                  disabled={!selectedFile || !selectedAssistant || isAnalyzing || apiStatus !== 'valid'}
                  className="w-full"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {isAnalyzing ? 'Analisando...' : 'Analisar Documento'}
                </Button>
              </TabsContent>

              {/* Aba Áudio */}
              <TabsContent value="audio" className="space-y-4">
                <div className="text-center">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    {!isRecording && !audioBlob && (
                      <div>
                        <Mic className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">Grave um áudio para análise</p>
                        <Button onClick={startRecording} disabled={apiStatus !== 'valid'}>
                          <Mic className="h-4 w-4 mr-2" />
                          Iniciar Gravação
                        </Button>
                      </div>
                    )}

                    {isRecording && (
                      <div>
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-red-600 font-medium">Gravando...</span>
                        </div>
                        <p className="text-2xl font-mono mb-4">{formatTime(recordingTime)}</p>
                        <Button onClick={stopRecording} variant="destructive">
                          <Square className="h-4 w-4 mr-2" />
                          Parar Gravação
                        </Button>
                      </div>
                    )}

                    {audioBlob && !isRecording && (
                      <div>
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                        <p className="text-green-600 mb-4">Áudio gravado com sucesso!</p>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            onClick={transcribeAudio} 
                            disabled={isTranscribing}
                            variant="outline"
                          >
                            {isTranscribing ? 'Transcrevendo...' : 'Transcrever para Texto'}
                          </Button>
                          <Button 
                            onClick={() => {
                              setAudioBlob(null);
                              setRecordingTime(0);
                            }}
                            variant="outline"
                          >
                            Nova Gravação
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Aba URL */}
              <TabsContent value="url" className="space-y-4">
                <div>
                  <Label htmlFor="url-input">URL para Análise</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="url-input"
                      type="url"
                      placeholder="https://exemplo.com"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={processUrl}
                      disabled={!urlInput.trim() || !selectedAssistant || isProcessingUrl || apiStatus !== 'valid'}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      {isProcessingUrl ? 'Processando...' : 'Analisar'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Insira a URL de uma página web para análise de conteúdo
                  </p>
                </div>
              </TabsContent>

              {/* Aba Mídia */}
              <TabsContent value="media" className="space-y-4">
                <div>
                  <Label htmlFor="media-upload">Arquivo de Vídeo ou Áudio</Label>
                  <input
                    id="media-upload"
                    type="file"
                    accept="video/*,audio/*"
                    onChange={handleMediaFileSelect}
                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Suporta arquivos de vídeo (MP4, AVI, MOV) e áudio (MP3, WAV, M4A)
                  </p>
                </div>

                {selectedMediaFile && (
                  <div className="p-3 bg-purple-50 rounded-md">
                    <div className="flex items-center gap-2">
                      {selectedMediaFile.type.startsWith('video/') ? (
                        <FileVideo className="h-4 w-4 text-purple-600" />
                      ) : (
                        <FileAudio className="h-4 w-4 text-purple-600" />
                      )}
                      <span className="text-sm font-medium text-purple-800">{selectedMediaFile.name}</span>
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      <p>Tamanho: {(selectedMediaFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p>Tipo: {selectedMediaFile.type}</p>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={processMediaFile}
                  disabled={!selectedMediaFile || !selectedAssistant || isProcessingMedia || apiStatus !== 'valid'}
                  className="w-full"
                >
                  {selectedMediaFile?.type.startsWith('video/') ? (
                    <FileVideo className="h-4 w-4 mr-2" />
                  ) : (
                    <FileAudio className="h-4 w-4 mr-2" />
                  )}
                  {isProcessingMedia ? 'Processando...' : 'Analisar Mídia'}
                </Button>
              </TabsContent>
            </Tabs>
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
              Converse com o assistente sobre a análise ou faça perguntas gerais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <ScrollArea className="h-96 border rounded-md p-4">
              <div className="space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Inicie uma conversa ou faça uma análise primeiro</p>
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

            <div className="space-y-2">
              {chatAudioBlob && !isTranscribingChat && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                  <FileAudio className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">Áudio transcrito e adicionado à mensagem</span>
                </div>
              )}

              {isTranscribingChat && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-blue-700">Transcrevendo áudio...</span>
                </div>
              )}

              {isChatRecording && (
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-700">
                    Gravando: {formatTime(chatRecordingTime)}
                  </span>
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem ou grave um áudio..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                
                {/* Botão de gravação de áudio */}
                <Button
                  variant={isChatRecording ? "destructive" : "outline"}
                  size="icon"
                  onClick={isChatRecording ? stopChatRecording : startChatRecording}
                  disabled={isTranscribingChat || apiStatus !== 'valid'}
                >
                  {isChatRecording ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>

                <Button 
                  onClick={sendChatMessage} 
                  disabled={!newMessage.trim() || isTyping || (!chatAssistant && !selectedAssistant) || apiStatus !== 'valid'}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {apiStatus !== 'valid' && (
              <div className="text-center text-sm text-red-600">
                Configure a API do OpenAI nas configurações para usar o chat
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estimador de Custo */}
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
          <CardTitle>
            {isCommercialModule ? "Assistentes Comerciais Disponíveis" : "Assistentes Disponíveis"}
          </CardTitle>
          <CardDescription>
            {isCommercialModule 
              ? "Cada assistente oferece uma perspectiva especializada em operações comerciais"
              : "Cada assistente oferece uma perspectiva especializada na análise e conversa"
            }
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
