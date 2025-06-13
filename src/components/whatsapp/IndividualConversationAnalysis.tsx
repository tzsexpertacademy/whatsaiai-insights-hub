
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AssistantSelector } from '@/components/AssistantSelector';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';
import { 
  Brain, 
  MessageSquare, 
  Send, 
  Sparkles, 
  FileText, 
  TrendingUp,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface ConversationAnalysisProps {
  conversation: {
    id: string;
    chat_id: string;
    contact_name: string;
    contact_phone: string;
    analysis_status: string;
    priority: string;
    marked_at: string;
    last_analyzed_at?: string;
    analysis_results?: any[];
  };
  onAnalysisComplete: () => void;
}

export function IndividualConversationAnalysis({ conversation, onAnalysisComplete }: ConversationAnalysisProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { assistants } = useAssistantsConfig();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<'behavioral' | 'commercial' | 'custom'>('behavioral');
  const [selectedAssistant, setSelectedAssistant] = useState(assistants.length > 0 ? assistants[0].id : 'kairon');

  const getStatusIcon = () => {
    switch (conversation.analysis_status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (conversation.analysis_status) {
      case 'completed': return 'Análise Concluída';
      case 'processing': return 'Analisando...';
      case 'failed': return 'Análise Falhou';
      default: return 'Aguardando Análise';
    }
  };

  const getPriorityColor = () => {
    switch (conversation.priority) {
      case 'high': return 'border-red-200 text-red-700 bg-red-50';
      case 'medium': return 'border-yellow-200 text-yellow-700 bg-yellow-50';
      default: return 'border-blue-200 text-blue-700 bg-blue-50';
    }
  };

  const getAnalysisPrompt = () => {
    const selectedAssistantData = assistants.find(a => a.id === selectedAssistant);
    const assistantPrompt = selectedAssistantData?.prompt || '';

    switch (selectedAnalysisType) {
      case 'behavioral':
        return `${assistantPrompt}

Analise esta conversa do WhatsApp de forma comportamental e psicológica:

1. **Perfil Emocional**: Identifique padrões emocionais, estados de humor e reações
2. **Estilo de Comunicação**: Como a pessoa se expressa, frequência, tom
3. **Necessidades e Motivações**: O que move esta pessoa, suas prioridades
4. **Pontos de Atenção**: Possíveis preocupações, ansiedades ou questões relevantes
5. **Recomendações**: Como melhor se relacionar e comunicar com esta pessoa

Contato: ${conversation.contact_name}
Telefone: ${conversation.contact_phone}

Seja detalhado e profundo na análise psicológica.`;

      case 'commercial':
        return `${assistantPrompt}

Analise esta conversa do WhatsApp do ponto de vista comercial e de vendas:

1. **Perfil de Cliente**: Tipo de cliente, poder de compra, urgência
2. **Interesse e Intenção**: Nível de interesse, sinais de compra
3. **Objeções e Resistências**: Principais barreiras identificadas
4. **Oportunidades**: Momentos e abordagens ideais para venda
5. **Estratégia Recomendada**: Próximos passos, argumentos, ofertas

Contato: ${conversation.contact_name}
Telefone: ${conversation.contact_phone}

Foque em insights comerciais e oportunidades de negócio.`;

      case 'custom':
        return `${assistantPrompt}

${analysisPrompt || 'Analise esta conversa do WhatsApp conforme solicitado...'}

Contato: ${conversation.contact_name}
Telefone: ${conversation.contact_phone}`;
    }
  };

  const handleAnalyzeConversation = async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    if (selectedAnalysisType === 'custom' && !analysisPrompt.trim()) {
      toast({
        title: "Prompt necessário",
        description: "Digite um prompt personalizado para análise",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    console.log('🧠 Iniciando análise individual da conversa:', conversation.chat_id);

    try {
      const { error: updateError } = await supabase
        .from('whatsapp_conversations_analysis')
        .update({ 
          analysis_status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar status:', updateError);
        throw updateError;
      }

      // Buscar conversa no banco usando múltiplas estratégias
      console.log('🔍 Buscando conversa no banco para:', { 
        userId: user.id, 
        contactPhone: conversation.contact_phone,
        contactName: conversation.contact_name,
        chatId: conversation.chat_id
      });

      // Primeiro tentar buscar por chat_id exato
      let { data: conversationData, error: conversationError } = await supabase
        .from('whatsapp_conversations')
        .select('messages')
        .eq('user_id', user.id)
        .or(`contact_phone.eq.${conversation.contact_phone},session_id.eq.${conversation.chat_id}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Se não encontrou, tentar buscar apenas por telefone
      if (conversationError || !conversationData?.messages || (Array.isArray(conversationData.messages) && conversationData.messages.length === 0)) {
        console.log('⚠️ Primeira busca falhou, tentando busca alternativa...');
        
        const { data: alternativeData, error: alternativeError } = await supabase
          .from('whatsapp_conversations')
          .select('messages')
          .eq('user_id', user.id)
          .eq('contact_phone', conversation.contact_phone)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (alternativeError) {
          console.error('❌ Erro na busca alternativa:', alternativeError);
        } else if (alternativeData?.messages && Array.isArray(alternativeData.messages) && alternativeData.messages.length > 0) {
          conversationData = alternativeData;
          conversationError = null;
          console.log('✅ Conversa encontrada na busca alternativa');
        }
      }

      // Se ainda não encontrou, tentar busca por nome
      if (conversationError || !conversationData?.messages || (Array.isArray(conversationData.messages) && conversationData.messages.length === 0)) {
        console.log('⚠️ Tentando busca por nome do contato...');
        
        const { data: nameData, error: nameError } = await supabase
          .from('whatsapp_conversations')
          .select('messages')
          .eq('user_id', user.id)
          .eq('contact_name', conversation.contact_name)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!nameError && nameData?.messages && Array.isArray(nameData.messages) && nameData.messages.length > 0) {
          conversationData = nameData;
          conversationError = null;
          console.log('✅ Conversa encontrada por nome');
        }
      }

      if (conversationError || !conversationData?.messages || (Array.isArray(conversationData.messages) && conversationData.messages.length === 0)) {
        console.error('❌ Nenhuma conversa encontrada:', { conversationError, conversationData });
        throw new Error('Nenhuma mensagem encontrada para análise. Verifique se a conversa foi sincronizada corretamente.');
      }

      console.log('✅ Conversa encontrada:', { messageCount: Array.isArray(conversationData.messages) ? conversationData.messages.length : 'Not an array' });

      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('analyze-conversation', {
        body: {
          conversation_id: conversation.id,
          messages: conversationData.messages,
          analysis_prompt: getAnalysisPrompt(),
          analysis_type: selectedAnalysisType,
          assistant_id: selectedAssistant,
          contact_info: {
            name: conversation.contact_name,
            phone: conversation.contact_phone
          }
        }
      });

      if (analysisError) {
        console.error('❌ Erro na análise IA:', analysisError);
        throw analysisError;
      }

      const { error: finalUpdateError } = await supabase
        .from('whatsapp_conversations_analysis')
        .update({ 
          analysis_status: 'completed',
          analysis_results: analysisResult?.insights || [],
          last_analyzed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      if (finalUpdateError) {
        console.error('❌ Erro ao salvar resultado:', finalUpdateError);
        throw finalUpdateError;
      }

      toast({
        title: "✅ Análise concluída",
        description: `A conversa foi analisada com sucesso pelo assistente ${assistants.find(a => a.id === selectedAssistant)?.name || selectedAssistant}`
      });

      onAnalysisComplete();

    } catch (error) {
      console.error('❌ Erro na análise:', error);
      
      await supabase
        .from('whatsapp_conversations_analysis')
        .update({ 
          analysis_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      toast({
        title: "❌ Erro na análise",
        description: error.message || "Não foi possível analisar a conversa",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Garantir que analysis_results é um array
  const analysisResults = Array.isArray(conversation.analysis_results) ? conversation.analysis_results : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <div>
              <CardTitle className="text-lg">{conversation.contact_name}</CardTitle>
              <p className="text-sm text-gray-500">{conversation.contact_phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getPriorityColor()}>
              {conversation.priority}
            </Badge>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <Badge variant="outline">
                {getStatusText()}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analyze">
              <Brain className="h-4 w-4 mr-2" />
              Analisar
            </TabsTrigger>
            <TabsTrigger value="results" disabled={conversation.analysis_status !== 'completed'}>
              <FileText className="h-4 w-4 mr-2" />
              Resultados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Assistente para Análise
              </h4>
              
              <AssistantSelector
                selectedAssistant={selectedAssistant}
                onAssistantChange={setSelectedAssistant}
                className="mb-4"
              />
              
              <h4 className="font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Tipo de Análise
              </h4>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={selectedAnalysisType === 'behavioral' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAnalysisType('behavioral')}
                >
                  Comportamental
                </Button>
                <Button
                  variant={selectedAnalysisType === 'commercial' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAnalysisType('commercial')}
                >
                  Comercial
                </Button>
                <Button
                  variant={selectedAnalysisType === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAnalysisType('custom')}
                >
                  Personalizada
                </Button>
              </div>

              {selectedAnalysisType === 'custom' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prompt Personalizado:</label>
                  <Textarea
                    placeholder="Digite seu prompt personalizado para análise..."
                    value={analysisPrompt}
                    onChange={(e) => setAnalysisPrompt(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={handleAnalyzeConversation}
                disabled={isAnalyzing || conversation.analysis_status === 'processing'}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Analisar Conversa
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {analysisResults.length > 0 ? (
              <div className="space-y-3">
                {analysisResults.map((result, index) => (
                  <Card key={index} className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <h5 className="font-medium text-blue-900">{result.title}</h5>
                          <p className="text-sm text-blue-700 mt-1">{result.description}</p>
                          {result.priority && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {result.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="text-xs text-gray-500 text-center pt-2">
                  Análise realizada em: {conversation.last_analyzed_at && new Date(conversation.last_analyzed_at).toLocaleString('pt-BR')}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum resultado de análise disponível</p>
                <p className="text-sm">Execute uma análise primeiro</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
