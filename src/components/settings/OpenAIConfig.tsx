
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, CheckCircle, AlertCircle, Brain } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const availableModels = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Mais poderoso e caro, com visão' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Rápido e econômico, com visão' },
  { id: 'gpt-4.5-preview', name: 'GPT-4.5 Preview', description: 'Modelo preview muito poderoso' }
];

export function OpenAIConfig() {
  const [isConnected, setIsConnected] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [defaultModel, setDefaultModel] = useState('gpt-4o-mini');
  const [organization, setOrganization] = useState('');
  const [maxTokens, setMaxTokens] = useState('4000');
  const [temperature, setTemperature] = useState('0.7');
  const { toast } = useToast();

  const testConnection = async () => {
    if (!apiKey.startsWith('sk-')) {
      toast({
        title: "Erro",
        description: "Chave API OpenAI inválida. Deve começar com 'sk-'",
        variant: "destructive",
      });
      return;
    }

    // Simular teste de conexão
    setTimeout(() => {
      setIsConnected(true);
      toast({
        title: "Conectado!",
        description: "OpenAI API configurada com sucesso",
      });
    }, 1500);
  };

  const disconnect = () => {
    setIsConnected(false);
    toast({
      title: "Desconectado",
      description: "Conexão com OpenAI removida",
    });
  };

  return (
    <div className="space-y-6">
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
              {isConnected ? (
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
                  Modelo padrão: {availableModels.find(m => m.id === defaultModel)?.name}
                </p>
                <p className="text-sm text-green-700">
                  Todos os assistentes configurados e prontos
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
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isConnected}
                />
              </div>

              <div>
                <Label htmlFor="organization">ID da Organização (opcional)</Label>
                <Input
                  id="organization"
                  placeholder="org-..."
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  disabled={isConnected}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              {!isConnected ? (
                <Button onClick={testConnection} className="flex-1" disabled={!apiKey}>
                  Testar Conexão
                </Button>
              ) : (
                <Button onClick={disconnect} variant="destructive" className="flex-1">
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
              <Select value={defaultModel} onValueChange={setDefaultModel} disabled={isConnected}>
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
                placeholder="4000"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                disabled={isConnected}
              />
              <p className="text-xs text-gray-500 mt-1">
                Máximo de tokens por resposta (recomendado: 4000)
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
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                disabled={isConnected}
              />
              <p className="text-xs text-gray-500 mt-1">
                Criatividade das respostas (0 = preciso, 2 = criativo)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

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
                {model.id === defaultModel && (
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
