
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search, Phone, Calendar, BarChart3 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  phone: string;
  createdAt: Date;
  lastActivity: Date;
  messagesCount: number;
  status: 'active' | 'inactive' | 'blocked';
}

const sampleClients: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    phone: '+55 11 99999-9999',
    createdAt: new Date('2024-01-15'),
    lastActivity: new Date('2024-01-20'),
    messagesCount: 150,
    status: 'active'
  },
  {
    id: '2',
    name: 'Maria Santos',
    phone: '+55 11 88888-8888',
    createdAt: new Date('2024-01-10'),
    lastActivity: new Date('2024-01-19'),
    messagesCount: 89,
    status: 'active'
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    phone: '+55 11 77777-7777',
    createdAt: new Date('2024-01-05'),
    lastActivity: new Date('2024-01-12'),
    messagesCount: 23,
    status: 'inactive'
  }
];

export function ClientConfig() {
  const [clients, setClients] = useState<Client[]>(sampleClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '' });
  const { toast } = useToast();

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const handleAddClient = () => {
    if (!newClient.name || !newClient.phone) {
      toast({
        title: "Erro",
        description: "Nome e telefone são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const client: Client = {
      id: Date.now().toString(),
      name: newClient.name,
      phone: newClient.phone,
      createdAt: new Date(),
      lastActivity: new Date(),
      messagesCount: 0,
      status: 'active'
    };

    setClients(prev => [...prev, client]);
    setNewClient({ name: '', phone: '' });
    setShowAddForm(false);
    toast({
      title: "Cliente adicionado",
      description: "Novo cliente cadastrado com sucesso",
    });
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

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Client['status']) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'blocked': return 'Bloqueado';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciar Clientes</h2>
          <p className="text-slate-600">Visualize e gerencie todos os clientes conectados</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Cliente
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <p className="text-2xl font-bold">{clients.filter(c => c.status === 'active').length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total de Mensagens</p>
                <p className="text-2xl font-bold">{clients.reduce((acc, c) => acc + c.messagesCount, 0)}</p>
              </div>
              <Phone className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar cliente por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Formulário de novo cliente */}
      {showAddForm && (
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Adicionar Novo Cliente</CardTitle>
            <CardDescription>Cadastre um novo cliente no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client-name">Nome Completo</Label>
                <Input
                  id="client-name"
                  value={newClient.name}
                  onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <Label htmlFor="client-phone">Telefone</Label>
                <Input
                  id="client-phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+55 11 99999-9999"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddClient}>Adicionar Cliente</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{client.name}</CardTitle>
                <Badge className={getStatusColor(client.status)}>
                  {getStatusText(client.status)}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {client.phone}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Cadastrado em:</span>
                  <span>{client.createdAt.toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Última atividade:</span>
                  <span>{client.lastActivity.toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total de mensagens:</span>
                  <span className="font-medium">{client.messagesCount}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                {client.status !== 'active' && (
                  <Button 
                    size="sm" 
                    onClick={() => handleStatusChange(client.id, 'active')}
                    className="bg-green-600 hover:bg-green-700"
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
    </div>
  );
}
