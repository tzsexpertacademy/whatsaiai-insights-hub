
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, TestTube, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';

export function BrowserNotificationsConfig() {
  const {
    permission,
    requestPermission,
    testNotification,
    checkPermissionStatus,
    isInTrialPeriod,
    trialDaysRemaining
  } = useEnhancedNotifications();

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Ativadas', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'denied':
        return { text: 'Bloqueadas', color: 'bg-red-100 text-red-800', icon: AlertCircle };
      default:
        return { text: 'Aguardando', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    }
  };

  const status = getPermissionStatus();
  const StatusIcon = status.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          Notificações do Navegador
        </CardTitle>
        <CardDescription>
          Configure notificações push no seu navegador para lembretes importantes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Atual */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <StatusIcon className="h-5 w-5 text-gray-600" />
            <div>
              <h3 className="font-medium">Status das Notificações</h3>
              <p className="text-sm text-gray-600">
                {permission === 'granted' && 'Você receberá notificações no navegador'}
                {permission === 'denied' && 'Notificações foram bloqueadas. Ative manualmente nas configurações do navegador'}
                {permission === 'default' && 'Clique em "Ativar" para permitir notificações'}
              </p>
            </div>
          </div>
          <Badge className={status.color}>
            {status.text}
          </Badge>
        </div>

        {/* Trial Info */}
        {isInTrialPeriod && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">📅 Período de Trial</h4>
            <p className="text-sm text-blue-700">
              Você tem {trialDaysRemaining} dias restantes do seu trial gratuito. 
              As notificações incluirão lembretes sobre a assinatura.
            </p>
          </div>
        )}

        {/* Instruções Manuais */}
        {permission === 'denied' && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-900 mb-2">🔧 Como ativar manualmente:</h4>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Clique no ícone de cadeado na barra de endereço</li>
              <li>Encontre "Notificações" e altere para "Permitir"</li>
              <li>Recarregue a página</li>
              <li>Teste novamente usando o botão abaixo</li>
            </ol>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3">
          {permission !== 'granted' && (
            <Button
              onClick={requestPermission}
              className="flex-1"
            >
              Ativar Notificações
              <Bell className="ml-2 h-4 w-4" />
            </Button>
          )}
          
          <Button
            onClick={testNotification}
            variant="outline"
            className="flex-1"
          >
            Testar Notificação
            <TestTube className="ml-2 h-4 w-4" />
          </Button>

          <Button
            onClick={checkPermissionStatus}
            variant="outline"
            size="sm"
          >
            Verificar Status
          </Button>
        </div>

        {/* Informações das Notificações */}
        {permission === 'granted' && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">✅ Notificações Ativas!</h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Lembretes diários para interagir com seu assistente</li>
              <li>Notificações de trial (se aplicável)</li>
              <li>Avisos importantes do sistema</li>
              <li>Clique nas notificações para ir direto ao chat</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
