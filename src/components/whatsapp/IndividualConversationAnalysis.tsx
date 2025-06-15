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
    console.log('🚀 Starting individual analysis - FIXED VERSION');
    
    if (!user?.id) {
      toast({
        title: "❌ Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    // Strict OpenAI config validation
    if (!config?.openai?.apiKey) {
      console.error('❌ Missing OpenAI config');
      toast({
        title: "❌ OpenAI configuration required",
        description: "Configure your OpenAI API Key in Settings > OpenAI before running analysis",
        variant: "destructive"
      });
      return;
    }

    if (!config.openai.apiKey.startsWith('sk-')) {
      console.error('❌ Invalid OpenAI API key');
      toast({
        title: "❌ Invalid API Key",
        description: "OpenAI API Key must start with 'sk-'. Check your configuration.",
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
    
    console.log('📋 Analysis configuration:', {
      conversationId: conversation.id,
      chatId: conversation.chat_id,
      contactName: conversation.contact_name,
      contactPhone: conversation.contact_phone,
      analysisType: selectedAnalysisType,
      assistantId: selectedAssistant,
      hasOpenAIKey: !!config.openai?.apiKey,
      openAIModel: config.openai.model
    });

    try {
      // 1. Update status to processing
      console.log('🔄 Updating status to processing...');
      const { error: updateError } = await supabase
        .from('whatsapp_conversations_analysis')
        .update({ 
          analysis_status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      if (updateError) {
        console.error('❌ Error updating status:', updateError);
        throw new Error(`Failed to update status: ${updateError.message}`);
      }

      // 2. Search conversation with multiple strategies
      console.log('🔍 Searching conversation in database...');
      
      let conversationData = null;
      let searchStrategy = '';

      // Strategy 1: Search by phone
      console.log('🔍 Attempt 1: Search by phone...');
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
        searchStrategy = 'by phone';
        console.log('✅ Conversation found by phone:', { messageCount: phoneData.messages.length });
      }

      // Strategy 2: Search by name if not found by phone
      if (!conversationData) {
        console.log('🔍 Attempt 2: Search by name...');
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
          searchStrategy = 'by name';
          console.log('✅ Conversation found by name:', { messageCount: nameData.messages.length });
        }
      }

      if (!conversationData?.messages || !Array.isArray(conversationData.messages) || conversationData.messages.length === 0) {
        console.error('❌ No conversation found');
        
        setDebugInfo({
          error: 'Conversation not found',
          searchAttempts: [
            `phone: ${conversation.contact_phone}`,
            `name: ${conversation.contact_name}`
          ],
          conversation: conversation
        });
        
        throw new Error('No messages found for analysis. Verify that the conversation was synced from WhatsApp.');
      }

      console.log('✅ Conversation found', { 
        strategy: searchStrategy,
        messageCount: conversationData.messages.length,
        contactName: conversationData.contact_name,
        contactPhone: conversationData.contact_phone
      });

      // 3. Prepare complete payload for analysis
      console.log('🤖 Preparing AI analysis...');
      
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

      console.log('📦 Final payload prepared:', {
        conversation_id: analysisPayload.conversation_id,
        messages_count: analysisPayload.messages.length,
        analysis_type: analysisPayload.analysis_type,
        assistant_id: analysisPayload.assistant_id,
        prompt_length: analysisPayload.analysis_prompt.length,
        contact_info: analysisPayload.contact_info,
        openai_model: analysisPayload.openai_config.model,
        has_openai_key: !!analysisPayload.openai_config.apiKey
      });

      // 4. Call edge function
      console.log('🚀 Calling edge function...');
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('analyze-conversation', {
        body: analysisPayload
      });

      console.log('📊 Edge function result:', { 
        success: analysisResult?.success,
        error: analysisError,
        hasInsights: !!analysisResult?.insights,
        insightCount: analysisResult?.insights?.length || 0
      });

      if (analysisError) {
        console.error('❌ Edge function error:', analysisError);
        throw new Error(`Analysis error: ${analysisError.message || 'Error communicating with server'}`);
      }

      if (!analysisResult) {
        console.error('❌ Empty response from edge function');
        throw new Error('Server returned empty response');
      }

      if (!analysisResult.success) {
        console.error('❌ Analysis failed:', analysisResult);
        throw new Error(analysisResult.error || 'Analysis failed without specific error message');
      }

      // 5. Save analysis result
      console.log('💾 Saving analysis result...');
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
        console.error('❌ Error saving result:', finalUpdateError);
        console.warn('Analysis was performed but could not be saved to database');
      }

      console.log('🎉 Analysis completed successfully!');

      toast({
        title: "✅ Analysis completed",
        description: `Conversation analyzed successfully! ${conversationData.messages.length} messages processed.`
      });

      setDebugInfo({
        success: true,
        searchStrategy,
        messageCount: conversationData.messages.length,
        contactInfo: {
          name: conversationData.contact_name,
          phone: conversationData.contact_phone
        },
        analysisCompleted: true,
        insightsGenerated: analysisResult?.insights?.length || 0
      });

      onAnalysisComplete();

    } catch (error) {
      console.error('💥 ERROR in analysis:', error);
      
      // Mark as failed
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
        timestamp: new Date().toISOString(),
        conversation: conversation
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
        {/* OpenAI configuration check */}
        {(!config?.openai?.apiKey || !config.openai.apiKey.startsWith('sk-')) && (
          <Card className="mb-4 bg-red-50 border-red-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-900">OpenAI configuration required</p>
                  <p className="text-red-700">Configure your OpenAI API Key in Settings > OpenAI before running analysis.</p>
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
              Analyze
            </TabsTrigger>
            <TabsTrigger value="results" disabled={conversation.analysis_status !== 'completed'}>
              <FileText className="h-4 w-4 mr-2" />
              Results ({analysisResults.length})
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
        </Tabs>
      </CardContent>
    </Card>
  );
}
