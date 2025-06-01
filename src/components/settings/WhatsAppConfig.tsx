
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Settings, Zap, Globe, Server } from 'lucide-react';
import { WhatsAppPlatformConfig } from './WhatsAppPlatformConfig';
import { WhatsAppConnectionStatus } from './WhatsAppConnectionStatus';
import { MakeConfig } from './MakeConfig';
import { GreenAPISettings } from './GreenAPISettings';
import { WPPConnectConfig } from './whatsapp/WPPConnectConfig';

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wppconnect" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            WPPConnect
          </TabsTrigger>
          <TabsTrigger value="greenapi" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            GREEN-API
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Outras Plataformas
          </TabsTrigger>
          <TabsTrigger value="make" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Make.com (Legado)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wppconnect">
          <WPPConnectConfig />
        </TabsContent>

        <TabsContent value="greenapi">
          <GreenAPISettings />
        </TabsContent>

        <TabsContent value="platform">
          <WhatsAppPlatformConfig />
        </TabsContent>

        <TabsContent value="make">
          <MakeConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
