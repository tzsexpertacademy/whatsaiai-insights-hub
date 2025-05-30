
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
import { Bell, BellOff, Plus, Trash2, Clock, Info, Settings, AlertCircle, CheckCircle, TestTube, RefreshCw, HelpCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';

export function NotificationsPage() {
  const { 
    notifications, 
    permission, 
    requestPermission, 
    addNotification, 
    updateNotification, 
    deleteNotification, 
    toggleNotification,
    testNotification,
    checkPermissionStatus
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
    console.log('🔄 Usuário clicou em solicitar permissão');
    const granted = await requestPermission();
    if (!granted && permission !== 'granted') {
      console.log('⚠️ Permissão não foi concedida, mostrando instruções');
    }
  };

  const handleTestNotification = () => {
    console.log('🧪 Usuário clicou em testar notificação');
    testNotification();
  };

  const handleCheckPermission = () => {
    console.log('🔍 Usuário clicou em verificar permissão');
    checkPermissionStatus();
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
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Ativadas
        </Badge>;
      case 'denied':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <BellOff className="w-3 h-3" />
          Bloqueadas
        </Badge>;
      default:
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Aguardando
        </Badge>;
    }
  };

  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'seu navegador';
  };

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const renderSafariInstructions = () => (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
          <Settings className="w-4 h-4" />
          Como habilitar notificações no Safari {isMobile() ? '(iPhone/iPad)' : '(Desktop)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-blue-700">
        {isMobile() ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="font-medium">📱 No iPhone/iPad:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Vá em <strong>Configurações</strong> do iPhone</li>
                <li>Role para baixo e toque em <strong>Safari</strong></li>
                <li>Toque em <strong>Notificações</strong></li>
                <li>Encontre este site na lista</li>
                <li>Ative <strong>"Permitir Notificações"</strong></li>
                <li>Volte a esta página e clique em <strong>"Tentar Novamente"</strong></li>
              </ol>
            </div>
            
            <div className="bg-orange-100 p-3 rounded border border-orange-200">
              <p className="text-xs text-orange-700">
                ⚠️ <strong>Importante:</strong> No Safari mobile, as notificações só funcionam se o site estiver adicionado à tela inicial como um PWA (Progressive Web App).
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="font-medium">🖥️ No Safari Desktop:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>No Safari, vá no menu <strong>Safari → Preferências</strong></li>
              <li>Clique na aba <strong>"Sites"</strong></li>
              <li>No lado esquerdo, clique em <strong>"Notificações"</strong></li>
              <li>Encontre este site e mude para <strong>"Permitir"</strong></li>
              <li>Feche as preferências e recarregue a página</li>
            </ol>
          </div>
        )}

        <div className="bg-white p-3 rounded border border-blue-200 mt-3">
          <p className="text-xs text-blue-600">
            💡 <strong>Dica:</strong> Após habilitar, use o botão "Testar Notificação" abaixo para verificar se está funcionando.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderTroubleshootingSection = () => (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
          <HelpCircle className="w-4 h-4" />
          Problemas com notificações?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-amber-700">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCheckPermission}
              className="flex items-center gap-1 bg-white"
            >
              <RefreshCw className="w-3 h-3" />
              Verificar Status
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleTestNotification}
              className="flex items-center gap-1 bg-white"
            >
              <TestTube className="w-3 h-3" />
              Testar Agora
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleRequestPermission}
              className="flex items-center gap-1 bg-white"
            >
              <Bell className="w-3 h-3" />
              Solicitar Permissão
            </Button>
          </div>
          
          <div className="bg-white p-3 rounded border border-amber-200">
            <p className="font-medium mb-2">📱 Para Safari no iPhone/iPad:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li><strong>Configurações do iPhone</strong> → <strong>Safari</strong></li>
              <li><strong>Notificações</strong> → Encontre este site</li>
              <li>Ative <strong>"Permitir Notificações"</strong></li>
              <li>Volte aqui e teste novamente</li>
            </ol>
          </div>
          
          <div className="bg-white p-3 rounded border border-amber-200">
            <p className="font-medium mb-2">🖥️ Para Safari no Mac:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li><strong>Safari</strong> → <strong>Preferências</strong></li>
              <li>Aba <strong>"Sites"</strong> → <strong>"Notificações"</strong></li>
              <li>Encontre este site → <strong>"Permitir"</strong></li>
              <li>Recarregue a página e teste</li>
            </ol>
          </div>
          
          <div className="bg-white p-3 rounded border border-amber-200">
            <p className="font-medium mb-2">🌐 Para Chrome/Edge:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Clique no <strong>ícone do cadeado</strong> na barra de endereço</li>
              <li>Procure "Notificações" → <strong>"Permitir"</strong></li>
              <li>Ou vá em <strong>Configurações</strong> → <strong>Privacidade</strong> → <strong>Configurações do site</strong></li>
              <li>Recarregue e teste novamente</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const headerActions = (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Nova Notificação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-4">
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
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={handleAddNotification} className="w-full sm:w-auto">
            Criar Notificação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <PageLayout
      title="Gerenciar Notificações"
      description="Configure seus lembretes personalizados"
      showBackButton={true}
      headerActions={headerActions}
    >
      {/* Status das Notificações */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Status das Notificações
              </CardTitle>
              <CardDescription>
                Permissões e configurações do navegador
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getPermissionBadge()}
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleTestNotification}
                className="flex items-center gap-1"
              >
                <TestTube className="w-3 h-3" />
                Testar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {permission === 'default' && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span>Para receber notificações, você precisa conceder permissão.</span>
                  <Button size="sm" onClick={handleRequestPermission} className="w-full sm:w-auto">
                    <Bell className="w-4 h-4 mr-2" />
                    Permitir Notificações
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {permission === 'denied' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p className="font-medium">Notificações bloqueadas pelo navegador</p>
                    <p className="text-sm">
                      As notificações foram bloqueadas. Siga as instruções abaixo para habilitar.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {permission === 'granted' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span>✅ Notificações ativadas! Você receberá lembretes conforme configurado.</span>
                <Badge className="bg-green-100 text-green-800 w-fit">
                  Sistema Funcionando
                </Badge>
              </AlertDescription>
            </Alert>
          )}

          {/* Seção de troubleshooting sempre visível */}
          {renderTroubleshootingSection()}
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
              <h4 className="font-medium mb-2">🧪 Teste</h4>
              <p className="text-sm text-gray-600">
                Use o botão "Testar" para verificar se as notificações estão funcionando 
                corretamente no seu dispositivo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
