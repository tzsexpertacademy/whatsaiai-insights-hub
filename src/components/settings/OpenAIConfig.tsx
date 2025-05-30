
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, CheckCircle, AlertCircle, Brain, Loader2, Key, ExternalLink, ArrowRight, DollarSign, Zap, Target, TrendingUp } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useClientConfig } from '@/contexts/ClientConfigContext';

const availableModels = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Rápido e econômico, ideal para começar', recommended: true },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Mais poderoso, para análises avançadas', recommended: false },
  { id: 'gpt-4.5-preview', name: 'GPT-4.5 Preview', description: 'Modelo experimental de última geração', recommended: false }
];

export function OpenAIConfig() {
  const { config, updateConfig, saveConfig, isLoading, connectionStatus, testOpenAIConnection } = useClientConfig();
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const isConnected = connectionStatus.openai;

  const testConnection = async () => {
    if (!config.openai.apiKey.startsWith('sk-')) {
      toast({
        title: "Chave API inválida",
        description: "A chave API deve começar com 'sk-'",
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
          title: "🎉 Conectado com sucesso!",
          description: "Sua IA está pronta para revolucionar sua análise",
        });
      } else {
        toast({
          title: "Falha na conexão",
          description: "Verifique sua chave API e tente novamente",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao testar API OpenAI:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar à OpenAI",
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
      description: "Conexão removida com sucesso",
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-500 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ative sua IA</h1>
              <p className="text-blue-100">Transforme dados em insights poderosos</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Target className="w-5 h-5 text-emerald-300 mb-2" />
              <h3 className="font-semibold text-sm mb-1">Análise Instantânea</h3>
              <p className="text-xs text-blue-100">Insights em segundos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <TrendingUp className="w-5 h-5 text-emerald-300 mb-2" />
              <h3 className="font-semibold text-sm mb-1">Custo Baixo</h3>
              <p className="text-xs text-blue-100">A partir de $0,001 por análise</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Zap className="w-5 h-5 text-emerald-300 mb-2" />
              <h3 className="font-semibold text-sm mb-1">Setup Rápido</h3>
              <p className="text-xs text-blue-100">3 passos simples</p>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Guide - Simplified */}
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-800">Como começar</CardTitle>
          <CardDescription className="text-gray-600">
            Configure sua conta OpenAI em 3 passos simples
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">Crie sua conta OpenAI</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Acesse o site oficial e crie sua conta gratuita
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  onClick={() => window.open('https://platform.openai.com/signup', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Criar Conta
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">Adicione créditos</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Comece com $10-20 (suficiente para milhares de análises)
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-green-600 border-green-300 hover:bg-green-50"
                  onClick={() => window.open('https://platform.openai.com/account/billing/overview', '_blank')}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Adicionar Créditos
                </Button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">Gere sua chave API</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Cole a chave no campo abaixo (começa com "sk-")
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                  onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Gerar Chave
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Card */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              ) : isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              Status da Conexão
            </CardTitle>
            <CardDescription>
              {isConnected ? 'IA conectada e funcionando' : 'Configure sua chave API para começar'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  <strong>✅ Conectado!</strong> Sua IA está pronta para uso.
                  <br />
                  Modelo: {availableModels.find(m => m.id === config.openai.model)?.name}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="apikey" className="text-sm font-medium">Chave API OpenAI</Label>
              <Input
                id="apikey"
                type="password"
                placeholder="sk-proj-..."
                value={config.openai.apiKey}
                onChange={(e) => updateConfig('openai', { apiKey: e.target.value })}
                disabled={isConnected}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Sua chave permanece segura e privada
              </p>
            </div>

            <div className="pt-2">
              {!isConnected ? (
                <Button 
                  onClick={testConnection} 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" 
                  disabled={!config.openai.apiKey || isTesting || isLoading}
                  size="lg"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Conectar e Ativar IA
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={disconnect} 
                  variant="outline" 
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  disabled={isLoading}
                >
                  Desconectar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Model Configuration */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Configuração do Modelo
            </CardTitle>
            <CardDescription>
              Ajuste os parâmetros da IA conforme sua necessidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model">Modelo de IA</Label>
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
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {model.name}
                            {model.recommended && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                Recomendado
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{model.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Select
                  value={config.openai.maxTokens.toString()}
                  onValueChange={(value) => updateConfig('openai', { maxTokens: parseInt(value) })}
                  disabled={isConnected}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="400">400 (Rápido)</SelectItem>
                    <SelectItem value="800">800 (Equilibrado)</SelectItem>
                    <SelectItem value="1500">1500 (Detalhado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Criatividade</Label>
                <Select
                  value={config.openai.temperature.toString()}
                  onValueChange={(value) => updateConfig('openai', { temperature: parseFloat(value) })}
                  disabled={isConnected}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.3">0.3 (Preciso)</SelectItem>
                    <SelectItem value="0.7">0.7 (Equilibrado)</SelectItem>
                    <SelectItem value="1.0">1.0 (Criativo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!isConnected && (
              <Button 
                onClick={saveConfig} 
                variant="outline"
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

      {/* Cost Information */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-emerald-800 mb-1">Custo Transparente</h3>
              <p className="text-sm text-emerald-700">
                <strong>GPT-4o Mini:</strong> ~$0,001 por análise típica • 
                <strong> GPT-4o:</strong> ~$0,005 por análise • 
                Com $10 você faz milhares de análises!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
