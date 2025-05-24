
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2, Wifi, Database, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface DiagnosticResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string;
}

interface FirebaseConnectionDiagnosticsProps {
  config: {
    projectId: string;
    apiKey: string;
    databaseURL: string;
    authDomain: string;
  };
}

export function FirebaseConnectionDiagnostics({ config }: FirebaseConnectionDiagnosticsProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    const diagnostics: DiagnosticResult[] = [
      { step: 'Validação de Configuração', status: 'pending', message: 'Verificando campos obrigatórios...' },
      { step: 'Teste de API Key', status: 'pending', message: 'Validando chave de API...' },
      { step: 'Teste de Project ID', status: 'pending', message: 'Verificando projeto...' },
      { step: 'Teste de Database URL', status: 'pending', message: 'Testando acesso ao banco...' },
      { step: 'Teste de Regras', status: 'pending', message: 'Verificando permissões...' }
    ];

    setResults([...diagnostics]);

    // 1. Validação de Configuração
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const configValidation = validateConfig(config);
    diagnostics[0] = {
      ...diagnostics[0],
      status: configValidation.isValid ? 'success' : 'error',
      message: configValidation.message,
      details: configValidation.details
    };
    setResults([...diagnostics]);

    if (!configValidation.isValid) {
      setIsRunning(false);
      return;
    }

    // 2. Teste de API Key
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const apiKeyTest = await testApiKey(config.projectId, config.apiKey);
      diagnostics[1] = {
        ...diagnostics[1],
        status: apiKeyTest.isValid ? 'success' : 'error',
        message: apiKeyTest.message,
        details: apiKeyTest.details
      };
    } catch (error) {
      diagnostics[1] = {
        ...diagnostics[1],
        status: 'error',
        message: 'Erro ao testar API Key',
        details: error.message
      };
    }
    setResults([...diagnostics]);

    // 3. Teste de Project ID
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const projectTest = await testProject(config.projectId, config.apiKey);
      diagnostics[2] = {
        ...diagnostics[2],
        status: projectTest.isValid ? 'success' : 'error',
        message: projectTest.message,
        details: projectTest.details
      };
    } catch (error) {
      diagnostics[2] = {
        ...diagnostics[2],
        status: 'error',
        message: 'Erro ao verificar projeto',
        details: error.message
      };
    }
    setResults([...diagnostics]);

    // 4. Teste de Database URL
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const databaseTest = await testDatabase(config.databaseURL);
      diagnostics[3] = {
        ...diagnostics[3],
        status: databaseTest.isValid ? 'success' : 'error',
        message: databaseTest.message,
        details: databaseTest.details
      };
    } catch (error) {
      diagnostics[3] = {
        ...diagnostics[3],
        status: 'error',
        message: 'Erro ao testar banco de dados',
        details: error.message
      };
    }
    setResults([...diagnostics]);

    // 5. Teste de Regras
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const rulesTest = await testDatabaseRules(config.databaseURL);
      diagnostics[4] = {
        ...diagnostics[4],
        status: rulesTest.isValid ? 'success' : 'error',
        message: rulesTest.message,
        details: rulesTest.details
      };
    } catch (error) {
      diagnostics[4] = {
        ...diagnostics[4],
        status: 'error',
        message: 'Erro ao verificar regras',
        details: error.message
      };
    }
    setResults([...diagnostics]);

    setIsRunning(false);

    const hasErrors = diagnostics.some(d => d.status === 'error');
    if (!hasErrors) {
      toast({
        title: "🎉 Conexão bem-sucedida!",
        description: "Firebase configurado corretamente"
      });
    } else {
      toast({
        title: "⚠️ Problemas encontrados",
        description: "Verifique os detalhes dos diagnósticos",
        variant: "destructive"
      });
    }
  };

  const validateConfig = (config: any) => {
    const missing = [];
    if (!config.projectId) missing.push('Project ID');
    if (!config.apiKey) missing.push('API Key');
    if (!config.databaseURL) missing.push('Database URL');

    if (missing.length > 0) {
      return {
        isValid: false,
        message: `Campos obrigatórios ausentes: ${missing.join(', ')}`,
        details: 'Preencha todos os campos obrigatórios antes de testar'
      };
    }

    // Validar formato da Database URL
    if (!config.databaseURL.includes('firebaseio.com') && !config.databaseURL.includes('firebasedatabase.app')) {
      return {
        isValid: false,
        message: 'Database URL inválida',
        details: 'A URL deve terminar com .firebaseio.com ou .firebasedatabase.app'
      };
    }

    // Validar formato da API Key
    if (!config.apiKey.startsWith('AIza')) {
      return {
        isValid: false,
        message: 'API Key inválida',
        details: 'A API Key deve começar com "AIza"'
      };
    }

    return {
      isValid: true,
      message: '✅ Configuração válida',
      details: 'Todos os campos obrigatórios estão preenchidos corretamente'
    };
  };

  const testApiKey = async (projectId: string, apiKey: string) => {
    try {
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}?key=${apiKey}`);
      
      if (response.status === 404) {
        return {
          isValid: false,
          message: '❌ Project ID não encontrado',
          details: 'Verifique se o Project ID está correto no console Firebase'
        };
      }

      if (response.status === 401) {
        return {
          isValid: false,
          message: '❌ API Key inválida',
          details: 'Verifique se a API Key está correta e ativa'
        };
      }

      if (response.status === 403) {
        return {
          isValid: false,
          message: '❌ API Key sem permissões',
          details: 'A API Key não tem permissões para este projeto'
        };
      }

      return {
        isValid: true,
        message: '✅ API Key válida',
        details: 'Autenticação funcionando corretamente'
      };
    } catch (error) {
      return {
        isValid: false,
        message: '❌ Erro de rede',
        details: 'Verifique sua conexão com a internet'
      };
    }
  };

  const testProject = async (projectId: string, apiKey: string) => {
    try {
      const response = await fetch(`https://firebase.googleapis.com/v1beta1/projects/${projectId}?key=${apiKey}`);
      
      if (response.ok) {
        return {
          isValid: true,
          message: '✅ Projeto acessível',
          details: 'Projeto Firebase encontrado e acessível'
        };
      } else {
        return {
          isValid: false,
          message: '❌ Projeto inacessível',
          details: `Status: ${response.status}`
        };
      }
    } catch (error) {
      return {
        isValid: false,
        message: '❌ Erro ao verificar projeto',
        details: error.message
      };
    }
  };

  const testDatabase = async (databaseURL: string) => {
    try {
      const testUrl = `${databaseURL.replace(/\/$/, '')}/.json`;
      const response = await fetch(testUrl);
      
      if (response.status === 401) {
        return {
          isValid: false,
          message: '❌ Banco sem permissões',
          details: 'Configure as regras do Realtime Database para permitir acesso'
        };
      }

      if (response.status === 404) {
        return {
          isValid: false,
          message: '❌ Database não encontrado',
          details: 'Verifique se o Realtime Database está ativado no console Firebase'
        };
      }

      return {
        isValid: true,
        message: '✅ Database acessível',
        details: 'Realtime Database funcionando corretamente'
      };
    } catch (error) {
      return {
        isValid: false,
        message: '❌ Erro de conexão',
        details: 'Não foi possível conectar ao banco de dados'
      };
    }
  };

  const testDatabaseRules = async (databaseURL: string) => {
    try {
      const testUrl = `${databaseURL.replace(/\/$/, '')}/test.json`;
      
      // Tentar escrever
      const writeResponse = await fetch(testUrl, {
        method: 'PUT',
        body: JSON.stringify({ timestamp: Date.now() })
      });

      if (writeResponse.status === 401) {
        return {
          isValid: false,
          message: '❌ Regras muito restritivas',
          details: 'Configure as regras para permitir leitura/escrita temporariamente: {"rules": {".read": true, ".write": true}}'
        };
      }

      if (writeResponse.ok) {
        // Tentar deletar o teste
        await fetch(testUrl, { method: 'DELETE' });
        
        return {
          isValid: true,
          message: '✅ Regras configuradas',
          details: 'Permissões de leitura e escrita funcionando'
        };
      }

      return {
        isValid: false,
        message: '❌ Problema nas regras',
        details: `Status: ${writeResponse.status}`
      };
    } catch (error) {
      return {
        isValid: false,
        message: '❌ Erro ao testar regras',
        details: error.message
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-blue-600" />
          Diagnóstico de Conexão Firebase
        </CardTitle>
        <CardDescription>
          Teste detalhado para identificar problemas de conexão
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executando diagnósticos...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Executar Diagnóstico Completo
            </>
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  result.status === 'success' ? 'bg-green-50 border-green-200' :
                  result.status === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(result.status)}
                  <span className="font-medium text-sm">{result.step}</span>
                </div>
                <p className="text-sm">{result.message}</p>
                {result.details && (
                  <p className="text-xs text-gray-600 mt-1">{result.details}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Checklist Rápido
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Realtime Database ativado no console Firebase</li>
            <li>• Regras temporárias: {`{"rules": {".read": true, ".write": true}}`}</li>
            <li>• API Key válida e sem restrições de domínio</li>
            <li>• Database URL termina com .firebaseio.com/</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
