
import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Bell, BellOff, Plus, Trash2, Edit, Clock, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function NotificationsPage() {
  const { 
    notifications, 
    permission, 
    requestPermission, 
    addNotification, 
    updateNotification, 
    deleteNotification, 
    toggleNotification 
  } = useNotifications();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<string | null>(null);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    time: '',
    type: 'custom' as const
  });

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast({
        title: "Permissão concedida!",
        description: "Agora você receberá notificações do sistema.",
      });
    } else {
      toast({
        title: "Permissão negada",
        description: "Você pode habilitar notificações nas configurações do navegador.",
        variant: "destructive"
      });
    }
  };

  const handleAddNotification = () => {
    if (!newNotification.title || !newNotification.message || !newNotification.time) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    addNotification({
      title: newNotification.title,
      message: newNotification.message,
      time: newNotification.time,
      enabled: true,
      type: 'custom'
    });

    setNewNotification({ title: '', message: '', time: '', type: 'custom' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Notificação criada!",
      description: "Sua nova notificação foi adicionada com sucesso.",
    });
  };

  const handleDeleteNotification = (id: string, title: string) => {
    deleteNotification(id);
    toast({
      title: "Notificação removida",
      description: `"${title}" foi removida com sucesso.`,
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800">Ativadas</Badge>;
      case 'denied':
        return <Badge variant="destructive">Bloqueadas</Badge>;
      default:
        return <Badge variant="secondary">Aguardando</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Notificações</h1>
            <p className="text-gray-600 mt-1">Configure seus lembretes personalizados</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Notificação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Notificação</DialogTitle>
                <DialogDescription>
                  Configure um novo lembrete personalizado
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Lembrete de exercício"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Ex: Hora de fazer seus exercícios diários!"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Horário (GMT-3)</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newNotification.time}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddNotification}>
                  Criar Notificação
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Status das Notificações */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Status das Notificações
                </CardTitle>
                <CardDescription>
                  Permissões e configurações do navegador
                </CardDescription>
              </div>
              {getPermissionBadge()}
            </div>
          </CardHeader>
          <CardContent>
            {permission === 'default' && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Para receber notificações, você precisa conceder permissão.</span>
                  <Button size="sm" onClick={handleRequestPermission}>
                    Permitir Notificações
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {permission === 'denied' && (
              <Alert variant="destructive">
                <BellOff className="h-4 w-4" />
                <AlertDescription>
                  Notificações bloqueadas. Habilite nas configurações do navegador para receber lembretes.
                </AlertDescription>
              </Alert>
            )}
            {permission === 'granted' && (
              <Alert>
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  Notificações ativadas! Você receberá lembretes conforme configurado.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Lista de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Notificações ({notifications.length})</CardTitle>
            <CardDescription>
              Gerencie seus lembretes diários e personalizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma notificação configurada</p>
                  <p className="text-sm">Clique em "Nova Notificação" para começar</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {formatTime(notification.time)}
                          </span>
                        </div>
                        <Badge variant={notification.type === 'daily' ? 'default' : 'secondary'}>
                          {notification.type === 'daily' ? 'Padrão' : 'Personalizada'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={notification.enabled}
                          onCheckedChange={() => toggleNotification(notification.id)}
                        />
                        {notification.type === 'custom' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id, notification.title)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Como funciona?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">🕰️ Horários</h4>
                <p className="text-sm text-gray-600">
                  Os horários estão configurados para GMT-3 (horário de Brasília). 
                  As notificações são verificadas a cada minuto.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">🔔 Tipos de Notificação</h4>
                <p className="text-sm text-gray-600">
                  Você receberá tanto notificações do navegador quanto toasts na tela, 
                  garantindo que não perca nenhum lembrete.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">⚙️ Personalizações</h4>
                <p className="text-sm text-gray-600">
                  Crie quantas notificações quiser, configure horários específicos 
                  e ative/desative conforme necessário.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">🎯 Padrão do Sistema</h4>
                <p className="text-sm text-gray-600">
                  As notificações padrão seguem um fluxo otimizado para máximo 
                  engajamento: manhã, almoço, tarde e noite.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
