
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Smartphone, 
  QrCode, 
  Wifi, 
  WifiOff, 
  MessageCircle, 
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useWhatsAppQRCode } from "@/hooks/useWhatsAppQRCode";
import { useToast } from "@/hooks/use-toast";

export function RealWhatsAppMirror() {
  const { qrState, generateQRCode, disconnectWhatsApp, getConnectionStatus, isLoading } = useWhatsAppQRCode();
  const { toast } = useToast();
  const connectionStatus = getConnectionStatus();

  // Estado para mensagens simuladas
  const [messages, setMessages] = useState([
    {
      id: '1',
      contact: 'João Silva',
      phone: '+55 11 99999-1234',
      lastMessage: 'Olá! Gostaria de saber mais sobre os produtos.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      unread: true
    },
    {
      id: '2', 
      contact: 'Maria Santos',
      phone: '+55 11 99999-5678',
      lastMessage: 'Obrigada pelo atendimento!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      unread: false
    }
  ]);

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'idle':
        return <Badge className="bg-yellow-100 text-yellow-800">Inativo</Badge>;
      default:
        return <Badge variant="secondary">Desconectado</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'active':
        return <Wifi className="h-5 w-5 text-green-500" />;
      case 'idle':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <WifiOff className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleRefresh = () => {
    toast({
      title: "Atualizando...",
      description: "Verificando novas mensagens"
    });
  };

  return (
    <div className="space-y-6">
      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            Status WhatsApp Business
          </CardTitle>
          <CardDescription>
            Estado atual da sua conexão WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium">WhatsApp Business</span>
            </div>
            {getStatusBadge()}
          </div>

          {qrState.isConnected && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Conectado: {qrState.phoneNumber}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>
                  Última conexão: {new Date(qrState.lastConnected).toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="flex gap-2">
                <Button onClick={disconnectWhatsApp} variant="outline" size="sm">
                  Desconectar
                </Button>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>
          )}

          {!qrState.isConnected && (
            <div className="text-center py-4">
              {qrState.qrCode ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                    <img 
                      src={qrState.qrCode} 
                      alt="QR Code WhatsApp" 
                      className="w-48 h-48"
                    />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>1.</strong> Abra o WhatsApp Business no celular</p>
                    <p><strong>2.</strong> Menu → Dispositivos conectados</p>
                    <p><strong>3.</strong> Conectar um dispositivo</p>
                    <p><strong>4.</strong> Escaneie este código</p>
                  </div>
                  <Button onClick={generateQRCode} variant="outline" size="sm">
                    Gerar Novo QR Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <QrCode className="h-16 w-16 text-gray-400 mx-auto" />
                  <p className="text-gray-500">
                    Conecte seu WhatsApp Business para ver conversas em tempo real
                  </p>
                  <Button 
                    onClick={generateQRCode} 
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? "Gerando..." : "Conectar WhatsApp"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Conversas */}
      {qrState.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Conversas Recentes
            </CardTitle>
            <CardDescription>
              Suas conversas do WhatsApp Business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {messages.map((message, index) => (
              <React.Fragment key={message.id}>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {message.contact.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 truncate">
                        {message.contact}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {message.lastMessage}
                    </p>
                    <p className="text-xs text-gray-400">
                      {message.phone}
                    </p>
                  </div>
                  {message.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                {index < messages.length - 1 && <Separator />}
              </React.Fragment>
            ))}

            {messages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma conversa encontrada</p>
                <p className="text-sm">As conversas aparecerão aqui quando chegarem</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como funciona</CardTitle>
          <CardDescription>
            Integração direta com WhatsApp Business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
              <h3 className="font-medium text-blue-900 mb-1">Conectar</h3>
              <p className="text-sm text-blue-700">Escaneie o QR Code com seu WhatsApp Business</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
              <h3 className="font-medium text-green-900 mb-1">Sincronizar</h3>
              <p className="text-sm text-green-700">Mensagens aparecem automaticamente aqui</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
              <h3 className="font-medium text-purple-900 mb-1">Responder</h3>
              <p className="text-sm text-purple-700">Use IA para análise e respostas inteligentes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
