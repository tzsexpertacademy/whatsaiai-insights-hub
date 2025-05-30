
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Globe, Building2, Zap } from 'lucide-react';
import { WhatsAppWebConfig } from './whatsapp/WhatsAppWebConfig';
import { RealQRCodeGenerator } from './RealQRCodeGenerator';
import { AtendechatIntegration } from './AtendechatIntegration';
import { WhatsAppWebMakeSetup } from './make/WhatsAppWebMakeSetup';

export function WhatsAppPlatformConfig() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Escolha sua Plataforma WhatsApp</h3>
        <p className="text-slate-600">
          Selecione a melhor opção para conectar seu WhatsApp Business
        </p>
      </div>

      <Tabs defaultValue="make-simple" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="make-simple" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Make.com Simples</span>
            <span className="sm:hidden">Make</span>
          </TabsTrigger>
          <TabsTrigger value="web" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp Web</span>
            <span className="sm:hidden">Web</span>
          </TabsTrigger>
          <TabsTrigger value="real" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Make.com Real</span>
            <span className="sm:hidden">Real</span>
          </TabsTrigger>
          <TabsTrigger value="atendechat" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Atendechat</span>
            <span className="sm:hidden">API</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="make-simple">
          <WhatsAppWebMakeSetup />
        </TabsContent>

        <TabsContent value="web">
          <WhatsAppWebConfig 
            webConfig={{
              sessionName: localStorage.getItem('whatsapp_session_name') || '',
              autoReply: localStorage.getItem('whatsapp_auto_reply') === 'true',
              welcomeMessage: localStorage.getItem('whatsapp_welcome_message') || 'Olá! Como posso te ajudar?'
            }}
            updateWebConfig={(config) => {
              if (config.sessionName !== undefined) {
                localStorage.setItem('whatsapp_session_name', config.sessionName);
              }
              if (config.autoReply !== undefined) {
                localStorage.setItem('whatsapp_auto_reply', String(config.autoReply));
              }
              if (config.welcomeMessage !== undefined) {
                localStorage.setItem('whatsapp_welcome_message', config.welcomeMessage);
              }
            }}
          />
        </TabsContent>

        <TabsContent value="real">
          <RealQRCodeGenerator />
        </TabsContent>

        <TabsContent value="atendechat">
          <AtendechatIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
