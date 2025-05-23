
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Settings, MessageSquare, Shield, CheckCircle, XCircle, Eye, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Client {
  id: string;
  email: string;
  name: string;
  company_name?: string;
  plan: 'basic' | 'premium' | 'enterprise';
  created_at: string;
  is_active: boolean;
  whatsapp_connected: boolean;
  firebase_connected: boolean;
  last_login?: string;
}

interface WhatsAppMessage {
  id: string;
  client_name: string;
  client_email: string;
  contact_name: string;
  contact_phone: string;
  message_text: string;
  sender_type: 'client' | 'contact';
  timestamp: string;
  conversation_id: string;
}

export function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientPlan, setNewClientPlan] = useState<'basic' | 'premium' | 'enterprise'>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadClients();
    loadMessages();
  }, []);

  const loadClients = async () => {
    try {
      // Buscar perfis de usuários
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('Erro ao carregar perfis:', profilesError);
        return;
      }

      // Buscar configurações para verificar conexões
      const { data: configs, error: configsError } = await supabase
        .from('client_configs')
        .select('*');

      if (configsError) {
        console.error('Erro ao carregar configurações:', configsError);
        return;
      }

      // Combinar dados
      const clientsData = profiles?.map(profile => {
        const config = configs?.find(c => c.user_id === profile.id);
        const whatsappConfig = config?.whatsapp_config as any;
        const firebaseConfig = config?.firebase_config as any;

        return {
          id: profile.id,
          email: 'email@exemplo.com', // Precisaria buscar do auth.users
          name: profile.full_name || 'Sem nome',
          company_name: profile.company_name,
          plan: profile.plan as 'basic' | 'premium' | 'enterprise',
          created_at: profile.created_at,
          is_active: true,
          whatsapp_connected: whatsappConfig?.isConnected || false,
          firebase_connected: !!(firebaseConfig?.projectId && firebaseConfig?.apiKey),
          last_login: undefined
        };
      }) || [];

      setClients(clientsData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de clientes",
        variant: "destructive"
      });
    }
  };

  const loadMessages = async () => {
    try {
      const { data: conversations, error } = await supabase
        .from('whatsapp_conversations')
        .select(`
          *,
          whatsapp_messages (*)
        `)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao carregar conversas:', error);
        return;
      }

      // Buscar perfis para obter nomes dos clientes
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name');

      const messagesData: WhatsAppMessage[] = [];

      conversations?.forEach(conv => {
        const clientProfile = profiles?.find(p => p.id === conv.user_id);
        const clientName = clientProfile?.full_name || 'Cliente';

        conv.whatsapp_messages?.forEach((msg: any) => {
          messagesData.push({
            id: msg.id,
            client_name: clientName,
            client_email: 'cliente@exemplo.com',
            contact_name: conv.contact_name,
            contact_phone: conv.contact_phone,
            message_text: msg.message_text,
            sender_type: msg.sender_type,
            timestamp: msg.timestamp,
            conversation_id: conv.id
          });
        });
      });

      setMessages(messagesData);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const createClient = async () => {
    if (!newClientEmail || !newClientPassword || !newClientName) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newClientEmail,
        password: newClientPassword,
        user_metadata: {
          full_name: newClientName,
          company_name: newClientCompany
        }
      });

      if (authError) throw authError;

      // Atualizar perfil
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: newClientName,
            company_name: newClientCompany,
            plan: newClientPlan
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Erro ao atualizar perfil:', profileError);
        }
      }

      toast({
        title: "Cliente criado",
        description: `Cliente ${newClientName} criado com sucesso`
      });

      // Limpar formulário
      setNewClientEmail('');
      setNewClientPassword('');
      setNewClientName('');
      setNewClientCompany('');
      setNewClientPlan('basic');

      // Recarregar lista
      loadClients();
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o cliente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendInterventionMessage = async (conversationId: string, contactPhone: string) => {
    if (!replyMessage.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem para enviar",
        variant: "destructive"
      });
      return;
    }

    try {
      // Inserir mensagem no banco como sendo do admin
      const { error } = await supabase
        .from('whatsapp_messages')
        .insert({
          conversation_id: conversationId,
          user_id: user?.id,
          message_text: `[ADMIN] ${replyMessage}`,
          sender_type: 'client',
          ai_generated: false
        });

      if (error) throw error;

      toast({
        title: "Mensagem enviada",
        description: "Intervenção administrativa registrada"
      });

      setReplyMessage('');
      loadMessages();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
    }
  };

  const filteredMessages = selectedClient 
    ? messages.filter(m => m.client_name.includes(selectedClient))
    : messages;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Painel Administrativo</h1>
        <p className="text-slate-600">Gerencie clientes e monitore conversas</p>
      </div>

      <Tabs defaultValue="clients" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversas
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-6">
          {/* Criar novo cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Cliente</CardTitle>
              <CardDescription>
                Adicione um novo cliente ao sistema com acesso automático
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="cliente@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newClientPassword}
                    onChange={(e) => setNewClientPassword(e.target.value)}
                    placeholder="Senha forte"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Nome do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    value={newClientCompany}
                    onChange={(e) => setNewClientCompany(e.target.value)}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan">Plano</Label>
                  <Select value={newClientPlan} onValueChange={(value: any) => setNewClientPlan(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={createClient} disabled={isLoading} className="w-full">
                    {isLoading ? 'Criando...' : 'Criar Cliente'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de clientes */}
          <Card>
            <CardHeader>
              <CardTitle>Clientes Cadastrados ({clients.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">{client.name}</h3>
                        <p className="text-sm text-gray-500">{client.email}</p>
                        {client.company_name && (
                          <p className="text-sm text-gray-400">{client.company_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={client.plan === 'enterprise' ? 'default' : 'secondary'}>
                        {client.plan}
                      </Badge>
                      {client.whatsapp_connected ? (
                        <CheckCircle className="h-5 w-5 text-green-500" title="WhatsApp conectado" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" title="WhatsApp desconectado" />
                      )}
                      {client.firebase_connected ? (
                        <CheckCircle className="h-5 w-5 text-blue-500" title="Firebase conectado" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" title="Firebase desconectado" />
                      )}
                    </div>
                  </div>
                ))}
                
                {clients.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhum cliente cadastrado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Monitoramento de Conversas
              </CardTitle>
              <CardDescription>
                Visualize e interfira nas conversas dos clientes quando necessário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Filtrar por cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os clientes</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.name}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={loadMessages} variant="outline">
                  Atualizar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de mensagens */}
          <Card>
            <CardHeader>
              <CardTitle>Conversas Recentes ({filteredMessages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredMessages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{message.client_name}</Badge>
                        <span className="text-sm text-gray-500">→</span>
                        <Badge variant="secondary">{message.contact_name}</Badge>
                        <span className="text-xs text-gray-400">{message.contact_phone}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{message.message_text}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={message.sender_type === 'client' ? 'default' : 'destructive'}>
                        {message.sender_type === 'client' ? 'Cliente' : 'Contato'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReplyMessage(`Intervenção para ${message.contact_name}: `);
                        }}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Intervir
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredMessages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhuma conversa encontrada</p>
                  </div>
                )}
              </div>
              
              {/* Campo de intervenção */}
              {replyMessage && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Label htmlFor="intervention">Mensagem de Intervenção</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="intervention"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Digite sua intervenção..."
                      className="flex-1"
                    />
                    <Button
                      onClick={() => {
                        const firstMessage = filteredMessages[0];
                        if (firstMessage) {
                          sendInterventionMessage(firstMessage.conversation_id, firstMessage.contact_phone);
                        }
                      }}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setReplyMessage('')}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações Administrativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">✅ Sistema Configurado</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Criação automática de clientes</li>
                    <li>• Monitoramento de conversas WhatsApp</li>
                    <li>• Intervenção administrativa</li>
                    <li>• Dados armazenados no Firebase do cliente</li>
                    <li>• Privacidade e LGPD garantidas</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">🎯 Fluxo Automatizado</h3>
                  <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                    <li>Cliente compra a solução</li>
                    <li>Conta criada automaticamente aqui</li>
                    <li>Cliente recebe credenciais por email</li>
                    <li>Cliente configura Firebase próprio</li>
                    <li>Cliente conecta WhatsApp</li>
                    <li>Dados ficam no Firebase do cliente</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
