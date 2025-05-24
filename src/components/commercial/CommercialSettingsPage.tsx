
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Database, Bot, Settings, Users } from 'lucide-react';
import { CommercialAssistantsConfig } from './CommercialAssistantsConfig';
import { CommercialDatabaseCleanup } from './CommercialDatabaseCleanup';
import { WhatsAppConfig } from '@/components/settings/WhatsAppConfig';
import { FirebaseConfig } from '@/components/settings/FirebaseConfig';
import { OpenAIConfig } from '@/components/settings/OpenAIConfig';

export function CommercialSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Configurações Comerciais</h2>
        <p className="text-slate-600">Configure integrações, assistentes e gerencie dados do módulo comercial</p>
      </div>

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
            <Users className="h-4 w-4" />
            Assistentes
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Limpeza
          </TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Integração WhatsApp Comercial
                </CardTitle>
                <CardDescription>
                  Configure sua conexão WhatsApp especificamente para o módulo comercial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 mb-2">
                    <strong>📱 Módulo Comercial Independente</strong>
                  </p>
                  <p className="text-sm text-blue-600">
                    Esta configuração é específica para o módulo comercial e funciona de forma independente do Observatório.
                    Configure aqui suas integrações para análise de vendas e performance comercial.
                  </p>
                </div>
              </CardContent>
            </Card>
            <WhatsAppConfig />
          </div>
        </TabsContent>

        <TabsContent value="firebase">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Firebase Comercial
                </CardTitle>
                <CardDescription>
                  Configuração de banco de dados Firebase para dados comerciais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-700 mb-2">
                    <strong>🔥 Banco de Dados Comercial</strong>
                  </p>
                  <p className="text-sm text-orange-600">
                    Configure o Firebase para armazenar e gerenciar dados específicos do módulo comercial,
                    incluindo conversas de vendas, métricas de performance e análises de funil.
                  </p>
                </div>
              </CardContent>
            </Card>
            <FirebaseConfig />
          </div>
        </TabsContent>

        <TabsContent value="openai">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  OpenAI Comercial
                </CardTitle>
                <CardDescription>
                  Configuração de IA para análises e insights comerciais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 mb-2">
                    <strong>🤖 IA Especializada em Vendas</strong>
                  </p>
                  <p className="text-sm text-green-600">
                    Configure a OpenAI para análises especializadas em vendas, incluindo análise de conversas comerciais,
                    identificação de oportunidades e geração de insights de performance.
                  </p>
                </div>
              </CardContent>
            </Card>
            <OpenAIConfig />
          </div>
        </TabsContent>

        <TabsContent value="assistants">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assistentes Comerciais
                </CardTitle>
                <CardDescription>
                  Configure assistentes especializados para análise e suporte comercial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700 mb-2">
                    <strong>👥 Equipe de Assistentes IA</strong>
                  </p>
                  <p className="text-sm text-purple-600">
                    Configure assistentes especializados em vendas, análise de funil, performance comercial
                    e estratégias de crescimento para alimentar automaticamente os dashboards.
                  </p>
                </div>
              </CardContent>
            </Card>
            <CommercialAssistantsConfig />
          </div>
        </TabsContent>

        <TabsContent value="database">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Gerenciamento de Dados Comerciais
                </CardTitle>
                <CardDescription>
                  Ferramentas para limpeza e manutenção dos dados do módulo comercial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 mb-2">
                    <strong>🗃️ Limpeza de Dados Comerciais</strong>
                  </p>
                  <p className="text-sm text-red-600">
                    Use as ferramentas abaixo para gerenciar os dados do sistema comercial. 
                    A limpeza remove todos os dados comerciais (conversas, métricas, insights) e é útil para testar o sistema com dados frescos.
                  </p>
                </div>
              </CardContent>
            </Card>

            <CommercialDatabaseCleanup />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
