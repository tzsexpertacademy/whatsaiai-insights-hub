
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface WebhookConfigurationProps {
  webhooks: {
    qrWebhook: string;
    statusWebhook: string;
    sendMessageWebhook: string;
    autoReplyWebhook: string;
  };
  updateWebhooks: (field: string, value: string) => void;
}

export function WebhookConfiguration({ webhooks, updateWebhooks }: WebhookConfigurationProps) {
  const { toast } = useToast();

  const handleWebhookUpdate = (field: string, value: string) => {
    updateWebhooks(field, value);
    toast({
      title: "Webhook atualizado",
      description: `${field} foi salvo localmente`
    });
  };

  const isWebhookConfigured = webhooks.qrWebhook && webhooks.statusWebhook;

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          Configuração Make.com
        </CardTitle>
        <CardDescription>
          Configure os webhooks do Make.com para conectar WhatsApp real
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="qr-webhook">Webhook QR Code *</Label>
          <Input
            id="qr-webhook"
            placeholder="https://hook.eu1.make.com/xxxxx"
            value={webhooks.qrWebhook}
            onChange={(e) => handleWebhookUpdate('qrWebhook', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status-webhook">Webhook Status *</Label>
          <Input
            id="status-webhook"
            placeholder="https://hook.eu1.make.com/xxxxx"
            value={webhooks.statusWebhook}
            onChange={(e) => handleWebhookUpdate('statusWebhook', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="send-webhook">Webhook Envio (Opcional)</Label>
          <Input
            id="send-webhook"
            placeholder="https://hook.eu1.make.com/xxxxx"
            value={webhooks.sendMessageWebhook}
            onChange={(e) => handleWebhookUpdate('sendMessageWebhook', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="autoreply-webhook">Webhook Auto-resposta (Opcional)</Label>
          <Input
            id="autoreply-webhook"
            placeholder="https://hook.eu1.make.com/xxxxx"
            value={webhooks.autoReplyWebhook}
            onChange={(e) => handleWebhookUpdate('autoReplyWebhook', e.target.value)}
          />
        </div>
        
        {!isWebhookConfigured && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-700">
              ⚠️ Configure pelo menos os webhooks QR Code e Status para continuar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
