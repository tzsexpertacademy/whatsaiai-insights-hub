
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Wifi, WifiOff, CheckCircle, Loader2, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

interface ClientSession {
  id: string;
  status: 'disconnected' | 'waiting-qr' | 'connected' | 'initializing';
  qrCode?: string;
  phoneNumber?: string;
  lastConnection?: string;
}

const API_BASE_URL = 'http://localhost:3010';

export function SimpleWhatsAppClient() {
  const [session, setSession] = useState<ClientSession>({
    id: '',
    status: 'disconnected'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Gerar ID único baseado no usuário
  const clientId = `client_${user?.id || 'guest'}_${Date.now()}`;

  const connectWhatsApp = async () => {
    try {
      setIsLoading(true);
      
      // 1. Criar cliente automaticamente
      const createResponse = await fetch(`${API_BASE_URL}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: user?.email || 'Cliente',
          company: 'Auto-gerado'
        })
      });

      if (!createResponse.ok) {
        throw new Error('Erro ao criar sessão');
      }

      const client = await createResponse.json();
      
      // 2. Gerar QR Code automaticamente
      const qrResponse = await fetch(`${API_BASE_URL}/api/clients/${client.id}/qr`);
      
      if (!qrResponse.ok) {
        throw new Error('Erro ao gerar QR Code');
      }

      const qrData = await qrResponse.json();
      
      setSession({
        id: client.id,
        status: 'waiting-qr',
        qrCode: qrData.qrCode
      });

      toast({
        title: "✅ QR Code gerado!",
        description: "Escaneie com seu WhatsApp Business para conectar"
      });

      // 3. Verificar conexão automaticamente
      checkConnection(client.id);

    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível conectar. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkConnection = async (clientId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}/status`);
        if (response.ok) {
          const status = await response.json();
          
          setSession(prev => ({
            ...prev,
            status: status.status,
            phoneNumber: status.phoneNumber,
            lastConnection: status.lastConnection
          }));

          if (status.status === 'connected') {
            clearInterval(interval);
            toast({
              title: "🎉 WhatsApp Conectado!",
              description: `Conectado com sucesso ao número ${status.phoneNumber}`
            });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 3000);

    // Parar verificação após 5 minutos
    setTimeout(() => clearInterval(interval), 300000);
  };

  const disconnectWhatsApp = async () => {
    if (!session.id) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/clients/${session.id}/disconnect`, {
        method: 'POST'
      });

      if (response.ok) {
        setSession({
          id: '',
          status: 'disconnected'
        });
        
        toast({
          title: "🔌 Desconectado",
          description: "WhatsApp foi desconectado com sucesso"
        });
      }
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  };

  const getStatusBadge = () => {
    switch (session.status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><Wifi className="h-3 w-3 mr-1" />Conectado</Badge>;
      case 'waiting-qr':
        return <Badge className="bg-yellow-100 text-yellow-800"><QrCode className="h-3 w-3 mr-1" />Aguardando QR</Badge>;
      case 'initializing':
        return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Inicializando</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800"><WifiOff className="h-3 w-3 mr-1" />Desconectado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Status */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-green-600" />
                Conectar WhatsApp Business
              </CardTitle>
              <CardDescription>
                Conecte seu WhatsApp Business de forma simples e rápida
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardContent className="p-8">
          {session.status === 'connected' ? (
            // Estado Conectado
            <div className="text-center space-y-6">
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-2">WhatsApp Conectado!</h3>
                <p className="text-green-700 mb-4">
                  Seu WhatsApp Business está conectado e funcionando
                </p>
                <div className="space-y-2 text-sm text-green-600">
                  <p><strong>Número:</strong> {session.phoneNumber}</p>
                  <p><strong>Conectado em:</strong> {new Date(session.lastConnection || '').toLocaleString('pt-BR')}</p>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">✨ Agora você pode:</h4>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• Receber mensagens automaticamente</li>
                  <li>• Usar respostas automáticas inteligentes</li>
                  <li>• Integrar com outros sistemas</li>
                  <li>• Monitorar conversas em tempo real</li>
                </ul>
              </div>
              
              <Button 
                onClick={disconnectWhatsApp}
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                <WifiOff className="h-4 w-4 mr-2" />
                Desconectar WhatsApp
              </Button>
            </div>
          ) : session.status === 'waiting-qr' && session.qrCode ? (
            // Estado Aguardando QR Code
            <div className="text-center space-y-6">
              <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 mx-auto max-w-sm">
                <img 
                  src={session.qrCode} 
                  alt="QR Code WhatsApp" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3">📱 Como conectar:</h4>
                <ol className="text-sm text-blue-700 space-y-2 text-left">
                  <li>1. Abra o <strong>WhatsApp Business</strong> no seu celular</li>
                  <li>2. Toque nos <strong>três pontos (⋮)</strong> e depois em <strong>"Aparelhos conectados"</strong></li>
                  <li>3. Toque em <strong>"Conectar um aparelho"</strong></li>
                  <li>4. <strong>Escaneie este QR Code</strong> com a câmera</li>
                </ol>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-700">
                  ⏱️ <strong>Verificando conexão automaticamente...</strong><br/>
                  O sistema detectará quando você escanear o código
                </p>
              </div>
            </div>
          ) : (
            // Estado Inicial
            <div className="text-center space-y-6">
              <div className="p-8 bg-gray-50 rounded-lg border border-gray-200">
                <MessageSquare className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Conecte seu WhatsApp Business
                </h3>
                <p className="text-gray-600 mb-6">
                  Clique no botão abaixo para gerar automaticamente seu QR Code e conectar seu WhatsApp Business de forma segura
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <div className="font-medium text-gray-900">1. Automático</div>
                    <div className="text-gray-600">QR Code gerado automaticamente</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <div className="font-medium text-gray-900">2. Seguro</div>
                    <div className="text-gray-600">Conexão isolada e privada</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <div className="font-medium text-gray-900">3. Rápido</div>
                    <div className="text-gray-600">Conexão em segundos</div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={connectWhatsApp}
                disabled={isLoading}
                size="lg"
                className="w-full max-w-md mx-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Preparando conexão...
                  </>
                ) : (
                  <>
                    <QrCode className="h-5 w-5 mr-2" />
                    Conectar WhatsApp Business
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-500">
                Sua conexão será totalmente privada e isolada de outros usuários
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
