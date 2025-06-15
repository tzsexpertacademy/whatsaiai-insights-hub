import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useClientConfig } from '@/contexts/ClientConfigContext';
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
  const { config } = useClientConfig();
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

      // Passo 2: Verificar configuração OpenAI do ClientConfig (mesma fonte dos assistentes)
      console.log('🔍 Verificando configuração OpenAI do ClientConfig...');
      console.log('📊 Config atual:', { 
        hasOpenAIConfig: !!config.openai,
        apiKeyExists: !!config.openai?.apiKey,
        apiKeyLength: config.openai?.apiKey?.length || 0,
        apiKeyStart: config.openai?.apiKey?.substring(0, 10) || 'N/A'
      });

      const openaiApiKey = config.openai?.apiKey;
      
      // Validar API Key mais rigorosamente
      const hasValidApiKey = openaiApiKey && 
                           typeof openaiApiKey === 'string' && 
                           openaiApiKey.length > 20 && 
                           (openaiApiKey.startsWith('sk-') || openaiApiKey.startsWith('sk-proj-'));
      
      addResult({
        step: 'Configuração OpenAI (ClientConfig)',
        status: hasValidApiKey ? 'success' : 'error',
        message: hasValidApiKey 
          ? `API Key válida encontrada (${openaiApiKey.substring(0, 10)}...)` 
          : 'API Key inválida, vazia ou não configurada no ClientConfig',
        details: { 
          hasApiKey: !!openaiApiKey,
          apiKeyLength: openaiApiKey?.length || 0,
          isValidFormat: hasValidApiKey,
          keyPrefix: openaiApiKey?.substring(0, 10) || 'N/A',
          configSource: 'ClientConfig Context'
        }
      });

      // Passo 3: Verificar também no banco de dados (como fallback)
      console.log('🔍 Verificando também configuração no banco de dados...');
      
      const { data: configData, error: configError } = await supabase
        .from('client_configs')
        .select('openai_config')
        .eq('user_id', user.id)
        .maybeSingle();

      if (configError) {
        addResult({
          step: 'Configuração OpenAI (Banco)',
          status: 'warning',
          message: 'Erro ao acessar configuração no banco de dados',
          details: { error: configError }
        });
      } else if (configData?.openai_config) {
        let dbOpenaiConfig;
        try {
          dbOpenaiConfig = typeof configData.openai_config === 'string' 
            ? JSON.parse(configData.openai_config) 
            : configData.openai_config;
          
          const dbApiKey = dbOpenaiConfig?.apiKey;
          const dbHasValidApiKey = dbApiKey && 
                                 typeof dbApiKey === 'string' && 
                                 dbApiKey.length > 20 && 
                                 (dbApiKey.startsWith('sk-') || dbApiKey.startsWith('sk-proj-'));
          
          addResult({
            step: 'Configuração OpenAI (Banco)',
            status: dbHasValidApiKey ? 'success' : 'warning',
            message: dbHasValidApiKey 
              ? `API Key também encontrada no banco (${dbApiKey.substring(0, 10)}...)` 
              : 'Configuração no banco difere do ClientConfig',
            details: { 
              dbHasApiKey: !!dbApiKey,
              dbApiKeyLength: dbApiKey?.length || 0,
              dbIsValidFormat: dbHasValidApiKey,
              dbKeyPrefix: dbApiKey?.substring(0, 10) || 'N/A',
              configSource: 'Database'
            }
          });
        } catch (parseError) {
          addResult({
            step: 'Configuração OpenAI (Banco)',
            status: 'warning',
            message: 'Configuração no banco com formato inválido',
            details: { parseError }
          });
        }
      }

      if (!hasValidApiKey) {
        addResult({
          step: 'Sugestão',
          status: 'warning',
          message: 'Vá para Configurações > OpenAI e reconecte sua API key. Se já está conectada, desconecte e conecte novamente.'
        });
        return;
      }

      // Passo 4: Testar conexão real com OpenAI
      console.log('🔍 Testando conexão real com OpenAI...');
      
      try {
        const testResponse = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (testResponse.ok) {
          addResult({
            step: 'Teste OpenAI',
            status: 'success',
            message: 'Conexão com OpenAI funcionando perfeitamente',
            details: { statusCode: testResponse.status }
          });
        } else {
          const errorText = await testResponse.text();
          addResult({
            step: 'Teste OpenAI',
            status: 'error',
            message: `Erro na conexão com OpenAI: ${testResponse.status}`,
            details: { statusCode: testResponse.status, error: errorText }
          });
          return;
        }
      } catch (networkError) {
        addResult({
          step: 'Teste OpenAI',
          status: 'error',
          message: 'Erro de rede ao conectar com OpenAI',
          details: { error: networkError.message }
        });
        return;
      }

      // Passo 5: Verificar conversas marcadas
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

      addResult({
        step: 'Sistema Pronto',
        status: 'success',
        message: '🎉 Sistema totalmente funcional! Análise de IA está pronta para uso.'
      });

      console.log('✅ DIAGNÓSTICO: Sistema aprovado em todos os testes');

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
