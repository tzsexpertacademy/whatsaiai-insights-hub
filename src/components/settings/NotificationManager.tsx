
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Clock, Bell } from 'lucide-react';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';

interface CustomNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  enabled: boolean;
  type: 'custom' | 'whatsapp' | 'browser';
  days?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
}

export function NotificationManager() {
  const { browserNotifications, addNotification, updateNotification, deleteNotification } = useEnhancedNotifications();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<CustomNotification | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    time: '',
    type: 'browser' as const,
    enabled: true,
    days: [] as string[]
  });

  const customNotifications = browserNotifications.filter(n => n.type === 'custom');

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      time: '',
      type: 'browser',
      enabled: true,
      days: []
    });
    setEditingNotification(null);
  };

  const openEditDialog = (notification: any) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      time: notification.time,
      type: notification.type || 'browser',
      enabled: notification.enabled,
      days: notification.days || []
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.message || !formData.time) return;

    const notificationData = {
      title: formData.title,
      message: formData.message,
      time: formData.time,
      enabled: formData.enabled,
      type: formData.type
    };

    if (editingNotification) {
      updateNotification(editingNotification.id, notificationData);
    } else {
      addNotification(notificationData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta notificação?')) {
      deleteNotification(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          Gerenciar Notificações Extras
        </CardTitle>
        <CardDescription>
          Adicione, edite ou exclua notificações personalizadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lista de Notificações */}
        <div className="space-y-3">
          {customNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma notificação personalizada criada</p>
              <p className="text-sm">Clique em "Adicionar Notificação" para começar</p>
            </div>
          ) : (
            customNotifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{notification.title}</h4>
                    <Badge variant={notification.enabled ? "default" : "secondary"}>
                      {notification.enabled ? 'Ativa' : 'Inativa'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {notification.time}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Switch
                    checked={notification.enabled}
                    onCheckedChange={(enabled) => updateNotification(notification.id, { enabled })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(notification)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(notification.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botão Adicionar */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Notificação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingNotification ? 'Editar Notificação' : 'Nova Notificação'}
              </DialogTitle>
              <DialogDescription>
                Configure os detalhes da sua notificação personalizada
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="notification-title">Título</Label>
                <Input
                  id="notification-title"
                  placeholder="Ex: Lembrete de exercício"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Mensagem */}
              <div className="space-y-2">
                <Label htmlFor="notification-message">Mensagem</Label>
                <Textarea
                  id="notification-message"
                  placeholder="Digite a mensagem da notificação..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Horário */}
              <div className="space-y-2">
                <Label htmlFor="notification-time">Horário</Label>
                <Input
                  id="notification-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label>Tipo de Notificação</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'browser' | 'whatsapp') => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="browser">Navegador</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ativo */}
              <div className="flex items-center justify-between">
                <Label htmlFor="notification-enabled">Notificação Ativa</Label>
                <Switch
                  id="notification-enabled"
                  checked={formData.enabled}
                  onCheckedChange={(enabled) => setFormData({ ...formData, enabled })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!formData.title || !formData.message || !formData.time}
              >
                {editingNotification ? 'Salvar Alterações' : 'Criar Notificação'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
