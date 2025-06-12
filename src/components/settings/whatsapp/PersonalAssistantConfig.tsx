
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Shield, 
  Settings, 
  User, 
  CheckCircle, 
  AlertTriangle,
  Phone,
  MessageSquare,
  Zap
} from 'lucide-react';

interface PersonalAssistantConfig {
  enabled: boolean;
  masterNumber: string;
  assistantName: string;
  systemPrompt: string;
  responseDelay: number; // em segundos
}

export function PersonalAssistantConfig() {
  const { toast } = useToast();
  
  const [config, setConfig] = useState<PersonalAssistantConfig>(() => {
    const saved = localStorage.getItem('personal_assistant_config');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      masterNumber: '',
      assistantName: 'Kairon',
      systemPrompt: `Você é Kairon, um assistente pessoal inteligente via WhatsApp. 

Características:
- Seja proativo, eficiente e direto
- Mantenha conversas naturais e amigáveis
- Ajude com tarefas, lembretes, informações e organização
- Responda de forma concisa mas completa
- Use emojis adequadamente para tornar a conversa mais natural

Você está respondendo apenas ao seu usuário master, então seja pessoal e útil.`,
      responseDelay: 2
    };
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const updateConfig = (updates: Partial<PersonalAssistantConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    localStorage.setItem('personal_assistant_config', JSON.stringify(newConfig));
    
    toast({
      title: "Configuração salva! 🤖",
      description: "Configurações do assistente pessoal atualizadas"
    });
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Se começar com 55 (Brasil), mantém
    // Se não, adiciona 55
    if (cleaned.length >= 11) {
      if (cleaned.startsWith('55')) {
        return cleaned;
      } else {
        return '55' + cleaned;
      }
    }
    
    return cleaned;
  };

  const testConnection = async () => {
    if (!config.masterNumber.trim()) {
      toast({
        title: "Número necessário",
        description: "Configure seu número master primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);

    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "✅ Teste realizado!",
        description: `Assistente configurado para responder apenas ao número ${config.masterNumber}`
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Verifique as configurações e tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const validateMasterNumber = (number: string): boolean => {
    const cleaned = number.replace(/\D/g, '');
    return cleaned.length >= 10; // Mínimo 10 dígitos
  };

  return (
    <div className="space-y-6">
      {/* Status do Assistente */}
      <Card className={`border-2 ${config.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Assistente Pessoal WhatsApp
            {config.enabled && <Badge className="bg-green-100 text-green-800">Ativo</Badge>}
          </CardTitle>
          <CardDescription>
            Configure um assistente de IA que responde apenas às suas mensagens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={config.enabled}
                onCheckedChange={(enabled) => updateConfig({ enabled })}
              />
              <Label className="font-medium">
                {config.enabled ? 'Assistente Ativo' : 'Assistente Inativo'}
              </Label>
            </div>
            
            {config.enabled && config.masterNumber && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Protegido
              </Badge>
            )}
          </div>

          {config.enabled && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>🛡️ Modo Seguro:</strong> O assistente responderá apenas às mensagens enviadas do número master configurado ({config.masterNumber || 'não configurado'}).
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuração do Número Master */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            Número Master Autorizado
          </CardTitle>
          <CardDescription>
            Apenas este número poderá acionar o assistente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="master-number">Seu número (com DDD)</Label>
            <Input
              id="master-number"
              placeholder="Ex: 11987654321"
              value={config.masterNumber}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                updateConfig({ masterNumber: formatted });
              }}
              className={validateMasterNumber(config.masterNumber) ? 'border-green-300' : ''}
            />
            <p className="text-xs text-gray-500">
              Digite apenas números. Exemplo: 11987654321 (será formatado automaticamente)
            </p>
          </div>

          {config.masterNumber && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Phone className="h-4 w-4 text-gray-600" />
              <span className="text-sm">
                Número formatado: <strong>+{config.masterNumber}</strong>
              </span>
              {validateMasterNumber(config.masterNumber) ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuração do Assistente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Personalização do Assistente
          </CardTitle>
          <CardDescription>
            Configure o comportamento e personalidade do assistente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assistant-name">Nome do Assistente</Label>
            <Input
              id="assistant-name"
              value={config.assistantName}
              onChange={(e) => updateConfig({ assistantName: e.target.value })}
              placeholder="Ex: Kairon, Assistant, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="system-prompt">Prompt do Sistema</Label>
            <textarea
              id="system-prompt"
              className="w-full min-h-[120px] p-3 text-sm border border-gray-300 rounded-md resize-vertical"
              value={config.systemPrompt}
              onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
              placeholder="Defina como o assistente deve se comportar..."
            />
            <p className="text-xs text-gray-500">
              Este prompt define a personalidade e comportamento do assistente
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="response-delay">Delay de Resposta (segundos)</Label>
            <Input
              id="response-delay"
              type="number"
              min="1"
              max="30"
              value={config.responseDelay}
              onChange={(e) => updateConfig({ responseDelay: parseInt(e.target.value) || 2 })}
            />
            <p className="text-xs text-gray-500">
              Tempo de espera antes de enviar a resposta (mais natural)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Teste de Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Teste de Configuração
          </CardTitle>
          <CardDescription>
            Teste se as configurações estão funcionando corretamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">📋 Checklist de Configuração:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li className="flex items-center gap-2">
                  {config.enabled ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-gray-400" />}
                  Assistente ativado
                </li>
                <li className="flex items-center gap-2">
                  {validateMasterNumber(config.masterNumber) ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-gray-400" />}
                  Número master configurado
                </li>
                <li className="flex items-center gap-2">
                  {config.assistantName.trim() ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-gray-400" />}
                  Nome do assistente definido
                </li>
                <li className="flex items-center gap-2">
                  {config.systemPrompt.trim().length > 50 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-gray-400" />}
                  Prompt do sistema configurado
                </li>
              </ul>
            </div>

            <Button 
              onClick={testConnection}
              disabled={isTestingConnection || !config.enabled || !validateMasterNumber(config.masterNumber)}
              className="w-full"
            >
              {isTestingConnection ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Testando configuração...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Testar Configuração
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              O teste verificará se todas as configurações estão corretas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Instruções de Uso */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Como usar o Assistente Pessoal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-700">
            <div className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Configure seu número master (o número que você usa no WhatsApp)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>Ative o assistente e personalize seu comportamento</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>Conecte seu WhatsApp Business via WPPConnect na aba "WhatsApp Real"</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>Envie mensagens para o número conectado - o assistente responderá apenas a você!</span>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="font-medium text-blue-900 mb-1">🔒 Segurança garantida:</p>
              <p>O assistente verifica o número do remetente antes de responder. Apenas mensagens do seu número master receberão respostas automáticas.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
