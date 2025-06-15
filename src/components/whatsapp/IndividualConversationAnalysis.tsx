
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useClientConfig } from '@/contexts/ClientConfigContext';
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
  AlertCircle,
  Info
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
  const { config } = useClientConfig();
  const { toast } = useToast();
  const { assistants } = useAssistantsConfig();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<'behavioral' | 'commercial' | 'custom'>('behavioral');
  const [selectedAssistant, setSelectedAssistant] = useState(assistants.length > 0 ? assistants[0].id : 'oracle');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const getAnalysisPrompt = () => {
    const selectedAssistantData = assistants.find(a => a.id === selectedAssistant);
    const assistantPrompt = selectedAssistantData?.prompt || '';

    switch (selectedAnalysisType) {
      case 'behavioral':
        return `${assistantPrompt}

Você é um analista comportamental especializado. Analise esta conversa do WhatsApp de forma detalhada:

## INSTRUÇÕES DE ANÁLISE:
1. **Perfil Emocional**: Identifique padrões emocionais, estados de humor e reações
2. **Estilo de Comunicação**: Como a pessoa se expressa, frequência, tom, linguagem
3. **Necessidades e Motivações**: O que move esta pessoa, suas prioridades e desejos
4. **Pontos de Atenção**: Preocupações, ansiedades ou questões importantes
5. **Recomendações**: Como melhor se relacionar e comunicar com esta pessoa

**Contato**: ${conversation.contact_name}
**Telefone**: ${conversation.contact_phone}

Seja detalhado, específico e profundo na análise psicológica. Use exemplos da conversa.`;

      case 'commercial':
        return `${assistantPrompt}

Você é um analista comercial especializado. Analise esta conversa do WhatsApp do ponto de vista de vendas:

## INSTRUÇÕES DE ANÁLISE:
1. **Perfil de Cliente**: Tipo de cliente, poder de compra, urgência de decisão
2. **Interesse e Intenção**: Nível de interesse, sinais de compra, momento do funil
3. **Objeções e Resistências**: Principais barreiras identificadas
4. **Oportunidades**: Momentos ideais para abordagem comercial
5. **Estratégia Recomendada**: Próximos passos, argumentos, ofertas específicas

**Contato**: ${conversation.contact_name}
**Telefone**: ${conversation.contact_phone}

Foque em insights comerciais práticos e oportunidades de negócio reais.`;

      case 'custom':
        return `${assistantPrompt}

${analysisPrompt || 'Analise esta conversa do WhatsApp conforme solicitado...'}

**Contato**: ${conversation.contact_name}
**Telefone**: ${conversation.contact_phone}`;
    }
  };

  const handleAnalyzeConversation = async () => {
    if (!user?.id) {
      toast({
        title: "❌ Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    // ✅ VERIFICAR CONFIGURAÇÃO OPENAI ANTES DE PROSSEGUIR
    if (!config.openai?.apiKey || !config.openai.apiKey.startsWith('sk-')) {
      toast({
        title: "❌ Configuração OpenAI necessária",
        description: "Configure sua API Key da OpenAI em Configurações > OpenAI antes de executar análises",
        variant: "destructive"
      });
      return;
    }

    if (selectedAnalysisType === 'custom' && !analysisPrompt.trim()) {
      toast({
        title: "⚠️ Prompt necessário",
        description: "Digite um prompt personalizado para análise",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setDebugInfo(null);
    
    console.log('🚀 INICIANDO ANÁLISE INDIVIDUAL COM OPENAI CONFIG:', {
      conversationId: conversation.id,
      chatId: conversation.chat_id,
      contactName: conversation.contact_name,
      contactPhone: conversation.contact_phone,
      analysisType: selectedAnalysisType,
      assistantId: selectedAssistant,
      hasOpenAIKey: !!config.openai?.apiKey,
      openAIKeyPrefix: config.openai?.apiKey?.substring(0, 10) + '...'
    });

    try {
      // 1. Atualizar status para 'processing'
      console.log('🔄 Atualizando status para processing...');
      const { error: updateError } = await supabase
        .from('whatsapp_conversations_analysis')
        .update({ 
          analysis_status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar status:', updateError);
        throw new Error(`Erro ao atualizar status: ${updateError.message}`);
      }

      // 2. Buscar conversa no banco
      console.log('🔍 Buscando conversa no banco...');
      
      let conversationData = null;
      let searchStrategy = '';

      // Buscar por telefone
      const { data: phoneData, error: phoneError } = await supabase
        .from('whatsapp_conversations')
        .select('messages, contact_name, contact_phone, session_id')
        .eq('user_id', user.id)
        .eq('contact_phone', conversation.contact_phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!phoneError && phoneData?.messages && Array.isArray(phoneData.messages) && phoneData.messages.length > 0) {
        conversationData = phoneData;
        searchStrategy = 'por telefone';
        console.log('✅ Conversa encontrada por telefone:', { messageCount: phoneData.messages.length });
      }

      // Buscar por nome se não encontrou por telefone
      if (!conversationData) {
        const { data: nameData, error: nameError } = await supabase
          .from('whatsapp_conversations')
          .select('messages, contact_name, contact_phone, session_id')
          .eq('user_id', user.id)
          .eq('contact_name', conversation.contact_name)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!nameError && nameData?.messages && Array.isArray(nameData.messages) && nameData.messages.length > 0) {
          conversationData = nameData;
          searchStrategy = 'por nome';
          console.log('✅ Conversa encontrada por nome:', { messageCount: nameData.messages.length });
        }
      }

      if (!conversationData?.messages || !Array.isArray(conversationData.messages) || conversationData.messages.length === 0) {
        console.error('❌ Nenhuma conversa encontrada');
        setDebugInfo({
          error: 'Conversa não encontrada',
          searchAttempts: ['telefone', 'nome'],
          conversation: conversation
        });
        
        throw new Error('Nenhuma mensagem encontrada para análise. Verifique se a conversa foi sincronizada do WhatsApp.');
      }

      console.log('✅ Conversa encontrada', { 
        strategy: searchStrategy,
        messageCount: conversationData.messages.length,
        contactName: conversationData.contact_name,
        contactPhone: conversationData.contact_phone
      });

      setDebugInfo({
        success: true,
        searchStrategy,
        messageCount: conversationData.messages.length,
        contactInfo: {
          name: conversationData.contact_name,
          phone: conversationData.contact_phone
        },
        openAIConfigSent: true
      });

      // 3. Chamar edge function para análise COM CONFIGURAÇÃO OPENAI
      console.log('🤖 Enviando para análise IA COM CONFIGURAÇÃO OPENAI...');
      
      // ✅ PREPARAR PAYLOAD COMPLETO COM OPENAI CONFIG
      const analysisPayload = {
        conversation_id: conversation.id,
        messages: conversationData.messages,
        analysis_prompt: getAnalysisPrompt(),
        analysis_type: selectedAnalysisType,
        assistant_id: selectedAssistant,
        contact_info: {
          name: conversation.contact_name,
          phone: conversation.contact_phone
        },
        // ✅ INCLUIR CONFIGURAÇÃO OPENAI NO PAYLOAD
        openai_config: {
          apiKey: config.openai.apiKey,
          model: config.openai.model || 'gpt-4o-mini',
          temperature: config.openai.temperature || 0.7,
          maxTokens: config.openai.maxTokens || 2000
        }
      };

      console.log('📦 Payload final da análise COM OPENAI:', {
        conversation_id: analysisPayload.conversation_id,
        messages_count: analysisPayload.messages.length,
        analysis_type: analysisPayload.analysis_type,
        assistant_id: analysisPayload.assistant_id,
        prompt_length: analysisPayload.analysis_prompt.length,
        contact_info: analysisPayload.contact_info,
        openai_model: analysisPayload.openai_config.model,
        has_openai_key: !!analysisPayload.openai_config.apiKey
      });

      // Chamar a edge function
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('analyze-conversation', {
        body: analysisPayload
      });

      console.log('📊 Resultado da análise:', { 
        success: analysisResult?.success,
        error: analysisError,
        insights: analysisResult?.insights?.length || 0
      });

      if (analysisError) {
        console.error('❌ Erro na análise IA:', analysisError);
        throw new Error(`Erro na análise: ${analysisError.message || 'Erro desconhecido'}`);
      }

      if (!analysisResult?.success) {
        console.error('❌ Análise falhou:', analysisResult);
        throw new Error(analysisResult?.error || 'Análise falhou sem retorno de erro específico');
      }

      // 4. Salvar resultado da análise
      console.log('💾 Salvando resultado da análise...');
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
        throw new Error(`Erro ao salvar resultado: ${finalUpdateError.message}`);
      }

      console.log('🎉 Análise concluída com sucesso!');

      toast({
        title: "✅ Análise concluída",
        description: `Conversa analisada com sucesso! ${conversationData.messages.length} mensagens processadas.`
      });

      onAnalysisComplete();

    } catch (error) {
      console.error('💥 ERRO na análise:', error);
      
      // Marcar como falhou
      await supabase
        .from('whatsapp_conversations_analysis')
        .update({ 
          analysis_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString(),
        conversation: conversation
      });

      toast({
        title: "❌ Erro na análise",
        description: error.message || "Não foi possível analisar a conversa",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

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
              <p className="text-xs text-gray-400">
                Marcada em: {new Date(conversation.marked_at).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={
              conversation.priority === 'high' ? 'border-red-200 text-red-700 bg-red-50' :
              conversation.priority === 'medium' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
              'border-blue-200 text-blue-700 bg-blue-50'
            }>
              {conversation.priority}
            </Badge>
            
            <div className="flex items-center gap-1">
              {conversation.analysis_status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
              {conversation.analysis_status === 'processing' && <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />}
              {conversation.analysis_status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
              {conversation.analysis_status === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
              <Badge variant="outline">
                {conversation.analysis_status === 'completed' && 'Concluída'}
                {conversation.analysis_status === 'processing' && 'Processando'}
                {conversation.analysis_status === 'failed' && 'Falhou'}
                {conversation.analysis_status === 'pending' && 'Pendente'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Verificação de configuração OpenAI */}
        {(!config.openai?.apiKey || !config.openai.apiKey.startsWith('sk-')) && (
          <Card className="mb-4 bg-red-50 border-red-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-900">Configuração OpenAI necessária</p>
                  <p className="text-red-700">Configure sua API Key da OpenAI em Configurações > OpenAI antes de executar análises.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {debugInfo && (
          <Card className="mb-4 bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Debug Info:</p>
                  <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto max-h-32">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analyze">
              <Brain className="h-4 w-4 mr-2" />
              Analisar
            </TabsTrigger>
            <TabsTrigger value="results" disabled={conversation.analysis_status !== 'completed'}>
              <FileText className="h-4 w-4 mr-2" />
              Resultados ({analysisResults.length})
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
                <TrendingUp className="h-4 w-4" />
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
                disabled={isAnalyzing || conversation.analysis_status === 'processing' || !config.openai?.apiKey}
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
                        <Brain className="h-4 w-4 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <h5 className="font-medium text-blue-900">{result.title}</h5>
                          <p className="text-sm text-blue-700 mt-1">{result.description}</p>
                          {result.content && (
                            <div className="mt-2 p-3 bg-white rounded border text-sm max-h-64 overflow-y-auto">
                              <pre className="whitespace-pre-wrap">{result.content}</pre>
                            </div>
                          )}
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
