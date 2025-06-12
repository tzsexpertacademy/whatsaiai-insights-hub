
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Brain } from 'lucide-react';
import { WhatsAppConnectionStatus } from './WhatsAppConnectionStatus';
import { WPPConnectConfig } from './whatsapp/WPPConnectConfig';
import { PersonalAssistantConfig } from './whatsapp/PersonalAssistantConfig';

export function WhatsAppConfig() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Configuração do WhatsApp</h2>
        <p className="text-slate-600">
          Configure e gerencie suas integrações do WhatsApp Business
        </p>
      </div>

      {/* Status da Conexão */}
      <WhatsAppConnectionStatus />

      <Tabs defaultValue="wppconnect" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wppconnect" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            WPPConnect
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Assistente Pessoal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wppconnect">
          <WPPConnectConfig />
        </TabsContent>

        <TabsContent value="assistant">
          <PersonalAssistantConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
