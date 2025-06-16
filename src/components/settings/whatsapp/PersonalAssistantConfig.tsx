
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Bell, MessageSquare } from 'lucide-react';
import { PersonalAssistantSettings } from './PersonalAssistantSettings';
import { NotificationsConfig } from '../NotificationsConfig';

export function PersonalAssistantConfig() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Assistente Pessoal & Notificações</h2>
        <p className="text-slate-600">
          Configure seu assistente pessoal e sistema de notificações automáticas
        </p>
      </div>

      <Tabs defaultValue="assistant" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Assistente
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistant">
          <PersonalAssistantSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
