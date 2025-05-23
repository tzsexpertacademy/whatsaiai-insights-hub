
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface BasicConnectionConfigProps {
  makeConfig: {
    qrWebhook: string;
    statusWebhook: string;
    sendMessageWebhook: string;
    disconnectWebhook: string;
  };
  updateMakeConfig: (config: any) => void;
}

export function BasicConnectionConfig({ makeConfig, updateMakeConfig }: BasicConnectionConfigProps) {
  const { toast } = useToast();

  const testWebhook = async (webhookUrl: string, webhookName: string) => {
    if (!webhookUrl) {
      toast({
        title: "URL necessária",
        description: `Configure a URL do webhook ${webhookName} primeiro`,
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test',
          timestamp: new Date().toISOString(),
          source: 'lovable_frontend'
        })
      });

      if (response.ok) {
        toast({
          title: "Webhook funcionando",
          description: `${webhookName} respondeu corretamente`,
        });
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "Erro no webhook",
        description: `${webhookName} não está respondendo`,
        variant: "destructive"
      });
    }
  };

  const isBasicConfigured = [
    makeConfig.qrWebhook,
    makeConfig.statusWebhook,
    makeConfig.sendMessageWebhook,
    makeConfig.disconnectWebhook
  ].every(url => url.length > 0);

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          Configuração Make.com - Conexão Básica
        </CardTitle>
        <CardDescription>
          Configure os webhooks básicos para conexão com WhatsApp Business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status da configuração básica */}
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          isBasicConfigured ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
        }`}>
          {isBasicConfigured ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="font-medium">
            {isBasicConfigured ? 'Conexão básica configurada' : 'Configure a conexão básica'}
          </span>
        </div>

        {/* Webhook para gerar QR Code */}
        <div className="space-y-2">
          <Label htmlFor="qrWebhook">Webhook - QR Code</Label>
          <div className="flex gap-2">
            <Input
              id="qrWebhook"
              placeholder="https://hook.make.com/..."
              value={makeConfig.qrWebhook}
              onChange={(e) => updateMakeConfig({ qrWebhook: e.target.value })}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testWebhook(makeConfig.qrWebhook, 'QR Code')}
            >
              Testar
            </Button>
          </div>
          <p className="text-xs text-gray-500">Gera QR Code para fazer login no WhatsApp Business</p>
        </div>

        {/* Webhook para verificar status */}
        <div className="space-y-2">
          <Label htmlFor="statusWebhook">Webhook - Status</Label>
          <div className="flex gap-2">
            <Input
              id="statusWebhook"
              placeholder="https://hook.make.com/..."
              value={makeConfig.statusWebhook}
              onChange={(e) => updateMakeConfig({ statusWebhook: e.target.value })}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testWebhook(makeConfig.statusWebhook, 'Status')}
            >
              Testar
            </Button>
          </div>
          <p className="text-xs text-gray-500">Verifica se o WhatsApp Business está conectado</p>
        </div>

        {/* Webhook para enviar mensagens */}
        <div className="space-y-2">
          <Label htmlFor="sendWebhook">Webhook - Enviar</Label>
          <div className="flex gap-2">
            <Input
              id="sendWebhook"
              placeholder="https://hook.make.com/..."
              value={makeConfig.sendMessageWebhook}
              onChange={(e) => updateMakeConfig({ sendMessageWebhook: e.target.value })}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testWebhook(makeConfig.sendMessageWebhook, 'Envio')}
            >
              Testar
            </Button>
          </div>
          <p className="text-xs text-gray-500">Envia mensagens através do WhatsApp Business</p>
        </div>

        {/* Webhook para desconectar */}
        <div className="space-y-2">
          <Label htmlFor="disconnectWebhook">Webhook - Desconectar</Label>
          <div className="flex gap-2">
            <Input
              id="disconnectWebhook"
              placeholder="https://hook.make.com/..."
              value={makeConfig.disconnectWebhook}
              onChange={(e) => updateMakeConfig({ disconnectWebhook: e.target.value })}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testWebhook(makeConfig.disconnectWebhook, 'Desconexão')}
            >
              Testar
            </Button>
          </div>
          <p className="text-xs text-gray-500">Encerra a sessão do WhatsApp Business</p>
        </div>
      </CardContent>
    </Card>
  );
}
