
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
        .maybeSingle();

      if (configError) {
        addResult({
          step: 'Configuração OpenAI',
          status: 'error',
          message: 'Erro ao buscar configuração OpenAI',
          details: { error: configError }
        });
        return;
      }

      if (!configData?.openai_config) {
        addResult({
          step: 'Configuração OpenAI',
          status: 'error',
          message: 'Configuração OpenAI não encontrada'
        });
        return;
      }

      const openaiConfig = configData.openai_config as any;
      const hasValidApiKey = openaiConfig?.apiKey && 
                           typeof openaiConfig.apiKey === 'string' && 
                           openaiConfig.apiKey.startsWith('sk-');
      
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

      console.log('🔍 DIAGNÓSTICO: Análise concluída com sucesso');

    } catch (error: any) {
      console.error('❌ ERRO no diagnóstico:', error);
      addResult({
        step: 'Erro Geral',
        status: 'error',
        message: `Erro inesperado: ${error.message}`,
        details: { error: error.toString() }
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
                Executar Diagnóstico
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Resultados:</h4>
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
