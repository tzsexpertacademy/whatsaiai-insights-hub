import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Brain, MessageSquare, Settings, Loader2, TestTube, Send, CheckCircle, XCircle, RefreshCw, Webhook } from 'lucide-react';
import { usePersonalAssistant } from "@/hooks/usePersonalAssistant";
import { useRealWhatsAppConnection } from "@/hooks/useRealWhatsAppConnection";
import { AssistantSelector } from "@/components/AssistantSelector";
import { useState, useEffect } from 'react';

export function PersonalAssistantConfig() {
  const { config, updateConfig, recentMessages } = usePersonalAssistant();
  const { processWebhookMessage, sendMessage, wppConfig, configureWebhookOnWPP } = useRealWhatsAppConnection();
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [isTestingResponse, setIsTestingResponse] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isConfiguringWebhook, setIsConfiguringWebhook] = useState(false);
  const [testMessage, setTestMessage] = useState('Olá, você está funcionando?');
  const [lastMessageCheck, setLastMessageCheck] = useState<Date>(new Date());
  const [testResults, setTestResults] = useState<{
    webhookTest?: { success: boolean; message: string };
    responseTest?: { success: boolean; message: string };
    monitoringTest?: { success: boolean; message: string };
    webhookConfig?: { success: boolean; message: string };
  }>({});

  // Função para configurar webhook automático
  const handleConfigureWebhook = async () => {
    console.log('🔧 [CONFIG] Configurando webhook automático...');
    setIsConfiguringWebhook(true);
    setTestResults(prev => ({ ...prev, webhookConfig: undefined }));

    try {
      const success = await configureWebhookOnWPP();
      
      if (success) {
        setTestResults(prev => ({
          ...prev,
          webhookConfig: {
            success: true,
            message: 'Webhook configurado! Agora o WPPConnect enviará mensagens automaticamente para o assistente.'
          }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          webhookConfig: {
            success: false,
            message: 'Falha ao configurar webhook automático. Tente configurar manualmente via Swagger.'
          }
        }));
      }
    } catch (error) {
      console.error('❌ [CONFIG] Erro ao configurar webhook:', error);
      setTestResults(prev => ({
        ...prev,
        webhookConfig: {
          success: false,
          message: `Erro ao configurar webhook: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        }
      }));
    } finally {
      setIsConfiguringWebhook(false);
    }
  };

  // Função para monitorar mensagens em tempo real
  const startMessageMonitoring = async () => {
    console.log('🔄 [MONITOR] Iniciando monitoramento de mensagens...');
    setIsMonitoring(true);
    setTestResults(prev => ({ ...prev, monitoringTest: undefined }));

    const checkInterval = setInterval(async () => {
      try {
        console.log('🔍 [MONITOR] Verificando novas mensagens...');
        
        // Simular verificação de mensagens do WPPConnect
        const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/get-messages/${config.masterNumber}?count=5`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${wppConfig.token}`
          }
        });

        if (response.ok) {
          const messages = await response.json();
          console.log('📨 [MONITOR] Mensagens encontradas:', messages);
          
          // Verificar se há mensagens novas desde a última verificação
          const newMessages = Array.isArray(messages) ? messages.filter((msg: any) => {
            const msgDate = new Date(msg.timestamp * 1000 || msg.timestamp);
            return msgDate > lastMessageCheck && !msg.fromMe;
          }) : [];

          if (newMessages.length > 0) {
            console.log('🆕 [MONITOR] Novas mensagens encontradas:', newMessages.length);
            
            for (const message of newMessages) {
              console.log('📨 [MONITOR] Processando nova mensagem:', message);
              
              // Simular webhook para cada mensagem nova
              const webhookData = {
                message: {
                  from: message.from || config.masterNumber,
                  to: message.to || wppConfig.sessionName,
                  body: message.body || message.text || 'Mensagem sem texto',
                  timestamp: message.timestamp
                }
              };
              
              await processWebhookMessage(webhookData);
            }
            
            setLastMessageCheck(new Date());
            setTestResults(prev => ({
              ...prev,
              monitoringTest: {
                success: true,
                message: `${newMessages.length} mensagem(ns) processada(s) automaticamente!`
              }
            }));
          }
        }
      } catch (error) {
        console.error('❌ [MONITOR] Erro no monitoramento:', error);
        setTestResults(prev => ({
          ...prev,
          monitoringTest: {
            success: false,
            message: `Erro no monitoramento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }
        }));
      }
    }, 10000); // Verificar a cada 10 segundos

    // Parar monitoramento após 5 minutos
    setTimeout(() => {
      clearInterval(checkInterval);
      setIsMonitoring(false);
      console.log('⏹️ [MONITOR] Monitoramento finalizado');
    }, 300000);
  };

  const handleTestWebhookProcessing = async () => {
    console.log('🧪 [TEST] Iniciando teste de processamento de webhook...');
    setIsTestingWebhook(true);
    setTestResults(prev => ({ ...prev, webhookTest: undefined }));

    try {
      // Simular webhook de mensagem recebida
      const mockWebhookData = {
        message: {
          from: config.masterNumber,
          to: config.masterNumber, // Simular que a mensagem chegou no nosso número
          body: testMessage,
          text: { body: testMessage },
          timestamp: Date.now()
        }
      };

      console.log('🧪 [TEST] Dados do webhook simulado:', mockWebhookData);

      // Processar com o webhook
      await processWebhookMessage(mockWebhookData);

      setTestResults(prev => ({
        ...prev,
        webhookTest: {
          success: true,
          message: 'Webhook processado com sucesso! Verifique se a resposta foi enviada.'
        }
      }));

      console.log('✅ [TEST] Teste de webhook concluído com sucesso');

    } catch (error) {
      console.error('❌ [TEST] Erro no teste de webhook:', error);
      setTestResults(prev => ({
        ...prev,
        webhookTest: {
          success: false,
          message: `Erro no processamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        }
      }));
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleTestDirectResponse = async () => {
    console.log('🧪 [TEST] Iniciando teste de resposta direta...');
    setIsTestingResponse(true);
    setTestResults(prev => ({ ...prev, responseTest: undefined }));

    try {
      if (!config.masterNumber) {
        throw new Error('Número master não configurado');
      }

      const success = await sendMessage(config.masterNumber, `🤖 Teste do assistente: ${testMessage}`);

      if (success) {
        setTestResults(prev => ({
          ...prev,
          responseTest: {
            success: true,
            message: 'Mensagem de teste enviada com sucesso! Verifique seu WhatsApp.'
          }
        }));
        console.log('✅ [TEST] Mensagem de teste enviada com sucesso');
      } else {
        throw new Error('Falha ao enviar mensagem');
      }

    } catch (error) {
      console.error('❌ [TEST] Erro no teste de resposta:', error);
      setTestResults(prev => ({
        ...prev,
        responseTest: {
          success: false,
          message: `Erro no envio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        }
      }));
    } finally {
      setIsTestingResponse(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Assistente Pessoal WhatsApp
          </CardTitle>
          <CardDescription>
            Configure um assistente IA que responde automaticamente apenas ao seu número master
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status e Ativação */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${config.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
              <div>
                <p className="font-medium">
                  {config.enabled ? 'Assistente Ativo' : 'Assistente Inativo'}
                </p>
                <p className="text-sm text-gray-600">
                  {config.enabled ? 'Respondendo automaticamente' : 'Respostas automáticas desativadas'}
                </p>
              </div>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => updateConfig({ enabled })}
            />
          </div>

          {/* Configuração do Número Master */}
          <div className="space-y-2">
            <Label htmlFor="master-number">Número Master (seu WhatsApp) *</Label>
            <Input
              id="master-number"
              placeholder="Ex: 5511999999999"
              value={config.masterNumber}
              onChange={(e) => updateConfig({ masterNumber: e.target.value })}
              className="font-mono"
            />
            <p className="text-sm text-gray-600">
              💡 Use apenas números (com código do país). Exemplo: 5511999999999
            </p>
          </div>

          {/* Seleção do Assistente */}
          <div className="space-y-2">
            <Label>Assistente Selecionado</Label>
            <AssistantSelector
              selectedAssistant={config.selectedAssistantId}
              onAssistantChange={(assistantId) => updateConfig({ selectedAssistantId: assistantId })}
            />
          </div>

          {/* Delay de Resposta */}
          <div className="space-y-2">
            <Label htmlFor="response-delay">Delay de Resposta (segundos)</Label>
            <Select
              value={config.responseDelay.toString()}
              onValueChange={(value) => updateConfig({ responseDelay: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 segundo (instantâneo)</SelectItem>
                <SelectItem value="2">2 segundos (rápido)</SelectItem>
                <SelectItem value="3">3 segundos (natural)</SelectItem>
                <SelectItem value="5">5 segundos (pensativo)</SelectItem>
                <SelectItem value="10">10 segundos (reflexivo)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              Tempo que o assistente aguarda antes de responder (simula tempo de digitação)
            </p>
          </div>

          <Separator />

          {/* Configuração do Webhook Automático */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Configuração Automática</h3>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">🔧 Webhook Automático</h4>
              <p className="text-sm text-blue-700 mb-3">
                Para que o assistente responda automaticamente, é preciso configurar o webhook no WPPConnect. 
                Clique no botão abaixo para configurar automaticamente.
              </p>
              
              <Button
                onClick={handleConfigureWebhook}
                disabled={isConfiguringWebhook}
                className="w-full mb-3"
                variant="default"
              >
                {isConfiguringWebhook ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Configurando Webhook...
                  </>
                ) : (
                  <>
                    <Webhook className="h-4 w-4 mr-2" />
                    Configurar Webhook Automático
                  </>
                )}
              </Button>

              {testResults.webhookConfig && (
                <div className={`p-3 rounded-lg border text-sm ${
                  testResults.webhookConfig.success 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {testResults.webhookConfig.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {testResults.webhookConfig.success ? 'Webhook Configurado!' : 'Erro na Configuração'}
                    </span>
                  </div>
                  <p>{testResults.webhookConfig.message}</p>
                </div>
              )}
              
              {/* Instruções manuais se automático falhar */}
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="font-medium text-yellow-900 mb-2">📖 Configuração Manual (se automático falhar):</h5>
                <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                  <li>Acesse: <code className="bg-yellow-100 px-1 rounded">http://localhost:21465/api-docs</code></li>
                  <li>Encontre o endpoint <strong>set-webhook</strong> da sua sessão</li>
                  <li>Configure: <code className="bg-yellow-100 px-1 rounded">webhook: sua-url-supabase/functions/v1/whatsapp-autoreply</code></li>
                  <li>Events: <code className="bg-yellow-100 px-1 rounded">["message"]</code></li>
                </ol>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção de Testes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Testes de Funcionamento</h3>
            </div>

            {/* Mensagem de Teste */}
            <div className="space-y-2">
              <Label htmlFor="test-message">Mensagem de Teste</Label>
              <Input
                id="test-message"
                placeholder="Digite uma mensagem para testar..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>

            {/* Botões de Teste */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Teste de Processamento de Webhook */}
              <div className="space-y-3">
                <Button
                  onClick={handleTestWebhookProcessing}
                  disabled={isTestingWebhook || !config.masterNumber || !testMessage.trim()}
                  className="w-full"
                  variant="outline"
                >
                  {isTestingWebhook ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testando Webhook...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Testar Processamento
                    </>
                  )}
                </Button>
                
                {testResults.webhookTest && (
                  <div className={`p-3 rounded-lg border text-sm ${
                    testResults.webhookTest.success 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {testResults.webhookTest.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {testResults.webhookTest.success ? 'Sucesso' : 'Erro'}
                      </span>
                    </div>
                    <p>{testResults.webhookTest.message}</p>
                  </div>
                )}
              </div>

              {/* Teste de Envio Direto */}
              <div className="space-y-3">
                <Button
                  onClick={handleTestDirectResponse}
                  disabled={isTestingResponse || !config.masterNumber || !testMessage.trim()}
                  className="w-full"
                >
                  {isTestingResponse ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando Teste...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Testar Envio Direto
                    </>
                  )}
                </Button>

                {testResults.responseTest && (
                  <div className={`p-3 rounded-lg border text-sm ${
                    testResults.responseTest.success 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {testResults.responseTest.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {testResults.responseTest.success ? 'Sucesso' : 'Erro'}
                      </span>
                    </div>
                    <p>{testResults.responseTest.message}</p>
                  </div>
                )}
              </div>

              {/* Monitoramento de Mensagens */}
              <div className="space-y-3">
                <Button
                  onClick={startMessageMonitoring}
                  disabled={isMonitoring || !config.masterNumber}
                  className="w-full"
                  variant="secondary"
                >
                  {isMonitoring ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Monitorando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Monitorar Mensagens
                    </>
                  )}
                </Button>

                {testResults.monitoringTest && (
                  <div className={`p-3 rounded-lg border text-sm ${
                    testResults.monitoringTest.success 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {testResults.monitoringTest.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {testResults.monitoringTest.success ? 'Monitorando' : 'Erro'}
                      </span>
                    </div>
                    <p>{testResults.monitoringTest.message}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">💡 Como usar os recursos:</h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li><strong>Configurar Webhook Automático:</strong> Configure uma vez para receber mensagens automaticamente</li>
                <li><strong>Testar Processamento:</strong> Simula uma mensagem chegando via webhook e verifica se o assistente processa corretamente</li>
                <li><strong>Testar Envio Direto:</strong> Envia uma mensagem de teste diretamente para seu WhatsApp</li>
                <li><strong>Monitorar Mensagens:</strong> Verifica automaticamente por 5 minutos se há mensagens novas e processa elas</li>
                <li>Use "Configurar Webhook" primeiro, depois teste o funcionamento com os outros botões</li>
              </ul>
            </div>
          </div>

          <Separator />

          {/* Mensagens Recentes */}
          {recentMessages.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Mensagens Recentes
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {recentMessages.slice(-5).map((msg, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString('pt-BR')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        msg.isFromMaster ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {msg.isFromMaster ? 'Você' : 'Sistema'}
                      </span>
                    </div>
                    <p className="text-gray-800">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instruções */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-2">📋 Instruções de uso:</h4>
            <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
              <li>Configure seu número master (apenas números, com código do país)</li>
              <li>Selecione um assistente da lista</li>
              <li>Ative o assistente</li>
              <li><strong>IMPORTANTE:</strong> Clique em "Configurar Webhook Automático" para receber mensagens automaticamente</li>
              <li>Use os botões de teste para verificar se está funcionando</li>
              <li>Agora envie mensagens do seu WhatsApp - o assistente deve responder automaticamente!</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
