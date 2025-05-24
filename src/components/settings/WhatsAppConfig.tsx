import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Settings, Smartphone, Globe, Zap } from 'lucide-react';
import { WhatsAppPlatformConfig } from './WhatsAppPlatformConfig';
import { WhatsAppConnectionStatus } from './WhatsAppConnectionStatus';
import { AtendechatIntegration } from './AtendechatIntegration';
import { MakeConfig } from './MakeConfig';
import { useClientConfig } from '@/contexts/ClientConfigContext';

export function WhatsAppConfig() {
  const { config } = useClientConfig();

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

      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Plataforma
          </TabsTrigger>
          <TabsTrigger value="atendechat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Atendechat
          </TabsTrigger>
          <TabsTrigger value="make" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Make.com
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform">
          <WhatsAppPlatformConfig />
        </TabsContent>

        <TabsContent value="atendechat">
          <AtendechatIntegration />
        </TabsContent>

        <TabsContent value="make">
          <MakeConfig />
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configurações adicionais do WhatsApp podem ser adicionadas aqui */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
