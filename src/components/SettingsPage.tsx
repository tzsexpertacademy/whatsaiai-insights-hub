
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
import { PageLayout } from '@/components/layout/PageLayout';

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
      <PageLayout
        title="Acesso Negado"
        showBackButton={true}
      >
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="max-w-md w-full bg-white/70 backdrop-blur-sm border border-white/50 rounded-lg p-6 sm:p-8 text-center">
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Você precisa estar logado para acessar as configurações.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout
      title="Configurações do Sistema"
      description="Configure todas as integrações e assistentes da plataforma"
      showBackButton={true}
    >
      {/* Status do Sistema Blindado */}
      <AnalysisSystemStatus />

      <Tabs defaultValue="whatsapp" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-5 min-w-max">
            <TabsTrigger value="whatsapp" className="flex items-center gap-2 text-xs sm:text-sm">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">WA</span>
            </TabsTrigger>
            <TabsTrigger value="firebase" className="flex items-center gap-2 text-xs sm:text-sm">
              <Database className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Firebase</span>
              <span className="sm:hidden">DB</span>
            </TabsTrigger>
            <TabsTrigger value="openai" className="flex items-center gap-2 text-xs sm:text-sm">
              <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">OpenAI</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="assistants" className="flex items-center gap-2 text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Assistentes</span>
              <span className="sm:hidden">Assist.</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2 text-xs sm:text-sm">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Clientes</span>
              <span className="sm:hidden">Client.</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-4 sm:mt-6">
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
        </div>
      </Tabs>
    </PageLayout>
  );
}
