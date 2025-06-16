
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, MessageSquare, Smartphone, Settings } from 'lucide-react';
import { WhatsAppNotificationsConfig } from './WhatsAppNotificationsConfig';
import { BrowserNotificationsConfig } from './BrowserNotificationsConfig';
import { NotificationManager } from './NotificationManager';

export function NotificationsConfig() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Sistema de Notificações</h2>
        <p className="text-slate-600">
          Configure notificações automáticas para manter sua conversa ativa e receber lembretes importantes
        </p>
      </div>

      <Tabs defaultValue="whatsapp" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp Automático
          </TabsTrigger>
          <TabsTrigger value="browser" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Navegador
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gerenciar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp">
          <WhatsAppNotificationsConfig />
        </TabsContent>

        <TabsContent value="browser">
          <BrowserNotificationsConfig />
        </TabsContent>

        <TabsContent value="manage">
          <NotificationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
