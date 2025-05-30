import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, Bell, BellRing, CheckCircle, AlertCircle, Info, Settings, Trash2, Clock } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  isRead: boolean;
  category: string;
  assistantName?: string;
}

export function Notifications() {
  const { data, isLoading } = useAnalysisData();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Nova análise disponível',
      message: 'O assistente de bem-estar gerou novos insights sobre seus padrões comportamentais.',
      type: 'info',
      timestamp: '2024-01-15T14:30:00Z',
      isRead: false,
      category: 'Análise',
      assistantName: 'Assistente de Bem-estar'
    },
    {
      id: '2',
      title: 'Recomendação de rotina',
      message: 'Baseado em suas atividades, sugerimos ajustar seu horário de meditação.',
      type: 'success',
      timestamp: '2024-01-15T12:15:00Z',
      isRead: false,
      category: 'Rotina',
      assistantName: 'Coach Pessoal'
    },
    {
      id: '3',
      title: 'Ponto de atenção identificado',
      message: 'Detectamos padrões de ansiedade. Recomendamos técnicas de respiração.',
      type: 'warning',
      timestamp: '2024-01-15T10:45:00Z',
      isRead: true,
      category: 'Alerta',
      assistantName: 'Terapeuta Virtual'
    },
    {
      id: '4',
      title: 'WhatsApp conectado',
      message: 'Sua conta WhatsApp foi conectada com sucesso e está pronta para uso.',
      type: 'success',
      timestamp: '2024-01-14T16:20:00Z',
      isRead: true,
      category: 'Sistema'
    },
    {
      id: '5',
      title: 'Análise de documento concluída',
      message: 'O documento "Diário Pessoal.pdf" foi analisado. 8 insights foram extraídos.',
      type: 'info',
      timestamp: '2024-01-14T09:30:00Z',
      isRead: true,
      category: 'Documentos',
      assistantName: 'Analista de Texto'
    }
  ]);

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Badge className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
        🔔 {notifications.filter(n => !n.isRead).length} não lidas
      </Badge>
      <Button variant="outline" size="sm">
        <Settings className="h-4 w-4 mr-2" />
        Configurar
      </Button>
    </div>
  );

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      default: return Info;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'Análise': 'bg-purple-100 text-purple-800',
      'Rotina': 'bg-blue-100 text-blue-800',
      'Alerta': 'bg-red-100 text-red-800',
      'Sistema': 'bg-gray-100 text-gray-800',
      'Documentos': 'bg-green-100 text-green-800'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 48) return 'Ontem';
    return date.toLocaleDateString('pt-BR');
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  if (isLoading) {
    return (
      <PageLayout
        title="Notificações"
        description="Acompanhe atualizações e alertas importantes"
        showBackButton={true}
        headerActions={headerActions}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Notificações"
      description="Acompanhe atualizações e alertas importantes"
      showBackButton={true}
      headerActions={headerActions}
    >
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Não Lidas</p>
                <p className="text-2xl font-bold text-blue-600">{unreadNotifications.length}</p>
              </div>
              <BellRing className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertas</p>
                <p className="text-2xl font-bold text-red-600">
                  {notifications.filter(n => n.type === 'warning' || n.type === 'error').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => {
                    const notifDate = new Date(n.timestamp);
                    const today = new Date();
                    return notifDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {unreadNotifications.length > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      {/* Notificações não lidas */}
      {unreadNotifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Não Lidas</h3>
          <div className="space-y-3">
            {unreadNotifications.map((notification) => {
              const TypeIcon = getTypeIcon(notification.type);
              return (
                <Card key={notification.id} className="bg-white/70 backdrop-blur-sm border-white/50 border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-800">{notification.title}</h4>
                            <Badge className={getCategoryColor(notification.category)}>
                              {notification.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{formatTimestamp(notification.timestamp)}</span>
                            {notification.assistantName && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                🤖 {notification.assistantName}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Notificações lidas */}
      {readNotifications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Lidas</h3>
          <div className="space-y-3">
            {readNotifications.map((notification) => {
              const TypeIcon = getTypeIcon(notification.type);
              return (
                <Card key={notification.id} className="bg-white/50 backdrop-blur-sm border-white/50 opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${getTypeColor(notification.type)} opacity-75`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-600">{notification.title}</h4>
                            <Badge variant="outline" className={getCategoryColor(notification.category)}>
                              {notification.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{notification.message}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>{formatTimestamp(notification.timestamp)}</span>
                            {notification.assistantName && (
                              <Badge variant="outline" className="bg-gray-50 text-gray-600">
                                🤖 {notification.assistantName}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {notifications.length === 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <Bell className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Nenhuma notificação</h3>
              <p className="text-gray-500 max-w-md">
                Quando houver atualizações importantes, elas aparecerão aqui.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
