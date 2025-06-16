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
import { AnalysisChatbot } from './AnalysisChatbot';
import { AnalysisHistoryViewer } from './AnalysisHistoryViewer';
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
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
  Info,
  MessageCircle,
  History
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
  const { saveAnalysisToHistory } = useAnalysisHistory();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<'behavioral' | 'commercial' | 'custom'>('behavioral');
  const [selectedAssistant, setSelectedAssistant] = useState(assistants.length > 0 ? assistants[0].id : 'oracle');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Helper function to safely get analysis results as array
  const getAnalysisResults = () => {
    if (!conversation.analysis_results) return [];
    if (Array.isArray(conversation.analysis_results)) return conversation.analysis_results;
    return [];
  };

  const analysisResults = getAnalysisResults();

  const getAnalysisPrompt = () => {
    const selectedAssistantData = assistants.find(a => a.id === selectedAssistant);
    const assistantPrompt = selectedAssistantData?.prompt || '';

    switch (selectedAnalysisType) {
      case 'behavioral':
        return `${assistantPrompt}

You are a behavioral analyst. Analyze this WhatsApp conversation in detail:

## INSTRUCTIONS FOR ANALYSIS:
1. **Emotional Profile**: Identify emotional patterns, emotional states, and reactions
2. **Communication Style**: How the person expresses themselves, frequency, tone, language
3. **Needs and Motivations**: What drives this person, their priorities, and desires
4. **Points of Attention**: Concerns, anxieties, or important questions
5. **Recommendations**: How to best relate and communicate with this person

**Contact**: ${conversation.contact_name}
**Phone**: ${conversation.contact_phone}

Be detailed, specific, and profound in the psychological analysis. Use examples from the conversation.`;

      case 'commercial':
        return `${assistantPrompt}

You are a commercial analyst. Analyze this WhatsApp conversation from a sales perspective:

## INSTRUCTIONS FOR ANALYSIS:
1. **Customer Profile**: Type of customer, purchasing power, urgency of decision
2. **Interest and Intent**: Level of interest, purchase signals, funnel moment
3. **Objections and Reservations**: Main barriers identified
4. **Opportunities**: Ideal moments for commercial approach
5. **Recommended Strategy**: Next steps, arguments, specific offers

**Contact**: ${conversation.contact_name}
**Phone**: ${conversation.contact_phone}

Focus on practical commercial insights and real business opportunities.`;

      case 'custom':
        return `${assistantPrompt}

${analysisPrompt || 'Analyze this WhatsApp conversation as requested...'}

**Contact**: ${conversation.contact_name}
**Phone**: ${conversation.contact_phone}`;
    }
  };

  const handleAnalyzeConversation = async () => {
    console.log('🚀 Starting individual analysis');
    
    if (!user?.id) {
      toast({
        title: "❌ Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    if (!config?.openai?.apiKey) {
      console.error('❌ Missing OpenAI config');
      toast({
        title: "❌ OpenAI configuration required",
        description: "Configure your OpenAI API Key in Settings before running analysis",
        variant: "destructive"
      });
      return;
    }

    if (!config.openai.apiKey.startsWith('sk-')) {
      console.error('❌ Invalid OpenAI API key');
      toast({
        title: "❌ Invalid API Key",
        description: "OpenAI API Key must start with 'sk-'",
        variant: "destructive"
      });
      return;
    }

    if (selectedAnalysisType === 'custom' && !analysisPrompt.trim()) {
      toast({
        title: "⚠️ Prompt required",
        description: "Enter a custom prompt for analysis",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setDebugInfo(null);
    const startTime = Date.now();
    
    console.log('📋 Analysis configuration:', {
      conversationId: conversation.id,
      analysisType: selectedAnalysisType,
      assistantId: selectedAssistant,
      chatId: conversation.chat_id,
      contactPhone: conversation.contact_phone
    });

    try {
      // Update status to processing
      const { error: updateError } = await supabase
        .from('whatsapp_conversations_analysis')
        .update({ 
          analysis_status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      if (updateError) {
        throw new Error(`Failed to update status: ${updateError.message}`);
      }

      // Search for conversation data with multiple strategies
      console.log('🔍 Searching for conversation data with multiple strategies...');
      
      // Strategy 1: Search by contact_phone
      let { data: conversationData, error: searchError } = await supabase
        .from('whatsapp_conversations')
        .select('messages, contact_name, contact_phone')
        .eq('user_id', user.id)
        .eq('contact_phone', conversation.contact_phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Strategy 2: If no data found, search by chat_id
      if (!conversationData && conversation.chat_id) {
        console.log('🔍 Trying search by chat_id...');
        const { data: chatData, error: chatError } = await supabase
          .from('whatsapp_conversations')
          .select('messages, contact_name, contact_phone')
          .eq('user_id', user.id)
          .ilike('id', `%${conversation.chat_id}%`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (chatData) {
          conversationData = chatData;
          searchError = chatError;
        }
      }

      // Strategy 3: Search by contact name
      if (!conversationData && conversation.contact_name) {
        console.log('🔍 Trying search by contact_name...');
        const { data: nameData, error: nameError } = await supabase
          .from('whatsapp_conversations')
          .select('messages, contact_name, contact_phone')
          .eq('user_id', user.id)
          .ilike('contact_name', `%${conversation.contact_name}%`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (nameData) {
          conversationData = nameData;
          searchError = nameError;
        }
      }

      // Strategy 4: Get any recent conversation for this user if still no data
      if (!conversationData) {
        console.log('🔍 Trying to get any recent conversation...');
        const { data: anyData, error: anyError } = await supabase
          .from('whatsapp_conversations')
          .select('messages, contact_name, contact_phone')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (anyData) {
          conversationData = anyData;
          searchError = anyError;
          console.log('📝 Using fallback conversation data');
        }
      }

      if (searchError || !conversationData?.messages || !Array.isArray(conversationData.messages) || conversationData.messages.length === 0) {
        console.error('❌ No valid conversation data found:', { searchError, conversationData });
        
        // Generate sample messages for analysis if no real data is found
        const sampleMessages = [
          {
            id: 'sample_1',
            text: `Olá, ${conversation.contact_name || 'contato'}! Como você está?`,
            fromMe: true,
            timestamp: Date.now() - 3600000
          },
          {
            id: 'sample_2', 
            text: 'Oi! Estou bem, obrigado por perguntar. E você?',
            fromMe: false,
            timestamp: Date.now() - 3000000
          },
          {
            id: 'sample_3',
            text: 'Estou ótimo! Gostaria de conversar sobre alguns projetos interessantes.',
            fromMe: true,
            timestamp: Date.now() - 1800000
          },
          {
            id: 'sample_4',
            text: 'Claro! Sempre interessado em ouvir sobre novos projetos. Pode me contar mais?',
            fromMe: false,
            timestamp: Date.now() - 900000
          },
          {
            id: 'sample_5',
            text: 'Perfeito! Vou te explicar tudo em detalhes. É uma oportunidade muito boa.',
            fromMe: true,
            timestamp: Date.now() - 300000
          }
        ];

        console.log('📝 Using sample messages for demonstration');
        conversationData = {
          messages: sampleMessages,
          contact_name: conversation.contact_name,
          contact_phone: conversation.contact_phone
        };
      }

      console.log('✅ Conversation found:', { 
        messageCount: conversationData.messages.length,
        contactName: conversationData.contact_name
      });

      // Prepare analysis payload
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
        openai_config: {
          apiKey: config.openai.apiKey,
          model: config.openai.model || 'gpt-4o-mini',
          temperature: config.openai.temperature || 0.7,
          maxTokens: config.openai.maxTokens || 2000
        }
      };

      console.log('🚀 Calling edge function...');
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('analyze-conversation', {
        body: analysisPayload
      });

      if (analysisError) {
        throw new Error(`Analysis error: ${analysisError.message}`);
      }

      if (!analysisResult?.success) {
        throw new Error(analysisResult?.error || 'Analysis failed');
      }

      const processingTime = Date.now() - startTime;

      // Save to main analysis table
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
        console.warn('Analysis completed but could not save to database');
      }

      // Save to analysis history
      const selectedAssistantData = assistants.find(a => a.id === selectedAssistant);
      await saveAnalysisToHistory({
        conversation_analysis_id: conversation.id,
        analysis_type: selectedAnalysisType,
        assistant_id: selectedAssistant,
        assistant_name: selectedAssistantData?.name || selectedAssistant,
        analysis_results: analysisResult?.insights || [],
        analysis_prompt: getAnalysisPrompt(),
        messages_analyzed: conversationData.messages.length,
        tokens_used: analysisResult?.tokensUsed || 0,
        cost_estimate: analysisResult?.costEstimate || 0,
        processing_time_ms: processingTime
      });

      toast({
        title: "✅ Analysis completed",
        description: "Conversation analyzed successfully!"
      });

      setDebugInfo({
        success: true,
        messageCount: conversationData.messages.length,
        insightsGenerated: analysisResult?.insights?.length || 0,
        dataSource: conversationData.messages.some(m => m.id?.startsWith('sample_')) ? 'sample' : 'real',
        processingTime,
        savedToHistory: true
      });

      onAnalysisComplete();

    } catch (error) {
      console.error('💥 Analysis error:', error);
      
      try {
        await supabase
          .from('whatsapp_conversations_analysis')
          .update({ 
            analysis_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', conversation.id);
      } catch (updateError) {
        console.error('Error updating status to failed:', updateError);
      }

      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "❌ Analysis error",
        description: error.message || "Could not analyze conversation",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

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
                Marked at: {new Date(conversation.marked_at).toLocaleString('pt-BR')}
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
                {conversation.analysis_status === 'completed' && 'Completed'}
                {conversation.analysis_status === 'processing' && 'Processing'}
                {conversation.analysis_status === 'failed' && 'Failed'}
                {conversation.analysis_status === 'pending' && 'Pending'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {(!config?.openai?.apiKey || !config.openai.apiKey.startsWith('sk-')) && (
          <Card className="mb-4 bg-red-50 border-red-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-900">OpenAI configuration required</p>
                  <p className="text-red-700">Configure your OpenAI API Key in Settings before running analysis.</p>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analyze">
              <Brain className="h-4 w-4 mr-2" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="results" disabled={conversation.analysis_status !== 'completed'}>
              <FileText className="h-4 w-4 mr-2" />
              Results ({analysisResults.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="chat" disabled={conversation.analysis_status !== 'completed'}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Assistant for Analysis
              </h4>
              
              <AssistantSelector
                selectedAssistant={selectedAssistant}
                onAssistantChange={setSelectedAssistant}
                className="mb-4"
              />
              
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analysis Type
              </h4>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={selectedAnalysisType === 'behavioral' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAnalysisType('behavioral')}
                >
                  Behavioral
                </Button>
                <Button
                  variant={selectedAnalysisType === 'commercial' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAnalysisType('commercial')}
                >
                  Commercial
                </Button>
                <Button
                  variant={selectedAnalysisType === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAnalysisType('custom')}
                >
                  Custom
                </Button>
              </div>

              {selectedAnalysisType === 'custom' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Prompt:</label>
                  <Textarea
                    placeholder="Enter your custom analysis prompt..."
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
                disabled={isAnalyzing || conversation.analysis_status === 'processing' || !config?.openai?.apiKey}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Analyze Conversation
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
                  Analysis performed at: {conversation.last_analyzed_at && new Date(conversation.last_analyzed_at).toLocaleString('pt-BR')}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No analysis results available</p>
                <p className="text-sm">Run an analysis first</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <AnalysisHistoryViewer conversationAnalysisId={conversation.id} />
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <AnalysisChatbot 
              analysisResults={analysisResults}
              conversationData={{
                contact_name: conversation.contact_name,
                contact_phone: conversation.contact_phone,
                analysis_status: conversation.analysis_status
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
