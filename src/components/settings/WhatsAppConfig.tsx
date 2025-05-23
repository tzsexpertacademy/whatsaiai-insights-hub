
import React from 'react';
import { ConnectionStatus } from './ConnectionStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from 'lucide-react';
import { OpenAIConfig } from './OpenAIConfig';

export function WhatsAppConfig() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <ConnectionStatus />
      </div>
      
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Processamento de Conversas com OpenAI
          </CardTitle>
          <CardDescription>
            Entenda como funciona a integração simplificada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">
              Este sistema utiliza a API da OpenAI para processar e analisar as conversas do WhatsApp,
              gerando insights e respostas automáticas inteligentes.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Como funciona:</h4>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>As conversas do WhatsApp são importadas para o sistema</li>
                <li>Os dados são armazenados no Firebase do cliente</li>
                <li>A OpenAI processa as mensagens e gera análises</li>
                <li>O sistema pode produzir respostas automáticas baseadas na análise da IA</li>
                <li>Insights e métricas são exibidos no dashboard</li>
              </ol>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Benefícios:</h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Análise avançada de sentimentos nas conversas</li>
                <li>Detecção automática de tópicos importantes</li>
                <li>Sugestões de resposta personalizadas</li>
                <li>Insights sobre o comportamento dos clientes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <OpenAIConfig />
    </div>
  );
}
