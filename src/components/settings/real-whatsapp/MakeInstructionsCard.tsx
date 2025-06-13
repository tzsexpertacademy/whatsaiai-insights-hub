
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MakeInstructionsCard() {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle>Configuração Make.com</CardTitle>
        <CardDescription>
          Como criar os webhooks no Make.com para WhatsApp real
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">📋 Passo a passo:</h4>
            <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
              <li>Acesse <strong>make.com</strong> e crie uma conta</li>
              <li>Crie um novo cenário</li>
              <li>Adicione um módulo <strong>"Webhook"</strong> → <strong>"Custom webhook"</strong></li>
              <li>Copie a URL do webhook e cole no campo "Webhook QR Code"</li>
              <li>Adicione módulos do WhatsApp Business API</li>
              <li>Configure os outros webhooks conforme necessário</li>
              <li>Ative o cenário no Make.com</li>
            </ol>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-2">⚡ Dica importante:</h4>
            <p className="text-sm text-amber-700">
              Você precisará de uma conta WhatsApp Business API válida. 
              O Make.com pode conectar com provedores como Twilio, 360Dialog, ou outros.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
