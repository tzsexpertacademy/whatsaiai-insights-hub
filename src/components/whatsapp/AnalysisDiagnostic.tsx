
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
  Eye,
  RefreshCw
} from 'lucide-react';

interface DiagnosticResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export function AnalysisDiagnostic() {
  const { user } = useAuth();
  const { config, saveConfig } = useClientConfig();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const syncConfigToDatabase = async () => {
    try {
      console.log('🔄 Sincronizando configuração OpenAI com o banco...');
      await saveConfig();
      
      addResult({
        step: 'Sincronização',
        status: 'success',
        message: 'Configuração OpenAI sincronizada entre ClientConfig e banco de dados'
      });
      
      toast({
        title: "Configuração sincronizada",
        description: "OpenAI API Key sincronizada com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      addResult({
        step: 'Sincronização',
        status: 'error',
        message: 'Erro ao sincronizar configuração com o banco',
        details: { error }
      });
      return false;
    }
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

      // Passo 2: Verificar configuração OpenAI do ClientConfig
      console.log('🔍 Verificando configuração OpenAI do ClientConfig...');
      
      const openaiApiKey = config.openai?.apiKey;
      
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
          keyPrefix: openaiApiKey?.substring(0, 10) || 'N/A'
        }
      });

      if (!hasValidApiKey) {
        addResult({
          step: 'Sugestão',
          status: 'warning',
          message: 'Vá para Configurações > OpenAI e configure sua API key'
        });
        return;
      }

      // Passo 3: Verificar configuração no banco de dados
      console.log('🔍 Verificando configuração no banco de dados...');
      
      const { data: configData, error: configError } = await supabase
        .from('client_configs')
        .select('openai_config')
        .eq('user_id', user.id)
        .maybeSingle();

      let needsSync = false;

      if (configError) {
        addResult({
          step: 'Configuração OpenAI (Banco)',
          status: 'warning',
          message: 'Erro ao acessar configuração no banco de dados',
          details: { error: configError }
        });
        needsSync = true;
      } else if (configData?.openai_config) {
        try {
          const dbOpenaiConfig = typeof configData.openai_config === 'string' 
            ? JSON.parse(configData.openai_config) 
            : configData.openai_config;
          
          const dbApiKey = dbOpenaiConfig?.apiKey;
          const configsMatch = dbApiKey === openaiApiKey;
          
          if (configsMatch) {
            addResult({
              step: 'Configuração OpenAI (Banco)',
              status: 'success',
              message: 'Configuração no banco está sincronizada com o ClientConfig'
            });
          } else {
            addResult({
              step: 'Configuração OpenAI (Banco)',
              status: 'warning',
              message: 'Divergência detectada entre ClientConfig e banco de dados',
              details: { 
                clientConfigKey: openaiApiKey?.substring(0, 10) + '...',
                dbKey: dbApiKey?.substring(0, 10) + '...'
              }
            });
            needsSync = true;
          }
        } catch (parseError) {
          addResult({
            step: 'Configuração OpenAI (Banco)',
            status: 'warning',
            message: 'Configuração no banco com formato inválido',
            details: { parseError }
          });
          needsSync = true;
        }
      } else {
        addResult({
          step: 'Configuração OpenAI (Banco)',
          status: 'warning',
          message: 'Nenhuma configuração encontrada no banco de dados'
        });
        needsSync = true;
      }

      // Passo 4: Sincronizar se necessário
      if (needsSync) {
        console.log('🔄 Sincronização necessária detectada...');
        const syncSuccess = await syncConfigToDatabase();
        if (!syncSuccess) {
          return;
        }
      }

      // Passo 5: Testar conexão real com OpenAI
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

      // Passo 6: Verificar conversas marcadas
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
          
          <Button 
            onClick={syncConfigToDatabase}
            disabled={isRunning}
            variant="outline"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sincronizar Config
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
