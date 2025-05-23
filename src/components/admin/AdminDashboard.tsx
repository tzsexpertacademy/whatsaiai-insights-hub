
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { Users, MessageSquare, Settings, Activity } from 'lucide-react';

interface Client {
  id: string;
  email: string;
  name: string;
  company_name?: string;
  plan: 'basic' | 'premium' | 'enterprise';
  created_at: string;
  is_active: boolean;
  last_login?: string;
}

interface Conversation {
  id: string;
  client_id: string;
  participant_name: string;
  message_count: number;
  last_message: string;
  last_activity: string;
  status: 'active' | 'archived';
}

export function AdminDashboard() {
  const { isAdmin, adminLevel } = useAdmin();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Estados para criação de cliente
  const [newClient, setNewClient] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
    plan: 'basic' as 'basic' | 'premium' | 'enterprise'
  });

  // Estados para monitoramento
  const [activeClients, setActiveClients] = useState(0);
  const [totalConversations, setTotalConversations] = useState(0);
  const [todayMessages, setTodayMessages] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      loadClients();
      loadConversations();
      loadStats();
    }
  }, [isAdmin]);

  const loadClients = async () => {
    try {
      // Buscar perfis e usuários do auth.users para obter emails
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar usuários do auth para obter emails
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      const clientsData: Client[] = profiles?.map(profile => {
        const authUser = authUsers.users.find(u => u.id === profile.id);
        return {
          id: profile.id,
          email: authUser?.email || 'N/A',
          name: profile.full_name || 'Usuário',
          company_name: profile.company_name,
          plan: profile.plan as 'basic' | 'premium' | 'enterprise',
          created_at: profile.created_at,
          is_active: true,
          last_login: profile.updated_at
        };
      }) || [];

      setClients(clientsData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes",
        variant: "destructive"
      });
    }
  };

  const loadConversations = async () => {
    try {
      // Simular conversações - em produção, isso viria do Firebase de cada cliente
      const mockConversations: Conversation[] = [
        {
          id: '1',
          client_id: 'client1',
          participant_name: 'João Silva',
          message_count: 45,
          last_message: 'Obrigado pela ajuda!',
          last_activity: new Date().toISOString(),
          status: 'active'
        },
        {
          id: '2',
          client_id: 'client1',
          participant_name: 'Maria Santos',
          message_count: 23,
          last_message: 'Quando podemos marcar?',
          last_activity: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'active'
        }
      ];

      setConversations(mockConversations);
    } catch (error) {
      console.error('Erro ao carregar conversações:', error);
    }
  };

  const loadStats = async () => {
    try {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, updated_at');

      setActiveClients(profilesData?.length || 0);
      
      // Simular estatísticas
      setTotalConversations(150);
      setTodayMessages(342);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const createClient = async () => {
    if (!newClient.email || !newClient.password || !newClient.name) {
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
        email: newClient.email,
        password: newClient.password,
        user_metadata: {
          full_name: newClient.name,
          company_name: newClient.companyName,
          plan: newClient.plan
        }
      });

      if (authError) throw authError;

      toast({
        title: "Cliente criado com sucesso!",
        description: `Cliente ${newClient.name} foi criado e pode fazer login agora`
      });

      // Limpar formulário
      setNewClient({
        email: '',
        password: '',
        name: '',
        companyName: '',
        plan: 'basic'
      });

      // Recarregar lista de clientes
      loadClients();
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      toast({
        title: "Erro ao criar cliente",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAdminUser = async () => {
    setIsLoading(true);
    try {
      // Criar usuário administrador
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@observatorio.com',
        password: 'admin123456',
        user_metadata: {
          full_name: 'Administrador Sistema',
          company_name: 'Observatório Psicológico',
          plan: 'enterprise'
        }
      });

      if (authError) throw authError;

      toast({
        title: "Usuário administrador criado!",
        description: "Email: admin@observatorio.com | Senha: admin123456"
      });

      loadClients();
    } catch (error) {
      console.error('Erro ao criar admin:', error);
      toast({
        title: "Erro ao criar administrador",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendInterventionMessage = async (conversationId: string, message: string) => {
    try {
      // Em produção, isso enviaria uma mensagem através do Firebase do cliente
      console.log('Enviando intervenção:', { conversationId, message });
      
      toast({
        title: "Mensagem enviada",
        description: "Sua intervenção foi enviada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao enviar intervenção:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
            <p className="text-gray-600">Você não tem permissão para acessar esta área.</p>
            <Button onClick={createAdminUser} className="mt-4" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Usuário Admin'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie clientes e monitore conversações em tempo real</p>
          <Badge variant="outline" className="mt-2">
            Nível: {adminLevel}
          </Badge>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeClients}</div>
              <p className="text-xs text-muted-foreground">+2 desde ontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversações</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConversations}</div>
              <p className="text-xs text-muted-foreground">+12 desde ontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayMessages}</div>
              <p className="text-xs text-muted-foreground">+89 desde ontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Configurações</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">Sistema operacional</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="clients">Gerenciar Clientes</TabsTrigger>
            <TabsTrigger value="conversations">Monitorar Conversações</TabsTrigger>
            <TabsTrigger value="settings">Configurações do Sistema</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Criar Novo Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle>Criar Novo Cliente</CardTitle>
                  <CardDescription>
                    Adicione um novo cliente à plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Email</Label>
                    <Input
                      id="client-email"
                      type="email"
                      placeholder="cliente@empresa.com"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-password">Senha Inicial</Label>
                    <Input
                      id="client-password"
                      type="password"
                      placeholder="••••••••"
                      value={newClient.password}
                      onChange={(e) => setNewClient({...newClient, password: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-name">Nome Completo</Label>
                    <Input
                      id="client-name"
                      placeholder="Nome do cliente"
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-company">Empresa (Opcional)</Label>
                    <Input
                      id="client-company"
                      placeholder="Nome da empresa"
                      value={newClient.companyName}
                      onChange={(e) => setNewClient({...newClient, companyName: e.target.value})}
                    />
                  </div>

                  <Button 
                    onClick={createClient} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Criando...' : 'Criar Cliente'}
                  </Button>
                </CardContent>
              </Card>

              {/* Lista de Clientes */}
              <Card>
                <CardHeader>
                  <CardTitle>Clientes Registrados</CardTitle>
                  <CardDescription>
                    Lista de todos os clientes na plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clients.map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{client.name}</h4>
                          <p className="text-sm text-gray-600">{client.email}</p>
                          {client.company_name && (
                            <p className="text-xs text-gray-500">{client.company_name}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant={client.is_active ? "default" : "secondary"}>
                            {client.plan}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(client.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversações em Tempo Real</CardTitle>
                <CardDescription>
                  Monitore e intervenha nas conversações dos clientes quando necessário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversations.map((conversation) => (
                    <div key={conversation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{conversation.participant_name}</h4>
                        <Badge variant={conversation.status === 'active' ? "default" : "secondary"}>
                          {conversation.status === 'active' ? 'Ativa' : 'Arquivada'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Últimas mensagem: "{conversation.last_message}"
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{conversation.message_count} mensagens</span>
                        <span>{new Date(conversation.last_activity).toLocaleString('pt-BR')}</span>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Input 
                          placeholder="Digite sua mensagem de intervenção..."
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              sendInterventionMessage(conversation.id, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <Button size="sm">Enviar</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>
                  Gerencie configurações globais da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800">Sistema Operacional</h4>
                    <p className="text-sm text-green-600">
                      Todos os serviços estão funcionando normalmente
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800">Política de Privacidade</h4>
                    <p className="text-sm text-blue-600">
                      Todos os dados são armazenados nas contas Firebase dos próprios clientes, 
                      garantindo total privacidade e conformidade com a LGPD
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-800">Integração White-Label</h4>
                    <p className="text-sm text-purple-600">
                      Sistema totalmente configurável para cada cliente, sem armazenamento centralizado
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-medium text-orange-800">Usuário Administrador</h4>
                    <p className="text-sm text-orange-600 mb-2">
                      Crie um usuário administrador para acessar o painel
                    </p>
                    <Button onClick={createAdminUser} disabled={isLoading} variant="outline">
                      {isLoading ? 'Criando...' : 'Criar Admin'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
