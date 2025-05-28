
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Database, Bot, MessageSquare, Users, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { WhatsAppConfig } from '@/components/settings/WhatsAppConfig';
import { FirebaseConfig } from '@/components/settings/FirebaseConfig';
import { OpenAIConfig } from '@/components/settings/OpenAIConfig';
import { AssistantsConfig } from '@/components/settings/AssistantsConfig';
import { ClientConfig } from '@/components/settings/ClientConfig';
import { AnalysisSystemStatus } from '@/components/AnalysisSystemStatus';

export function SettingsPage() {
  console.log('SettingsPage - Componente sendo renderizado');
  
  const { user, isAuthenticated } = useAuth();
  
  console.log('SettingsPage - Estado da autenticação:', {
    isAuthenticated,
    user: user ? { id: user.id, email: user.email } : null
  });

  if (!isAuthenticated) {
    console.log('SettingsPage - Usuário não autenticado');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white/70 backdrop-blur-sm border border-white/50 rounded-lg p-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
            <p className="text-gray-600">
              Você precisa estar logado para acessar as configurações.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Configurações do Sistema</h1>
        <p className="text-slate-600">Configure todas as integrações e assistentes da plataforma</p>
      </div>

      {/* Status do Sistema Blindado */}
      <AnalysisSystemStatus />

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
}
