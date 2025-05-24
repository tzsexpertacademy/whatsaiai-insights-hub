
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Settings, Zap } from 'lucide-react';
import { CommercialWhatsAppPlatformConfig } from './CommercialWhatsAppPlatformConfig';
import { CommercialWhatsAppConnectionStatus } from './CommercialWhatsAppConnectionStatus';
import { CommercialMakeConfig } from './CommercialMakeConfig';

export function CommercialWhatsAppConfig() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Configuração do WhatsApp Comercial</h2>
        <p className="text-slate-600">
          Configure e gerencie suas integrações do WhatsApp Business para vendas
        </p>
      </div>

      {/* Status da Conexão Comercial */}
      <CommercialWhatsAppConnectionStatus />

      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Plataforma
          </TabsTrigger>
          <TabsTrigger value="make" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Make.com
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform">
          <CommercialWhatsAppPlatformConfig />
        </TabsContent>

        <TabsContent value="make">
          <CommercialMakeConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
