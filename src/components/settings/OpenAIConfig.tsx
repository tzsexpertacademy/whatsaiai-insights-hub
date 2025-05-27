import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, CheckCircle, AlertCircle, Brain, Loader2, CreditCard, Key, ExternalLink, ArrowRight, DollarSign } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useClientConfig } from '@/contexts/ClientConfigContext';

const availableModels = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Mais poderoso e caro, com visão' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Rápido e econômico, com visão' },
  { id: 'gpt-4.5-preview', name: 'GPT-4.5 Preview', description: 'Modelo preview muito poderoso' }
];

export function OpenAIConfig() {
  const { config, updateConfig, saveConfig, isLoading, connectionStatus, testOpenAIConnection } = useClientConfig();
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const isConnected = connectionStatus.openai;

  const testConnection = async () => {
    if (!config.openai.apiKey.startsWith('sk-')) {
      toast({
        title: "Erro",
        description: "Chave API OpenAI inválida. Deve começar com 'sk-'",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);

    try {
      const connected = await testOpenAIConnection();
      
      if (connected) {
        await saveConfig();
        
        toast({
          title: "Conectado!",
          description: "OpenAI API configurada e salva com sucesso",
        });
      } else {
        toast({
          title: "Falha na conexão",
          description: "Não foi possível conectar à API da OpenAI",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao testar API OpenAI:', error);
      toast({
        title: "Falha na conexão",
        description: "Não foi possível conectar à API da OpenAI",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const disconnect = async () => {
    updateConfig('openai', {
      apiKey: '',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 400
    });
    
    await saveConfig();
    
    toast({
      title: "Desconectado",
      description: "Conexão com OpenAI removida e salva",
    });
  };

  return (
    <div className="space-y-6">
      {/* Guia de Instalação */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Bot className="h-5 w-5" />
            Guia de Configuração da OpenAI
          </CardTitle>
          <CardDescription className="text-blue-700">
            Siga este passo-a-passo para configurar sua conta OpenAI e conectar ao Observatório
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {/* Passo 1 */}
            <div className="flex gap-4 p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 mb-2">Criar Conta na OpenAI</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Acesse o site da OpenAI e crie sua conta gratuita
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  onClick={() => window.open('https://platform.openai.com/signup', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Criar Conta OpenAI
                </Button>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex gap-4 p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 mb-2">Adicionar Saldo (Créditos)</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Para usar a API, você precisa adicionar créditos à sua conta. Recomendamos começar com $10-20.
                </p>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-3">
                  <p className="text-xs text-yellow-800">
                    💡 <strong>Dica:</strong> O modelo GPT-4o-mini custa cerca de $0,15 por 1M tokens de entrada e $0,60 por 1M tokens de saída.
                    Com $10, você pode processar milhares de análises!
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-green-600 border-green-300 hover:bg-green-50"
                  onClick={() => window.open('https://platform.openai.com/account/billing/overview', '_blank')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Adicionar Créditos
                </Button>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex gap-4 p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 mb-2">Gerar Chave da API</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Crie uma nova chave API para conectar o Observatório à sua conta OpenAI
                </p>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-3">
                  <p className="text-xs text-red-800">
                    🔒 <strong>Importante:</strong> Mantenha sua chave API em segurança! Não compartilhe com ninguém.
                    A chave sempre começa com "sk-"
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                  onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Gerar Chave API
                </Button>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="flex gap-4 p-4 bg-white rounded-lg border border-green-200">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-800 mb-2">Conectar ao Observatório</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Cole sua chave API no campo abaixo e teste a conexão
                </p>
                <div className="flex items-center gap-2 text-green-600">
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-sm font-medium">Configure sua chave API abaixo ⬇️</span>
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertDescription>
              <strong>Estimativa de Custos:</strong> Uma análise típica do Observatório consome cerca de 300-800 tokens, 
              custando aproximadamente $0,001 a $0,003 por análise com o modelo GPT-4o-mini.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Configuração da API */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-green-600" />
              Status da OpenAI API
            </CardTitle>
            <CardDescription>
              Status da conexão com a API OpenAI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              {isLoading ? (
                <>
                  <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                  <span className="text-blue-600 font-medium">Verificando...</span>
                </>
              ) : isConnected ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-green-600 font-medium">Conectado</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <span className="text-red-600 font-medium">Desconectado</span>
                </>
              )}
            </div>
            
            {isConnected && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  Modelo padrão: {availableModels.find(m => m.id === config.openai.model)?.name}
                </p>
                <p className="text-sm text-green-700">
                  Configuração salva no seu perfil
                </p>
              </div>
            )}

            <div className="space-y-3 mt-4">
              <div>
                <Label htmlFor="apikey">Chave da API OpenAI *</Label>
                <Input
                  id="apikey"
                  type="password"
                  placeholder="sk-..."
                  value={config.openai.apiKey}
                  onChange={(e) => updateConfig('openai', { apiKey: e.target.value })}
                  disabled={isConnected}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              {!isConnected ? (
                <Button 
                  onClick={testConnection} 
                  className="flex-1" 
                  disabled={!config.openai.apiKey || isTesting || isLoading}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    'Testar e Salvar'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={disconnect} 
                  variant="destructive" 
                  className="flex-1"
                  disabled={isLoading}
                >
                  Desconectar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Configurações dos Modelos</CardTitle>
            <CardDescription>
              Configure os parâmetros dos modelos de IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="model">Modelo Padrão</Label>
              <Select 
                value={config.openai.model} 
                onValueChange={(value) => updateConfig('openai', { model: value })}
                disabled={isConnected}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-gray-500">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maxTokens">Máximo de Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                placeholder="400"
                value={config.openai.maxTokens}
                onChange={(e) => updateConfig('openai', { maxTokens: parseInt(e.target.value) || 400 })}
                disabled={isConnected}
              />
              <p className="text-xs text-gray-500 mt-1">
                Máximo de tokens por resposta (recomendado: 400-1000)
              </p>
            </div>

            <div>
              <Label htmlFor="temperature">Temperatura</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                placeholder="0.7"
                value={config.openai.temperature}
                onChange={(e) => updateConfig('openai', { temperature: parseFloat(e.target.value) || 0.7 })}
                disabled={isConnected}
              />
              <p className="text-xs text-gray-500 mt-1">
                Criatividade das respostas (0 = preciso, 2 = criativo)
              </p>
            </div>

            {!isConnected && (
              <Button 
                onClick={saveConfig} 
                className="w-full mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modelos Disponíveis */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Modelos Disponíveis</CardTitle>
          <CardDescription>
            Informações sobre os modelos OpenAI disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableModels.map((model) => (
              <div key={model.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-blue-500" />
                  <h3 className="font-medium">{model.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{model.description}</p>
                {model.id === config.openai.model && (
                  <div className="mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Modelo Padrão
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
