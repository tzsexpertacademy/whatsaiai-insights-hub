
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Key, Settings, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCommercialClientConfig } from '@/hooks/useCommercialClientConfig';

export function CommercialOpenAIConfig() {
  const [config, setConfig] = useState({
    apiKey: '',
    model: 'gpt-4o-mini',
    temperature: '0.7',
    maxTokens: '1000',
    commercialPrompts: {
      salesAnalysis: 'Você é um especialista em análise de vendas...',
      leadQualification: 'Você é um especialista em qualificação de leads...',
      conversionOptimization: 'Você é um especialista em otimização de conversão...'
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { updateConfig } = useCommercialClientConfig();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateConfig({
        commercial_openai_config: {
          ...config,
          module: 'commercial',
          configured_at: new Date().toISOString()
        }
      });
      
      toast({
        title: "Configuração OpenAI Comercial salva",
        description: "As configurações da IA para vendas foram atualizadas",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar configuração",
        description: "Não foi possível salvar as configurações da OpenAI comercial",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Configuração OpenAI Comercial
          </CardTitle>
          <CardDescription>
            Configure a IA especificamente para análise de vendas e insights comerciais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Bot className="h-4 w-4" />
            <AlertDescription>
              Esta configuração é específica para o módulo comercial e otimizada para análise de vendas,
              qualificação de leads e otimização de conversão.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="commercial-apiKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Key OpenAI (Comercial)
              </Label>
              <Input
                id="commercial-apiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="sk-proj-..."
              />
              <p className="text-xs text-muted-foreground">
                Chave específica para análises comerciais e de vendas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commercial-model">Modelo IA</Label>
                <Select value={config.model} onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">GPT-4O Mini (Recomendado)</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4O (Mais Poderoso)</SelectItem>
                    <SelectItem value="gpt-4.5-preview">GPT-4.5 Preview (Experimental)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commercial-temperature">Temperatura</Label>
                <Select value={config.temperature} onValueChange={(value) => setConfig(prev => ({ ...prev, temperature: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.3">0.3 (Mais Preciso)</SelectItem>
                    <SelectItem value="0.5">0.5 (Equilibrado)</SelectItem>
                    <SelectItem value="0.7">0.7 (Criativo)</SelectItem>
                    <SelectItem value="0.9">0.9 (Muito Criativo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commercial-maxTokens">Max Tokens</Label>
                <Select value={config.maxTokens} onValueChange={(value) => setConfig(prev => ({ ...prev, maxTokens: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">500 (Respostas Curtas)</SelectItem>
                    <SelectItem value="1000">1000 (Padrão)</SelectItem>
                    <SelectItem value="2000">2000 (Análises Detalhadas)</SelectItem>
                    <SelectItem value="4000">4000 (Análises Extensas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Prompts Especializados para Vendas
              </h4>
              
              <div className="grid gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Análise de Vendas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-blue-700">
                      Prompt otimizado para analisar conversas de vendas e identificar oportunidades
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Qualificação de Leads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-green-700">
                      Prompt especializado em qualificar leads e classificar potencial de conversão
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Otimização de Conversão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-purple-700">
                      Prompt focado em identificar pontos de melhoria no processo de vendas
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleSave} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando configuração comercial...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Salvar Configuração OpenAI Comercial
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
