
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  User,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lightbulb,
  Target,
  AlertTriangle
} from 'lucide-react';

interface AnalysisConversation {
  id: string;
  chat_id: string;
  contact_name: string;
  contact_phone: string;
  priority: 'high' | 'medium' | 'low';
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  marked_at: string;
  last_analyzed_at?: string;
  analysis_results: any[];
  marked_for_analysis: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface IndividualConversationAnalysisProps {
  conversation: AnalysisConversation;
  onAnalysisUpdate: () => void;
}

export function IndividualConversationAnalysis({ 
  conversation, 
  onAnalysisUpdate 
}: IndividualConversationAnalysisProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Carregar histórico de análises
  const loadAnalysisHistory = async () => {
    if (!user?.id) return;

    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('conversation_analysis_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('conversation_analysis_id', conversation.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalysisHistory(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadAnalysisHistory();
  }, [conversation.id, user?.id]);

  const runAnalysis = async (assistantId: string, customPromptText?: string) => {
    if (!user?.id) return;

    setIsAnalyzing(true);
    try {
      console.log('🧠 Iniciando análise individual para conversa:', conversation.id);

      // Simular análise (aqui você integraria com sua API de análise real)
      await new Promise(resolve => setTimeout(resolve, 3000));

      const analysisResult = {
        insights: [
          'Cliente demonstra interesse em soluções tecnológicas',
          'Perfil de comunicação direto e objetivo',
          'Potencial para upgrade de plano'
        ],
        sentiment: 'positive',
        priority_score: 8,
        recommended_actions: [
          'Enviar proposta personalizada',
          'Agendar call de demonstração'
        ]
      };

      // Salvar resultado da análise
      const { error } = await supabase
        .from('conversation_analysis_history')
        .insert({
          user_id: user.id,
          conversation_analysis_id: conversation.id,
          assistant_id: assistantId,
          assistant_name: `Assistente ${assistantId}`,
          analysis_results: [analysisResult],
          analysis_status: 'completed',
          messages_analyzed: 5,
          tokens_used: 150,
          cost_estimate: 0.02,
          processing_time_ms: 3000,
          analysis_prompt: customPromptText || 'Análise comportamental padrão'
        });

      if (error) throw error;

      // Atualizar status da conversa
      await supabase
        .from('whatsapp_conversations_analysis')
        .update({ 
          analysis_status: 'completed',
          last_analyzed_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      toast({
        title: "✅ Análise concluída!",
        description: "A análise da conversa foi realizada com sucesso"
      });

      loadAnalysisHistory();
      onAnalysisUpdate();

    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: "❌ Erro na análise",
        description: "Não foi possível completar a análise",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Análise Individual da Conversa
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(conversation.priority)}>
              {conversation.priority}
            </Badge>
            <div className="flex items-center gap-1">
              {getStatusIcon(conversation.analysis_status)}
              <span className="text-sm capitalize">{conversation.analysis_status}</span>
            </div>
          </div>
        </div>
        
        <CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{conversation.contact_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{conversation.contact_phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {new Date(conversation.marked_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Análise Rápida */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Análise Rápida
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button
              onClick={() => runAnalysis('behavioral')}
              disabled={isAnalyzing}
              variant="outline"
              size="sm"
            >
              Comportamental
            </Button>
            <Button
              onClick={() => runAnalysis('sales')}
              disabled={isAnalyzing}
              variant="outline"
              size="sm"
            >
              Vendas
            </Button>
            <Button
              onClick={() => runAnalysis('psychological')}
              disabled={isAnalyzing}
              variant="outline"
              size="sm"
            >
              Psicológica
            </Button>
          </div>
        </div>

        {/* Análise Customizada */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            Análise Customizada
          </h3>
          
          <Textarea
            placeholder="Digite um prompt personalizado para análise específica desta conversa..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={3}
          />
          
          <Button
            onClick={() => runAnalysis('custom', customPrompt)}
            disabled={isAnalyzing || !customPrompt.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Executar Análise Customizada
              </>
            )}
          </Button>
        </div>

        {/* Histórico de Análises */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-green-500" />
            Histórico de Análises ({Array.isArray(analysisHistory) ? analysisHistory.length : 0})
          </h3>
          
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Carregando histórico...</span>
            </div>
          ) : Array.isArray(analysisHistory) && analysisHistory.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {analysisHistory.map((analysis) => (
                <div
                  key={analysis.id}
                  className="p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{analysis.assistant_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(analysis.created_at).toLocaleString('pt-BR')}
                    </Badge>
                  </div>
                  
                  {Array.isArray(analysis.analysis_results) && analysis.analysis_results.length > 0 && (
                    <div className="space-y-1">
                      {analysis.analysis_results[0]?.insights?.map((insight: string, index: number) => (
                        <div key={index} className="text-xs text-gray-700 flex items-start gap-1">
                          <AlertTriangle className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                          {insight}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Tokens: {analysis.tokens_used || 0}</span>
                    <span>Custo: ${(analysis.cost_estimate || 0).toFixed(4)}</span>
                    <span>Tempo: {analysis.processing_time_ms || 0}ms</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma análise realizada ainda</p>
              <p className="text-xs mt-1">Execute uma análise acima para ver os resultados aqui</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
