
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bug, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Eye
} from 'lucide-react';

interface DiagnosticResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

interface OpenAIConfig {
  apiKey?: string;
  assistants?: any[];
  [key: string]: any;
}

export function AnalysisDiagnostic() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Passo 1: Verificar autenticação
      if (!user?.id) {
        addResult({
          step: 'Autenticação',
          status: 'error',
          message: 'Usuário não autenticado'
        });
        return;
      }

      addResult({
        step: 'Autenticação',
        status: 'success',
        message: `Usuário autenticado: ${user.email}`,
        details: { userId: user.id }
      });

      // Passo 2: Verificar configuração OpenAI
      const { data: configData, error: configError } = await supabase
        .from('client_configs')
        .select('openai_config')
        .eq('user_id', user.id)
        .single();

      if (configError || !configData?.openai_config) {
        addResult({
          step: 'Configuração OpenAI',
          status: 'error',
          message: 'Configuração OpenAI não encontrada',
          details: { error: configError }
        });
        return;
      }

      const openaiConfig = configData.openai_config as OpenAIConfig;
      const hasValidApiKey = openaiConfig?.apiKey && typeof openaiConfig.apiKey === 'string' && openaiConfig.apiKey.startsWith('sk-');
      
      addResult({
        step: 'Configuração OpenAI',
        status: hasValidApiKey ? 'success' : 'error',
        message: hasValidApiKey ? 'API Key válida encontrada' : 'API Key inválida ou não configurada',
        details: { 
          hasApiKey: !!openaiConfig?.apiKey,
          isValidFormat: hasValidApiKey,
          assistants: Array.isArray(openaiConfig?.assistants) ? openaiConfig.assistants.length : 0
        }
      });

      if (!hasValidApiKey) return;

      // Passo 3: Verificar conversas marcadas
      const { data: conversations, error: convError } = await supabase
        .from('whatsapp_conversations_analysis')
        .select('*')
        .eq('user_id', user.id)
        .eq('marked_for_analysis', true)
        .limit(5);

      if (convError) {
        addResult({
          step: 'Conversas Marcadas',
          status: 'error',
          message: 'Erro ao buscar conversas marcadas',
          details: { error: convError }
        });
        return;
      }

      addResult({
        step: 'Conversas Marcadas',
        status: conversations && conversations.length > 0 ? 'success' : 'warning',
        message: `${conversations?.length || 0} conversas marcadas encontradas`,
        details: { conversations: conversations?.slice(0, 2) }
      });

      if (!conversations || conversations.length === 0) {
        addResult({
          step: 'Sugestão',
          status: 'warning',
          message: 'Marque algumas conversas para análise primeiro'
        });
        return;
      }

      // Passo 4: Verificar dados de conversa real
      const testConversation = conversations[0];
      const { data: realConvData, error: realConvError } = await supabase
        .from('whatsapp_conversations')
        .select('messages, contact_name, contact_phone')
        .eq('user_id', user.id)
        .eq('contact_phone', testConversation.contact_phone)
        .single();

      if (realConvError || !realConvData?.messages) {
        addResult({
          step: 'Dados da Conversa',
          status: 'error',
          message: 'Conversa real não encontrada no banco',
          details: { 
            error: realConvError,
            searchPhone: testConversation.contact_phone,
            searchName: testConversation.contact_name
          }
        });
        return;
      }

      const messages = Array.isArray(realConvData.messages) ? realConvData.messages : [];
      
      addResult({
        step: 'Dados da Conversa',
        status: 'success',
        message: `Conversa encontrada com ${messages.length} mensagens`,
        details: { 
          messagesCount: messages.length,
          contactName: realConvData.contact_name,
          contactPhone: realConvData.contact_phone
        }
      });

      // Passo 5: Teste da Edge Function
      const testPayload = {
        conversation_id: testConversation.id,
        messages: messages.slice(0, 5), // Apenas 5 mensagens para teste
        analysis_prompt: 'Análise de teste - resuma esta conversa em uma frase.',
        analysis_type: 'test',
        assistant_id: 'kairon',
        contact_info: {
          name: testConversation.contact_name,
          phone: testConversation.contact_phone
        }
      };

      addResult({
        step: 'Preparação do Teste',
        status: 'success',
        message: 'Payload preparado para teste da Edge Function',
        details: { 
          payloadSize: JSON.stringify(testPayload).length,
          messagesCount: testPayload.messages.length
        }
      });

      const { data: edgeResult, error: edgeError } = await supabase.functions.invoke('analyze-conversation', {
        body: testPayload
      });

      if (edgeError) {
        addResult({
          step: 'Edge Function',
          status: 'error',
          message: 'Erro na Edge Function',
          details: { 
            error: edgeError,
            errorMessage: edgeError.message,
            errorCode: edgeError.code
          }
        });
        return;
      }

      addResult({
        step: 'Edge Function',
        status: edgeResult?.success ? 'success' : 'error',
        message: edgeResult?.success ? 'Edge Function executada com sucesso' : 'Edge Function falhou',
        details: { 
          result: edgeResult,
          success: edgeResult?.success,
          insightsCount: edgeResult?.insights?.length || 0
        }
      });

    } catch (error: any) {
      addResult({
        step: 'Erro Geral',
        status: 'error',
        message: `Erro inesperado: ${error.message}`,
        details: { error: error.stack }
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-blue-500" />
          Diagnóstico do Sistema de Análise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostic}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executando Diagnóstico...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Executar Diagnóstico Completo
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Resultados do Diagnóstico:</h4>
            {results.map((result, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}>
                <div className="flex items-start gap-2">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.step}</span>
                      <Badge variant="outline" className="text-xs">
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">Ver detalhes</summary>
                        <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto max-h-32">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
