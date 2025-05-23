
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Database, Bot, MessageSquare, Users } from 'lucide-react';

// Importações condicionais com logs
let FirebaseConfig, WhatsAppConfig, OpenAIConfig, AssistantsConfig, ClientConfig;

try {
  console.log('SettingsPage - Tentando importar FirebaseConfig...');
  const firebaseModule = await import('@/components/settings/FirebaseConfig');
  FirebaseConfig = firebaseModule.FirebaseConfig;
  console.log('SettingsPage - FirebaseConfig importado com sucesso');
} catch (error) {
  console.error('SettingsPage - Erro ao importar FirebaseConfig:', error);
  FirebaseConfig = () => <div>Erro ao carregar FirebaseConfig</div>;
}

try {
  console.log('SettingsPage - Tentando importar WhatsAppConfig...');
  const whatsappModule = await import('@/components/settings/WhatsAppConfig');
  WhatsAppConfig = whatsappModule.WhatsAppConfig;
  console.log('SettingsPage - WhatsAppConfig importado com sucesso');
} catch (error) {
  console.error('SettingsPage - Erro ao importar WhatsAppConfig:', error);
  WhatsAppConfig = () => <div>Erro ao carregar WhatsAppConfig</div>;
}

try {
  console.log('SettingsPage - Tentando importar OpenAIConfig...');
  const openaiModule = await import('@/components/settings/OpenAIConfig');
  OpenAIConfig = openaiModule.OpenAIConfig;
  console.log('SettingsPage - OpenAIConfig importado com sucesso');
} catch (error) {
  console.error('SettingsPage - Erro ao importar OpenAIConfig:', error);
  OpenAIConfig = () => <div>Erro ao carregar OpenAIConfig</div>;
}

try {
  console.log('SettingsPage - Tentando importar AssistantsConfig...');
  const assistantsModule = await import('@/components/settings/AssistantsConfig');
  AssistantsConfig = assistantsModule.AssistantsConfig;
  console.log('SettingsPage - AssistantsConfig importado com sucesso');
} catch (error) {
  console.error('SettingsPage - Erro ao importar AssistantsConfig:', error);
  AssistantsConfig = () => <div>Erro ao carregar AssistantsConfig</div>;
}

try {
  console.log('SettingsPage - Tentando importar ClientConfig...');
  const clientModule = await import('@/components/settings/ClientConfig');
  ClientConfig = clientModule.ClientConfig;
  console.log('SettingsPage - ClientConfig importado com sucesso');
} catch (error) {
  console.error('SettingsPage - Erro ao importar ClientConfig:', error);
  ClientConfig = () => <div>Erro ao carregar ClientConfig</div>;
}

export function SettingsPage() {
  console.log('SettingsPage - Componente sendo renderizado');
  
  try {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Configurações do Sistema</h1>
          <p className="text-slate-600">Configure todas as integrações e assistentes da plataforma</p>
        </div>

        <Tabs defaultValue="whatsapp" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="firebase" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Firebase
            </TabsTrigger>
            <TabsTrigger value="openai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              OpenAI
            </TabsTrigger>
            <TabsTrigger value="assistants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assistentes
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Clientes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="whatsapp">
            {WhatsAppConfig ? <WhatsAppConfig /> : <div>Carregando WhatsApp Config...</div>}
          </TabsContent>

          <TabsContent value="firebase">
            {FirebaseConfig ? <FirebaseConfig /> : <div>Carregando Firebase Config...</div>}
          </TabsContent>

          <TabsContent value="openai">
            {OpenAIConfig ? <OpenAIConfig /> : <div>Carregando OpenAI Config...</div>}
          </TabsContent>

          <TabsContent value="assistants">
            {AssistantsConfig ? <AssistantsConfig /> : <div>Carregando Assistants Config...</div>}
          </TabsContent>

          <TabsContent value="clients">
            {ClientConfig ? <ClientConfig /> : <div>Carregando Client Config...</div>}
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error('SettingsPage - Erro na renderização:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro na Página de Configurações</h1>
          <p className="text-gray-600">Erro: {error.message}</p>
          <p className="text-gray-500 mt-2">Verifique o console para mais detalhes</p>
        </div>
      </div>
    );
  }
}
