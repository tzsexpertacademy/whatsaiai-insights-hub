
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageLayout } from '@/components/layout/PageLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { useAnalysisConversations } from '@/hooks/useAnalysisConversations';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  MessageSquare, 
  ArrowLeft, 
  Send, 
  Bot,
  User,
  Clock,
  BarChart3,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface IndividualAnalysis {
  conversationSummary: string;
  keyInsights: string[];
  emotionalTone: string;
  communicationStyle: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export function IndividualConversationAnalysis() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { conversations } = useAnalysisConversations();
  
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [individualAnalysis, setIndividualAnalysis] = useState<IndividualAnalysis | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Encontrar a conversa selecionada
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        performIndividualAnalysis(conversation);
      } else {
        toast({
          title: "Conversa não encontrada",
          description: "A conversa selecionada não foi encontrada",
          variant: "destructive"
        });
        navigate('/dashboard/conversation-analysis');
      }
    }
  }, [conversationId, conversations, navigate, toast]);

  const performIndividualAnalysis = async (conversation: any) => {
    setIsAnalyzing(true);
    console.log('🔍 Realizando análise individual da conversa:', conversation.contact_name);

    try {
      // Simular análise individual por enquanto
      // TODO: Integrar com OpenAI para análise real
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockAnalysis: IndividualAnalysis = {
        conversationSummary: `Análise da conversa com ${conversation.contact_name}. Esta conversa apresenta características específicas que requerem atenção individualizada.`,
        keyInsights: [
          'Cliente demonstra interesse em produtos premium',
          'Comunicação direta e objetiva',
          'Responde rapidamente às mensagens',
          'Faz perguntas técnicas detalhadas'
        ],
        emotionalTone: 'Neutro a Positivo',
        communicationStyle: 'Direto e Profissional',
        recommendations: [
          'Oferecer demonstração técnica do produto',
          'Enviar material técnico detalhado',
          'Agendar reunião para apresentação',
          'Manter comunicação objetiva'
        ],
        riskLevel: conversation.priority === 'high' ? 'low' : 
                  conversation.priority === 'medium' ? 'medium' : 'high'
      };

      setIndividualAnalysis(mockAnalysis);
      
      // Adicionar mensagem inicial do bot
      setChatMessages([{
        id: '1',
        content: `Olá! Acabei de analisar a conversa com ${conversation.contact_name}. Posso responder qualquer pergunta sobre essa análise específica. O que você gostaria de saber?`,
        isBot: true,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('❌ Erro na análise individual:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível realizar a análise individual",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      isBot: false,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsChatLoading(true);

    try {
      // Simular resposta do bot
      // TODO: Integrar com OpenAI para respostas contextuais
      await new Promise(resolve => setTimeout(resolve, 1500));

      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Baseado na análise da conversa com ${selectedConversation.contact_name}, posso dizer que... [Esta seria uma resposta contextual do assistente sobre a análise específica desta conversa]`,
        isBot: true,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error('❌ Erro no chat:', error);
      toast({
        title: "Erro no chat",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!selectedConversation) {
    return (
      <PageLayout
        title="Carregando..."
        description="Carregando análise da conversa"
        showBackButton={true}
        backUrl="/dashboard/conversation-analysis"
      >
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </PageLayout>
    );
  }

  const headerActions = (
    <div className="flex items-center gap-3">
      <Badge variant="outline" className="bg-blue-50">
        <Brain className="h-3 w-3 mr-1" />
        Análise Individual
      </Badge>
      <Button 
        onClick={() => navigate('/dashboard/conversation-analysis')}
        variant="outline"
        size="sm"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar
      </Button>
    </div>
  );

  return (
    <PageLayout
      title={`Análise: ${selectedConversation.contact_name}`}
      description="Análise individual da conversa com chatbot especializado"
      showBackButton={true}
      backUrl="/dashboard/conversation-analysis"
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Painel de Análise */}
        <div className="space-y-6 overflow-y-auto">
          {/* Informações da Conversa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações da Conversa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Contato</p>
                  <p className="font-medium">{selectedConversation.contact_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium">{selectedConversation.contact_phone}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Prioridade</p>
                    <Badge 
                      variant="outline" 
                      className={`capitalize ${
                        selectedConversation.priority === 'high' ? 'border-red-200 text-red-700 bg-red-50' :
                        selectedConversation.priority === 'medium' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                        'border-blue-200 text-blue-700 bg-blue-50'
                      }`}
                    >
                      {selectedConversation.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant="outline">
                      {selectedConversation.analysis_status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Marcada em</p>
                  <p className="text-sm">{new Date(selectedConversation.marked_at).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análise Individual */}
          {isAnalyzing ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-500" />
                  <p>Realizando análise individual...</p>
                </div>
              </CardContent>
            </Card>
          ) : individualAnalysis && (
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Resumo</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="recommendations">Ações</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Resumo da Análise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-700">{individualAnalysis.conversationSummary}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tom Emocional</p>
                        <p className="text-sm">{individualAnalysis.emotionalTone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Estilo de Comunicação</p>
                        <p className="text-sm">{individualAnalysis.communicationStyle}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Nível de Risco</p>
                      <Badge className={getRiskColor(individualAnalysis.riskLevel)}>
                        {individualAnalysis.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Insights Principais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {individualAnalysis.keyInsights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Recomendações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {individualAnalysis.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Painel do Chatbot */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Chat com Assistente IA
            </CardTitle>
            <p className="text-sm text-gray-500">
              Converse sobre a análise específica desta conversa
            </p>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Área de Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.isBot
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.isBot ? (
                          <Bot className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        <span className="text-xs opacity-75">
                          {message.timestamp.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Bot className="h-3 w-3" />
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span className="text-sm text-gray-600">Assistente está pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input de Mensagem */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Pergunte sobre a análise desta conversa..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  disabled={isChatLoading}
                />
                <Button 
                  onClick={sendChatMessage}
                  disabled={!newMessage.trim() || isChatLoading}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
