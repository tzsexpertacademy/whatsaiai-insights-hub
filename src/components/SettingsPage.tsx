
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Database, Bot, Settings } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { WhatsAppConfig } from '@/components/settings/WhatsAppConfig';
import { FirebaseConfig } from '@/components/settings/FirebaseConfig';
import { OpenAIConfig } from '@/components/settings/OpenAIConfig';
import { AssistantsConfig } from '@/components/settings/AssistantsConfig';
import { DatabaseCleanup } from '@/components/settings/DatabaseCleanup';

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Configurações"
        subtitle="Gerencie suas preferências e configurações do sistema"
      />
      
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="whatsapp" className="space-y-6">
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
                <Settings className="h-4 w-4" />
                Assistentes
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Limpeza
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

            <TabsContent value="database">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Gerenciamento de Dados
                    </CardTitle>
                    <CardDescription>
                      Ferramentas para limpeza e manutenção dos dados do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-700 mb-2">
                        <strong>⚠️ Atenção - Limpeza de Dados</strong>
                      </p>
                      <p className="text-sm text-amber-600">
                        Use as ferramentas abaixo para gerenciar os dados do sistema. 
                        A limpeza remove todos os dados de análise e é útil para testar o sistema com dados frescos.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <DatabaseCleanup />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
