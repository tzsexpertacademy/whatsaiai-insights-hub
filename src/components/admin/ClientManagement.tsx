
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Calendar, 
  BarChart3, 
  Mail,
  Eye,
  Settings,
  Activity,
  MessageSquare
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { EmailService } from './EmailService';
import { ClientConfig } from '@/components/settings/ClientConfig';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: 'basic' | 'premium' | 'enterprise';
  createdAt: Date;
  lastActivity: Date;
  messagesCount: number;
  status: 'active' | 'inactive' | 'blocked';
  whatsappConnected: boolean;
  totalConversations: number;
}

const sampleClients: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@empresa.com',
    phone: '+55 11 99999-9999',
    plan: 'premium',
    createdAt: new Date('2024-01-15'),
    lastActivity: new Date('2024-01-20'),
    messagesCount: 150,
    status: 'active',
    whatsappConnected: true,
    totalConversations: 25
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@empresa.com',
    phone: '+55 11 88888-8888',
    plan: 'enterprise',
    createdAt: new Date('2024-01-10'),
    lastActivity: new Date('2024-01-19'),
    messagesCount: 89,
    status: 'active',
    whatsappConnected: true,
    totalConversations: 18
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro@empresa.com',
    phone: '+55 11 77777-7777',
    plan: 'basic',
    createdAt: new Date('2024-01-05'),
    lastActivity: new Date('2024-01-12'),
    messagesCount: 23,
    status: 'inactive',
    whatsappConnected: false,
    totalConversations: 5
  }
];

export function ClientManagement() {
  const [clients, setClients] = useState<Client[]>(sampleClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { toast } = useToast();

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlanColor = (plan: Client['plan']) => {
    switch (plan) {
      case 'basic': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'premium': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'enterprise': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = (clientId: string, newStatus: Client['status']) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, status: newStatus } : client
    ));
    toast({
      title: "Status atualizado",
      description: "Status do cliente alterado com sucesso",
    });
  };

  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalMessages = clients.reduce((acc, c) => acc + c.messagesCount, 0);
  const connectedClients = clients.filter(c => c.whatsappConnected).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Painel de Administração</h1>
        <p className="text-slate-600">Gerencie todos os clientes e suas configurações</p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total de Clientes</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Clientes Ativos</p>
                <p className="text-2xl font-bold">{activeClients}</p>
              </div>
              <Activity className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">WhatsApp Conectado</p>
                <p className="text-2xl font-bold">{connectedClients}</p>
              </div>
              <Phone className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Total Mensagens</p>
                <p className="text-2xl font-bold">{totalMessages}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clients">Gerenciar Clientes</TabsTrigger>
          <TabsTrigger value="create">Criar Novo Cliente</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          {/* Busca */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar cliente por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de clientes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="bg-white/70 backdrop-blur-sm border-white/50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {client.name}
                      {client.whatsappConnected && (
                        <Phone className="h-4 w-4 text-green-600" />
                      )}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(client.status)}>
                        {client.status === 'active' ? 'Ativo' : client.status === 'inactive' ? 'Inativo' : 'Bloqueado'}
                      </Badge>
                      <Badge className={getPlanColor(client.plan)}>
                        {client.plan.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {client.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {client.phone}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Cadastrado:</span>
                      <br />
                      {client.createdAt.toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      <span className="font-medium">Última atividade:</span>
                      <br />
                      {client.lastActivity.toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      <span className="font-medium">Mensagens:</span>
                      <br />
                      {client.messagesCount}
                    </div>
                    <div>
                      <span className="font-medium">Conversas:</span>
                      <br />
                      {client.totalConversations}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedClient(client)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Ver Detalhes
                    </Button>
                    
                    {client.status !== 'active' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusChange(client.id, 'active')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Ativar
                      </Button>
                    )}
                    
                    {client.status !== 'inactive' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(client.id, 'inactive')}
                      >
                        Inativar
                      </Button>
                    )}
                    
                    {client.status !== 'blocked' && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleStatusChange(client.id, 'blocked')}
                      >
                        Bloquear
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardContent className="text-center py-8">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'Nenhum cliente encontrado para a busca' : 'Nenhum cliente cadastrado'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="create">
          <EmailService />
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes do cliente */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Configurações de {selectedClient.name}</CardTitle>
                <Button variant="outline" onClick={() => setSelectedClient(null)}>
                  Fechar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ClientConfig />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
