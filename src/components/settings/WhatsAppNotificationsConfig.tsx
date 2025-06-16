
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Bell, MessageCircle, Clock, Send, TestTube } from 'lucide-react';
import { useWhatsAppNotifications } from '@/hooks/useWhatsAppNotifications';
import { usePersonalAssistant } from '@/hooks/usePersonalAssistant';

export function WhatsAppNotificationsConfig() {
  const { 
    config, 
    updateConfig, 
    testWhatsAppNotification,
    startScheduledNotifications,
    defaultMessages 
  } = useWhatsAppNotifications();
  
  const { config: assistantConfig } = usePersonalAssistant();
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  const handleTestNotification = async () => {
    setIsTestingNotification(true);
    try {
      await testWhatsAppNotification();
    } finally {
      setIsTestingNotification(false);
    }
  };

  const handleToggleNotificationType = (type: keyof typeof config.notificationTypes) => {
    updateConfig({
      notificationTypes: {
        ...config.notificationTypes,
        [type]: !config.notificationTypes[type]
      }
    });
  };

  const handleUpdateMessage = (type: keyof typeof config.customMessages, message: string) => {
    updateConfig({
      customMessages: {
        ...config.customMessages,
        [type]: message
      }
    });
  };

  const syncWithAssistant = () => {
    if (assistantConfig.masterNumber) {
      updateConfig({ targetNumber: assistantConfig.masterNumber });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-green-600" />
          Notificações WhatsApp Automáticas
        </CardTitle>
        <CardDescription>
          Configure lembretes automáticos via WhatsApp para manter a conversa ativa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ativação Principal */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Ativar Notificações Automáticas</h3>
            <p className="text-sm text-gray-600 mt-1">
              Receba lembretes automáticos no WhatsApp para alimentar a conversa
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => updateConfig({ enabled })}
          />
        </div>

        {/* Configuração do Número */}
        <div className="space-y-3">
          <Label htmlFor="target-number">Número do WhatsApp para Notificações</Label>
          <div className="flex gap-2">
            <Input
              id="target-number"
              placeholder="5511999999999"
              value={config.targetNumber}
              onChange={(e) => updateConfig({ targetNumber: e.target.value })}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={syncWithAssistant}
              disabled={!assistantConfig.masterNumber}
            >
              Sincronizar com Assistente
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Use o mesmo número configurado no assistente pessoal para melhor integração
          </p>
        </div>

        {/* Tipos de Notificação */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horários de Notificação
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'morning', label: 'Manhã (06:00)', icon: '🌅' },
              { key: 'midday', label: 'Meio-dia (12:00)', icon: '☀️' },
              { key: 'afternoon', label: 'Tarde (18:00)', icon: '🌤️' },
              { key: 'evening', label: 'Noite (21:00)', icon: '🌙' }
            ].map(({ key, label, icon }) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">
                  {icon} {label}
                </span>
                <Switch
                  checked={config.notificationTypes[key as keyof typeof config.notificationTypes]}
                  onCheckedChange={() => handleToggleNotificationType(key as keyof typeof config.notificationTypes)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Personalização de Mensagens */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Personalizar Mensagens
          </h3>
          
          <div className="space-y-4">
            {[
              { key: 'morning', label: 'Mensagem da Manhã', placeholder: defaultMessages.morning },
              { key: 'midday', label: 'Mensagem do Meio-dia', placeholder: defaultMessages.midday },
              { key: 'afternoon', label: 'Mensagem da Tarde', placeholder: defaultMessages.afternoon },
              { key: 'evening', label: 'Mensagem da Noite', placeholder: defaultMessages.evening }
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`message-${key}`}>{label}</Label>
                <Textarea
                  id={`message-${key}`}
                  placeholder={placeholder}
                  value={config.customMessages[key as keyof typeof config.customMessages]}
                  onChange={(e) => handleUpdateMessage(key as keyof typeof config.customMessages, e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleTestNotification}
            disabled={isTestingNotification || !config.targetNumber}
            variant="outline"
            className="flex-1"
          >
            {isTestingNotification ? "Enviando..." : "Testar Notificação"}
            <TestTube className="ml-2 h-4 w-4" />
          </Button>
          
          <Button
            onClick={startScheduledNotifications}
            disabled={!config.enabled || !config.targetNumber}
            className="flex-1"
          >
            Ativar Agendamento
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {config.enabled && config.targetNumber && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">✅ Notificações Configuradas!</h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Número de destino: {config.targetNumber}</li>
              <li>Tipos ativos: {Object.entries(config.notificationTypes).filter(([_, enabled]) => enabled).length} de 4</li>
              <li>As notificações serão enviadas automaticamente nos horários configurados</li>
              <li>Cada mensagem incentiva você a interagir e manter a conversa ativa</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
