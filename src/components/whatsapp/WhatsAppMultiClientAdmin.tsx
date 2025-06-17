
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Wifi, WifiOff, Clock, ExternalLink, Settings, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  company: string;
  status: 'connected' | 'disconnected' | 'waiting-qr' | 'initializing' | 'offline';
  createdAt: string;
  lastConnection: string | null;
}

const API_BASE_URL = 'http://localhost:3010';

export function WhatsAppMultiClientAdmin() {
  const [clients, setClients] = useState<Client[]>([]);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/clients`);
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        throw new Error('Erro ao carregar clientes');
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os clientes. Verifique se o servidor está rodando.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createClient = async () => {
    if (!newClientName.trim()) {
      toast({
        title: "⚠️ Campo obrigatório",
        description: "O nome do cliente é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreating(true);
      const response = await fetch(`${API_BASE_URL}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newClientName,
          company: newClientCompany
        })
      });

      if (response.ok) {
        const newClient = await response.json();
        toast({
          title: "✅ Cliente criado!",
          description: `Cliente ${newClient.name} criado com sucesso`
        });
        setNewClientName('');
        setNewClientCompany('');
        loadClients();
      } else {
        throw new Error('Erro ao criar cliente');
      }
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível criar o cliente",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const disconnectClient = async (clientId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}/disconnect`, {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: "🔌 Cliente desconectado",
          description: "Cliente desconectado com sucesso"
        });
        loadClients();
      } else {
        throw new Error('Erro ao desconectar cliente');
      }
    } catch (error) {
      console.error('Erro ao desconectar cliente:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível desconectar o cliente",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><Wifi className="h-3 w-3 mr-1" />Conectado</Badge>;
      case 'waiting-qr':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Aguardando QR</Badge>;
      case 'initializing':
        return <Badge className="bg-blue-100 text-blue-800"><Settings className="h-3 w-3 mr-1" />Inicializando</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800"><WifiOff className="h-3 w-3 mr-1" />Desconectado</Badge>;
    }
  };

  const openClientInterface = (clientId: string) => {
    window.open(`${API_BASE_URL}/client/${clientId}`, '_blank');
  };

  const openSwaggerDocs = () => {
    window.open(`${API_BASE_URL}/api-docs`, '_blank');
  };

  const getConnectedCount = () => {
    return clients.filter(c => c.status === 'connected').length;
  };

  useEffect(() => {
    loadClients();
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadClients, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                WhatsApp Multi-Cliente SaaS
              </CardTitle>
              <CardDescription>
                Gerencie múltiplas instâncias WhatsApp de forma isolada
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={openSwaggerDocs} variant="outline" size="sm">
                📚 API Docs
              </Button>
              <Button onClick={loadClients} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Total de Clientes</p>
                <p className="text-2xl font-bold text-blue-600">{clients.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Wifi className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Conectados</p>
                <p className="text-2xl font-bold text-green-600">{getConnectedCount()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Settings className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-sm">Servidor API</p>
                <p className="text-sm text-purple-600">Porta 3010</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="clients" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clients">Gerenciar Clientes</TabsTrigger>
          <TabsTrigger value="create">Criar Novo Cliente</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Criar Novo Cliente
              </CardTitle>
              <CardDescription>
                Adicione um novo cliente ao sistema multi-instância
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Cliente *</label>
                  <Input
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Digite o nome do cliente"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Empresa (opcional)</label>
                  <Input
                    value={newClientCompany}
                    onChange={(e) => setNewClientCompany(e.target.value)}
                    placeholder="Digite o nome da empresa"
                  />
                </div>
              </div>
              
              <Button 
                onClick={createClient}
                disabled={isCreating || !newClientName.trim()}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando Cliente...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Cliente
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                Gerencie todos os clientes cadastrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Carregando clientes...</p>
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">Nenhum cliente cadastrado</h3>
                  <p className="text-gray-600 text-sm">
                    Crie seu primeiro cliente na aba "Criar Novo Cliente"
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div key={client.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{client.name}</h3>
                            {getStatusBadge(client.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Empresa:</span> {client.company || 'Não informada'}
                            </div>
                            <div>
                              <span className="font-medium">Criado:</span> {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                            <div>
                              <span className="font-medium">Última conexão:</span> {
                                client.lastConnection 
                                  ? new Date(client.lastConnection).toLocaleDateString('pt-BR')
                                  : 'Nunca'
                              }
                            </div>
                          </div>
                          
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="font-medium">ID:</span> {client.id}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => openClientInterface(client.id)}
                            variant="outline"
                            size="sm"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Acessar
                          </Button>
                          
                          {client.status === 'connected' && (
                            <Button
                              onClick={() => disconnectClient(client.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <WifiOff className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Informações do Sistema */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📋 Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>Servidor API:</strong> http://localhost:3010</div>
          <div><strong>Swagger Docs:</strong> http://localhost:3010/api-docs</div>
          <div><strong>Sessões WhatsApp:</strong> whatsapp-sessions/</div>
          <div><strong>Isolamento:</strong> Cada cliente tem sua própria sessão WhatsApp</div>
          <div><strong>Portas utilizadas:</strong> 3010 (API), Frontend atual</div>
        </CardContent>
      </Card>
    </div>
  );
}
