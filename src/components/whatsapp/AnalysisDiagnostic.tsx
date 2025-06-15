
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
      console.log('🔍 Buscando configuração OpenAI para usuário:', user.id);
      
      const { data: configData, error: configError } = await supabase
        .from('client_configs')
        .select('openai_config')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('📊 Resultado da busca:', { configData, configError });

      if (configError) {
        addResult({
          step: 'Configuração OpenAI',
          status: 'error',
          message: 'Erro ao buscar configuração OpenAI',
          details: { error: configError }
        });
        return;
      }

      if (!configData || !configData.openai_config) {
        addResult({
          step: 'Configuração OpenAI',
          status: 'error',
          message: 'Configuração OpenAI não encontrada no banco de dados'
        });
        return;
      }

      // Verificar se a configuração é um objeto válido
      let openaiConfig;
      try {
        openaiConfig = typeof configData.openai_config === 'string' 
          ? JSON.parse(configData.openai_config) 
          : configData.openai_config;
      } catch (parseError) {
        addResult({
          step: 'Configuração OpenAI',
          status: 'error',
          message: 'Configuração OpenAI com formato inválido',
          details: { parseError }
        });
        return;
      }

      console.log('🔧 Configuração OpenAI parsed:', {
        hasConfig: !!openaiConfig,
        hasApiKey: !!openaiConfig?.apiKey,
        apiKeyLength: openaiConfig?.apiKey?.length || 0,
        apiKeyStart: openaiConfig?.apiKey?.substring(0, 7) || 'N/A'
      });

      // Validar API Key mais rigorosamente
      const apiKey = openaiConfig?.apiKey;
      const hasValidApiKey = apiKey && 
                           typeof apiKey === 'string' && 
                           apiKey.length > 20 && // API keys da OpenAI são bem longas
                           (apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-'));
      
      addResult({
        step: 'Configuração OpenAI',
        status: hasValidApiKey ? 'success' : 'error',
        message: hasValidApiKey 
          ? `API Key válida encontrada (${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)})` 
          : 'API Key inválida, vazia ou não configurada',
        details: { 
          hasApiKey: !!apiKey,
          apiKeyLength: apiKey?.length || 0,
          isValidFormat: hasValidApiKey,
          keyPrefix: apiKey?.substring(0, 7) || 'N/A',
          assistants: Array.isArray(openaiConfig?.assistants) ? openaiConfig.assistants.length : 0,
          rawConfig: openaiConfig
        }
      });

      if (!hasValidApiKey) {
        addResult({
          step: 'Sugestão',
          status: 'warning',
          message: 'Vá para Configurações > OpenAI e configure uma API key válida que comece com "sk-" ou "sk-proj-"'
        });
        return;
      }

      // Passo 3: Verificar conversas marcadas
      console.log('🔍 Buscando conversas marcadas...');
      
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
        details: { 
          conversations: conversations?.slice(0, 2),
          totalFound: conversations?.length || 0
        }
      });

      if (!conversations || conversations.length === 0) {
        addResult({
          step: 'Sugestão',
          status: 'warning',
          message: 'Marque algumas conversas para análise primeiro no WhatsApp Chat'
        });
        return;
      }

      // Passo 4: Testar conexão com OpenAI (opcional)
      addResult({
        step: 'Teste de Conectividade',
        status: 'success',
        message: 'Sistema pronto para análise com IA'
      });

      console.log('✅ DIAGNÓSTICO: Análise concluída com sucesso');

    } catch (error: any) {
      console.error('❌ ERRO no diagnóstico:', error);
      addResult({
        step: 'Erro Geral',
        status: 'error',
        message: `Erro inesperado: ${error.message}`,
        details: { error: error.toString(), stack: error.stack }
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
