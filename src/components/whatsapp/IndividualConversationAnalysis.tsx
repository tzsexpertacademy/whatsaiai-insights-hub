
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Bot, Clock, Sparkles, Download, RefreshCw } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type ConversationRecord = Database['public']['Tables']['whatsapp_conversations_analysis']['Row'];

interface IndividualConversationAnalysisProps {
  conversation: ConversationRecord;
  onAnalysisUpdate?: (conversationId: string, results: any) => void;
  onAnalysisComplete?: () => void;
}

export function IndividualConversationAnalysis({ 
  conversation, 
  onAnalysisUpdate,
  onAnalysisComplete 
}: IndividualConversationAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const { toast } = useToast();

  // Helper function to safely get analysis results
  const getAnalysisResults = () => {
    if (!conversation.analysis_results) return null;
    
    try {
      if (typeof conversation.analysis_results === 'string') {
        return JSON.parse(conversation.analysis_results);
      }
      return conversation.analysis_results;
    } catch {
      return null;
    }
  };

  const analysisResults = getAnalysisResults();

  const handleReAnalysis = async () => {
    if (!conversation.id) return;
    
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: {
          conversationId: conversation.id,
          customPrompt: customPrompt || undefined
        }
      });

      if (error) throw error;

      toast({
        title: "Análise atualizada! 🎯",
        description: "A conversa foi re-analisada com sucesso"
      });

      if (onAnalysisUpdate) {
        onAnalysisUpdate(conversation.id, data);
      }

      if (onAnalysisComplete) {
        onAnalysisComplete();
      }

    } catch (error) {
      console.error('Erro na re-análise:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível re-analisar a conversa",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportAnalysis = () => {
    if (!analysisResults) return;
    
    const exportData = {
      conversation: {
        contact: conversation.contact_name,
        date: conversation.created_at,
        messageCount: conversation.analysis_results ? (Array.isArray(analysisResults) ? analysisResults.length : 1) : 0
      },
      analysis: analysisResults
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-${conversation.contact_name}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatAnalysisDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Conversa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold">{conversation.contact_name}</h2>
                <p className="text-sm text-gray-600 font-normal">
                  Conversa • {formatAnalysisDate(conversation.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {analysisResults && (
                <Button
                  onClick={exportAnalysis}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              )}
              <Button
                onClick={handleReAnalysis}
                disabled={isAnalyzing}
                variant="outline"
                size="sm"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Re-analisar
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-100 text-blue-800">
              📱 Conversa WhatsApp
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              🔗 {conversation.contact_phone}
            </Badge>
            {conversation.last_analyzed_at && (
              <Badge className="bg-purple-100 text-purple-800">
                <Clock className="h-3 w-3 mr-1" />
                Analisada em {formatAnalysisDate(conversation.last_analyzed_at)}
              </Badge>
            )}
            {analysisResults && Array.isArray(analysisResults) && analysisResults.length > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800">
                <Sparkles className="h-3 w-3 mr-1" />
                {analysisResults.length} insights
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prompt Personalizado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Análise Personalizada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Descreva o que você gostaria de analisar especificamente nesta conversa..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={3}
          />
          <p className="text-sm text-gray-600">
            💡 Exemplo: "Analise o tom emocional", "Identifique oportunidades de negócio", "Avalie a satisfação do cliente"
          </p>
        </CardContent>
      </Card>

      {/* Resultados da Análise */}
      {analysisResults ? (
        <div className="space-y-4">
          {Array.isArray(analysisResults) ? (
            analysisResults.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    📊 Análise #{index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {typeof result === 'string' ? (
                      <p className="whitespace-pre-wrap">{result}</p>
                    ) : (
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Resultado da Análise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {typeof analysisResults === 'string' ? (
                    <p className="whitespace-pre-wrap">{analysisResults}</p>
                  ) : (
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                      {JSON.stringify(analysisResults, null, 2)}
                    </pre>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-8 text-center">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-700 mb-2">Nenhuma análise disponível</h3>
            <p className="text-sm text-gray-600 mb-4">
              Esta conversa ainda não foi analisada. Clique em "Re-analisar" para gerar insights.
            </p>
            <Button
              onClick={handleReAnalysis}
              disabled={isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  Analisar Conversa
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
