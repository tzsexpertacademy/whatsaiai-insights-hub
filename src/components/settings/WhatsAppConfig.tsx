
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Settings, Zap, Globe, Server, Wifi, Brain } from 'lucide-react';
import { WhatsAppPlatformConfig } from './WhatsAppPlatformConfig';
import { WhatsAppConnectionStatus } from './WhatsAppConnectionStatus';
import { MakeConfig } from './MakeConfig';
import { GreenAPISettings } from './GreenAPISettings';
import { WPPConnectConfig } from './whatsapp/WPPConnectConfig';
import { RealWhatsAppMirror } from '../whatsapp/RealWhatsAppMirror';
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

      {/* Novo Card do API Hub */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-green-600" />
            WhatsApp API Hub
            <Badge className="bg-green-100 text-green-800">NOVO</Badge>
          </CardTitle>
          <CardDescription>
            Solução estilo Swagger - Escaneie uma vez, funciona em qualquer sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  QR Code Universal para todas as integrações
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  API Explorer com testes em tempo real
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Configuração automática de webhooks
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Monitoramento e logs em tempo real
                </li>
              </ul>
            </div>
            <Button asChild size="lg">
              <a href="/whatsapp-api-hub">
                <Zap className="h-4 w-4 mr-2" />
                Acessar API Hub
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="real" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="real" className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            WhatsApp Real
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Assistente Pessoal
          </TabsTrigger>
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

        <TabsContent value="real">
          <RealWhatsAppMirror />
        </TabsContent>

        <TabsContent value="assistant">
          <PersonalAssistantConfig />
        </TabsContent>

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
