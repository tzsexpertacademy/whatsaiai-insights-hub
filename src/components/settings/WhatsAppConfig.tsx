
import React from 'react';
import { ConnectionStatus } from './ConnectionStatus';
import { QRCodeGenerator } from './QRCodeGenerator';
import { MakeConfig } from './MakeConfig';
import { IntegrationGuide } from './IntegrationGuide';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from 'lucide-react';

export function WhatsAppConfig() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConnectionStatus />
        <QRCodeGenerator />
      </div>
      
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Espelhamento do WhatsApp Web
          </CardTitle>
          <CardDescription>
            Entenda como funciona a integração simplificada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">
              Este sistema utiliza o Make.com como intermediário para espelhar o WhatsApp Web em seu dashboard,
              sem necessidade da API oficial do WhatsApp Business.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Como funciona:</h4>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>O Make.com controla uma instância do WhatsApp Web através de automação web</li>
                <li>Você escaneará o QR Code para autenticar seu WhatsApp no navegador do Make.com</li>
                <li>As conversas são espelhadas para o seu dashboard</li>
                <li>As mensagens são armazenadas no Firebase do cliente</li>
                <li>Análises e respostas automáticas são processadas via OpenAI</li>
              </ol>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Importante:</h4>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Esta integração NÃO usa a API oficial do WhatsApp Business</li>
                <li>O WhatsApp Web fica ativo no servidor do Make.com</li>
                <li>Para uso em produção, recomenda-se dedicar um número de telefone exclusivo</li>
                <li>É necessário que o cenário do Make.com permaneça ativo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <MakeConfig />
      <IntegrationGuide />
    </div>
  );
}
