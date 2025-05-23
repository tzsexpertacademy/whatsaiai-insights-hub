
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Database, Bot, MessageSquare, Users } from 'lucide-react';
import { FirebaseConfig } from '@/components/settings/FirebaseConfig';
import { WhatsAppConfig } from '@/components/settings/WhatsAppConfig';
import { OpenAIConfig } from '@/components/settings/OpenAIConfig';
import { AssistantsConfig } from '@/components/settings/AssistantsConfig';
import { ClientConfig } from '@/components/settings/ClientConfig';

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
            <WhatsAppConfig />
          </TabsContent>

          <TabsContent value="firebase">
            <FirebaseConfig />
          </TabsContent>

          <TabsContent value="openai">
            <OpenAIConfig />
          </TabsContent>

          <TabsContent value="assistants">
            <AssistantsConfig />
          </TabsContent>

          <TabsContent value="clients">
            <ClientConfig />
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
