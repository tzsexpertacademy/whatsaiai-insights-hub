
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, Database, Bot } from 'lucide-react';
import { CommercialAssistantsConfig } from './CommercialAssistantsConfig';
import { CommercialDatabaseCleanup } from './CommercialDatabaseCleanup';

export function CommercialSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Configurações Comerciais</h2>
        <p className="text-slate-600">Configure assistentes e gerencie dados do módulo comercial</p>
      </div>

      <Tabs defaultValue="assistants" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assistants" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Assistentes Comerciais
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Limpeza de Dados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistants">
          <CommercialAssistantsConfig />
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
                <p className="text-sm text-gray-600 mb-4">
                  Use as ferramentas abaixo para gerenciar os dados do sistema comercial. 
                  A limpeza é útil para testar o sistema com dados frescos.
                </p>
              </CardContent>
            </Card>

            <CommercialDatabaseCleanup />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
