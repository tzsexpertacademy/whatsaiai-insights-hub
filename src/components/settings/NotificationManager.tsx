import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Settings, 
  Clock,
  MessageSquare,
  Save
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationConfig {
  id: string;
  title: string;
  message: string;
  time: string;
  enabled: boolean;
  type: 'daily' | 'custom' | 'trial';
  createdAt: string;
}

export function NotificationManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    time: '09:00',
    enabled: true,
    type: 'custom' as const
  });

  // Simulação de dados locais para demonstração
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento com dados locais
      const mockNotifications: NotificationConfig[] = [
        {
          id: '1',
          title: 'Lembrete Diário',
          message: 'Hora de revisar seus insights do dia!',
          time: '19:00',
          enabled: true,
          type: 'daily',
          createdAt: new Date().toISOString()
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast({
        title: "Erro ao carregar notificações",
        description: "Não foi possível carregar suas configurações de notificação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  const addDefaultNotification = async () => {
    const defaultNotification: NotificationConfig = {
      id: Date.now().toString(),
      title: 'Lembrete Diário',
      message: 'Hora de revisar seus insights e reflexões do dia!',
      time: '19:00',
      enabled: true,
      type: 'daily',
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [defaultNotification, ...prev]);
    
    toast({
      title: "Notificação adicionada",
      description: "Lembrete diário configurado com sucesso!"
    });
  };

  const saveNotification = async () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e mensagem",
        variant: "destructive"
      });
      return;
    }

    const notification: NotificationConfig = {
      id: Date.now().toString(),
      ...newNotification,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [notification, ...prev]);
    setNewNotification({
      title: '',
      message: '',
      time: '09:00',
      enabled: true,
      type: 'custom'
    });
    setShowAddForm(false);
    
    toast({
      title: "Notificação criada",
      description: "Nova notificação configurada com sucesso!"
    });
  };

  const updateNotification = async (id: string, updates: Partial<NotificationConfig>) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, ...updates } : notif
      )
    );
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    
    toast({
      title: "Notificação removida",
      description: "Configuração de notificação excluída"
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Clock className="h-4 w-4" />;
      case 'trial':
        return <Bell className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'daily':
        return 'Diário';
      case 'trial':
        return 'Trial';
      default:
        return 'Personalizado';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Gerenciar Notificações</h3>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={addDefaultNotification}
            variant="outline"
            size="sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            Lembrete Diário
          </Button>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Notificação
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Notificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newNotification.title}
                onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título da notificação"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                value={newNotification.message}
                onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Conteúdo da notificação"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={newNotification.time}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={newNotification.type}
                  onValueChange={(value: 'daily' | 'custom' | 'trial') => 
                    setNewNotification(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Personalizado</SelectItem>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="enabled"
                checked={newNotification.enabled}
                onCheckedChange={(checked) => setNewNotification(prev => ({ ...prev, enabled: checked }))}
              />
              <Label htmlFor="enabled">Ativar notificação</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveNotification} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button 
                onClick={() => setShowAddForm(false)} 
                variant="outline" 
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Carregando notificações...</p>
            </CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Nenhuma notificação configurada</h3>
              <p className="text-gray-500 mb-4">
                Configure lembretes personalizados para seus insights e reflexões
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira notificação
              </Button>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      notification.type === 'daily' ? 'bg-blue-100 text-blue-600' :
                      notification.type === 'trial' ? 'bg-orange-100 text-orange-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500">
                          🕒 {notification.time}
                        </span>
                        <span className="text-xs text-gray-500">
                          📋 {getTypeLabel(notification.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={notification.enabled}
                      onCheckedChange={(checked) => updateNotification(notification.id, { enabled: checked })}
                    />
                    <Button
                      onClick={() => deleteNotification(notification.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
