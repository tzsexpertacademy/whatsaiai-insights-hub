
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Upload, 
  Brain, 
  Sparkles, 
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  MessageSquare,
  Send,
  Bot,
  User,
  Settings,
  Zap
} from 'lucide-react';
import { useConversationUpload } from '@/hooks/useConversationUpload';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';
import { CostEstimator } from '@/components/CostEstimator';

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  assistantId?: string;
}

export function DocumentAnalysis() {
  const [conversationText, setConversationText] = useState('');
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState('kairon');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [maxTokens, setMaxTokens] = useState(4000);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'assistant',
      content: 'Olá! Sou seu assistente de análise de documentos. Faça upload de qualquer arquivo ou cole um texto para começarmos a análise.',
      timestamp: new Date(),
      assistantId: 'kairon'
    }
  ]);
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const { uploadAndAnalyze, isUploading } = useConversationUpload();
  const { assistants } = useAssistantsConfig();

  console.log('📄 DocumentAnalysis component rendered with full features');

  const estimatedTokens = selectedFile 
    ? Math.ceil(selectedFile.size / 4) // Aproximação: 1 token ≈ 4 caracteres
    : Math.ceil(conversationText.length / 4);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('📁 Arquivo selecionado:', file.name, file.size, 'bytes');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile && !conversationText.trim()) return;
    
    try {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const fileToAnalyze = selectedFile || new File([conversationText], 'conversation.txt', { type: 'text/plain' });
      const result = await uploadAndAnalyze(fileToAnalyze);
      
      clearInterval(interval);
      setProgress(100);
      
      if (result.success) {
        const selectedAssistantData = assistants.find(a => a.id === selectedAssistant);
        
        // Adicionar mensagem do usuário
        const userMessage: Message = {
          id: messages.length + 1,
          type: 'user',
          content: `Analisei o documento "${selectedFile?.name || 'texto colado'}" usando o assistente ${selectedAssistantData?.name}`,
          timestamp: new Date()
        };
        
        // Simular análise do assistente
        const analysisResponse = getDocumentAnalysis(selectedAssistant, selectedFile?.name || 'documento');
        const assistantMessage: Message = {
          id: messages.length + 2,
          type: 'assistant',
          content: analysisResponse,
          timestamp: new Date(),
          assistantId: selectedAssistant
        };
        
        setMessages(prev => [...prev, userMessage, assistantMessage]);
        setConversationText('');
        setSelectedFile(null);
        
        setTimeout(() => setProgress(0), 1000);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setProgress(0);
    }
  };

  const getDocumentAnalysis = (assistantId: string, fileName: string): string => {
    const analyses = {
      kairon: `Analisei seu documento "${fileName}". Interessante... Vejo alguns padrões aqui que você talvez não tenha percebido. Primeiro, há uma tendência de evitar certas verdades desconfortáveis. O que você está tentando não ver neste conteúdo? Este documento revela mais sobre você do que imagina.`,
      oracle: `Documento "${fileName}" processado. Percebo camadas emocionais profundas neste conteúdo. Há resistências e sombras que merecem atenção. O que este texto desperta em você emocionalmente? Quais memórias ou sentimentos surgem?`,
      guardian: `Análise financeira/estratégica de "${fileName}" concluída. Vejo oportunidades e riscos que precisam ser endereçados. Como este conteúdo impacta seus recursos e estratégia? Que decisões práticas emergem desta análise?`,
      engineer: `Documento "${fileName}" analisado sob perspectiva de performance. Identifiquei padrões que afetam sua energia e vitalidade. Como este conteúdo se relaciona com sua saúde física e mental?`,
      architect: `Estrutura de "${fileName}" mapeada. Vejo gaps estratégicos e oportunidades de organização. Como este documento se alinha com seus objetivos maiores?`,
      weaver: `Análise existencial de "${fileName}" realizada. Encontrei elementos que tocam seu propósito e legado. O que este conteúdo revela sobre seu caminho de vida?`,
      catalyst: `Documento "${fileName}" processado para insights criativos. Identifiquei bloqueios e potenciais inovações. Que novas possibilidades este conteúdo desperta?`,
      mirror: `Análise relacional de "${fileName}" concluída. Vejo padrões de comunicação e dinâmicas interpessoais interessantes. Como este conteúdo reflete seus relacionamentos?`
    };

    return analyses[assistantId as keyof typeof analyses] || analyses.kairon;
  };

  const handleSendChatMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: chatMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setChatMessage('');
    setIsTyping(true);

    // Simular resposta do assistente
    setTimeout(() => {
      const assistantMessage: Message = {
        id: messages.length + 2,
        type: 'assistant',
        content: getAssistantResponse(selectedAssistant, chatMessage),
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
        "Interessante pergunta sobre análise de documentos. O que você realmente quer descobrir com essa análise?",
        "Vou analisar isso, mas me diga: você está preparado para ouvir verdades que podem incomodar?",
        "Posso processar esse documento, mas qual é sua real intenção com essa informação?"
      ],
      oracle: [
        "Vejo potencial para insights profundos neste documento. Que padrões emocionais você espera encontrar?",
        "Seus documentos refletem sua alma. Está pronto para essa análise emocional?",
        "Cada texto revela aspectos ocultos da personalidade. O que você teme descobrir?"
      ],
      guardian: [
        "Vamos analisar os aspectos financeiros e estratégicos deste documento. Que decisões isso pode influenciar?",
        "Todo documento tem implicações de recursos. Como isso impacta sua estratégia?",
        "Análise focada em resultados práticos. Que ações você pretende tomar?"
      ]
    };

    const assistantResponses = responses[assistantId as keyof typeof responses] || responses.kairon;
    return assistantResponses[Math.floor(Math.random() * assistantResponses.length)];
  };

  const analysisSteps = [
    { icon: FileText, title: "Upload de Documentos", description: "Adicione seus arquivos" },
    { icon: Brain, title: "Processamento IA", description: "Análise com assistente escolhido" },
    { icon: Sparkles, title: "Extração de Insights", description: "Padrões identificados" },
    { icon: BarChart3, title: "Relatórios", description: "Análises detalhadas" }
  ];

  const activeAssistants = assistants.filter(a => a.isActive);
  const selectedAssistantData = assistants.find(a => a.id === selectedAssistant);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Análise de Documentos</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Faça upload de documentos, configure o assistente e veja estimativas de custo em tempo real
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">📁 Upload & Análise</TabsTrigger>
          <TabsTrigger value="chat">💬 Chat com Assistente</TabsTrigger>
          <TabsTrigger value="config">⚙️ Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Como Funciona */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-center text-blue-800">Como Funciona a Análise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {analysisSteps.map((step, index) => (
                  <div key={index} className="text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <step.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload de Documentos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload de Documentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Seleção de Assistente */}
                <div className="space-y-2">
                  <Label>Assistente para Análise:</Label>
                  <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activeAssistants.map((assistant) => (
                        <SelectItem key={assistant.id} value={assistant.id}>
                          {assistant.icon} {assistant.name} - {assistant.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Seleção de Modelo */}
                <div className="space-y-2">
                  <Label>Modelo de IA:</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini (Rápido e Econômico)</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o (Mais Poderoso)</SelectItem>
                      <SelectItem value="gpt-4.5-preview">GPT-4.5 Preview (Experimental)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Selecione um arquivo:</Label>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept=".txt,.pdf,.doc,.docx,.json,.csv,.md"
                  />
                  {selectedFile && (
                    <p className="text-sm text-green-600">
                      📁 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Ou cole seu texto aqui:</Label>
                  <Textarea
                    placeholder="Cole aqui o texto que deseja analisar..."
                    value={conversationText}
                    onChange={(e) => setConversationText(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processando...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                <Button 
                  onClick={handleUpload}
                  disabled={(!selectedFile && !conversationText.trim()) || isUploading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isUploading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analisar com {selectedAssistantData?.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Estimativa de Custo */}
            <CostEstimator
              estimatedTokens={estimatedTokens}
              maxTokens={maxTokens}
              model={selectedModel}
              fileName={selectedFile?.name}
            />
          </div>

          {/* Todos os Assistentes Disponíveis */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Assistentes Disponíveis para Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {activeAssistants.map((assistant) => (
                  <div
                    key={assistant.id}
                    onClick={() => setSelectedAssistant(assistant.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedAssistant === assistant.id
                        ? 'bg-blue-100 border-blue-300 shadow-lg'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-2xl">{assistant.icon}</div>
                      <h3 className="font-semibold text-sm">{assistant.name}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2">{assistant.description}</p>
                      {selectedAssistant === assistant.id && (
                        <Badge className="bg-blue-500 text-white">Selecionado</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          {/* Seleção de Assistente no Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Assistente Ativo: {selectedAssistantData?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {activeAssistants.map((assistant) => (
                  <Button
                    key={assistant.id}
                    variant={selectedAssistant === assistant.id ? "default" : "outline"}
                    onClick={() => setSelectedAssistant(assistant.id)}
                    className="flex items-center gap-2 h-auto p-3"
                  >
                    <span>{assistant.icon}</span>
                    <span className="text-xs">{assistant.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat com Assistente */}
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat com {selectedAssistantData?.name}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.type === 'user' ? 'bg-blue-500' : 'bg-gradient-to-r from-purple-500 to-blue-600'
                    }`}>
                      {msg.type === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white text-sm">{assistants.find(a => a.id === msg.assistantId)?.icon}</span>
                      )}
                    </div>
                    <div className={`rounded-lg p-3 shadow-sm ${
                      msg.type === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border'
                    }`}>
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
            </CardContent>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendChatMessage}
                  disabled={!chatMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          {/* Configurações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações de Análise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Máximo de Tokens: {maxTokens.toLocaleString()}</Label>
                  <Input
                    type="range"
                    min="1000"
                    max="128000"
                    step="1000"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1K</span>
                    <span>128K</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status da Análise */}
            <Card>
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-green-800">Sistema Online</h3>
                    <p className="text-sm text-green-600">Pronto para análise</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-blue-800">Assistentes Ativos</h3>
                    <p className="text-2xl font-bold text-blue-600">{activeAssistants.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tipos de Arquivo Suportados */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-gray-800">📁 Tipos de Arquivo Suportados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">Documentos de Texto:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• .txt (Texto simples)</li>
                    <li>• .md (Markdown)</li>
                    <li>• .doc/.docx (Word)</li>
                    <li>• .pdf (PDF)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">Dados Estruturados:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• .json (JSON)</li>
                    <li>• .csv (Planilha)</li>
                    <li>• .xml (XML)</li>
                    <li>• .yaml (YAML)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">Conversas:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Exports do WhatsApp</li>
                    <li>• Logs de chat</li>
                    <li>• E-mails (.eml)</li>
                    <li>• Transcrições</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
