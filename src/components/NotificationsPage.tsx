
import React, { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, CheckCircle, AlertTriangle, Info, Settings, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Análise Concluída',
      message: 'Sua análise comportamental foi processada com sucesso.',
      type: 'success',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      title: 'Nova Recomendação',
      message: 'Temos novas sugestões baseadas no seu perfil comportamental.',
      type: 'info',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      title: 'WhatsApp Conectado',
      message: 'Sua integração com WhatsApp foi configurada com sucesso.',
      type: 'success',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true
    },
    {
      id: '4',
      title: 'Atenção: Meta não atingida',
      message: 'Você não atingiu sua meta de bem-estar esta semana.',
      type: 'warning',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true
    }
  ]);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    analysisComplete: true,
    newRecommendations: true
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-200';
      case 'warning': return 'bg-yellow-100 border-yellow-200';
      case 'error': return 'bg-red-100 border-red-200';
      default: return 'bg-blue-100 border-blue-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Notificações"
        subtitle="Gerencie suas notificações e alertas do sistema"
      >
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            Marcar todas como lidas
          </Button>
        )}
      </PageHeader>
      
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Configurações de Notificação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Notificação
              </CardTitle>
              <CardDescription>
                Configure como e quando você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Notificações por Email</label>
                  <p className="text-xs text-gray-600">Receba notificações importantes por email</p>
                </div>
                <Switch 
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Notificações Push</label>
                  <p className="text-xs text-gray-600">Receba notificações no navegador</p>
                </div>
                <Switch 
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Relatórios Semanais</label>
                  <p className="text-xs text-gray-600">Receba resumos semanais do seu progresso</p>
                </div>
                <Switch 
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, weeklyReports: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Análises Concluídas</label>
                  <p className="text-xs text-gray-600">Seja notificado quando análises forem processadas</p>
                </div>
                <Switch 
                  checked={settings.analysisComplete}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, analysisComplete: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Novas Recomendações</label>
                  <p className="text-xs text-gray-600">Receba alertas sobre novas recomendações personalizadas</p>
                </div>
                <Switch 
                  checked={settings.newRecommendations}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, newRecommendations: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações Recentes
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma notificação ainda</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        notification.read 
                          ? 'bg-gray-50 border-gray-200' 
                          : `${getTypeColor(notification.type)} border-l-4`
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {getIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                            <p className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Marcar como lida
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
