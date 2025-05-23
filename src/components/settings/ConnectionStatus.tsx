
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Smartphone, Wifi, WifiOff, CheckCircle, Clock } from 'lucide-react';
import { useClientConfig } from "@/contexts/ClientConfigContext";
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";

export function ConnectionStatus() {
  const { config, updateConfig } = useClientConfig();
  const { connectionState, disconnectWhatsApp, getConnectionStatus } = useWhatsAppConnection();
  
  const whatsappConfig = config.whatsapp;
  const connectionStatus = getConnectionStatus();

  const handleDisconnect = async () => {
    disconnectWhatsApp();
    updateConfig('whatsapp', { 
      isConnected: false, 
      qrCode: '' 
    });
  };

  const getConnectionDisplay = () => {
    if (connectionState.isConnected) {
      switch (connectionStatus) {
        case 'active':
          return {
            icon: <Wifi className="h-6 w-6 text-green-500" />,
            text: 'Conectado (Ativo)',
            color: 'text-green-600'
          };
        case 'idle':
          return {
            icon: <Clock className="h-6 w-6 text-yellow-500" />,
            text: 'Conectado (Inativo)',
            color: 'text-yellow-600'
          };
      }
    }
    
    return {
      icon: <WifiOff className="h-6 w-6 text-red-500" />,
      text: 'Desconectado',
      color: 'text-red-600'
    };
  };

  const connectionDisplay = getConnectionDisplay();

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-green-600" />
          Status da Conexão
        </CardTitle>
        <CardDescription>
          Status atual do WhatsApp Business (salvo localmente)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          {connectionDisplay.icon}
          <span className={`font-medium ${connectionDisplay.color}`}>
            {connectionDisplay.text}
          </span>
        </div>
        
        {connectionState.isConnected && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Número conectado: {connectionState.phoneNumber}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Sessão salva desde: {new Date(connectionState.lastConnected).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}

        <div className="mt-4">
          <Label htmlFor="authorized">Número Autorizado (Conselheiro Principal)</Label>
          <Input
            id="authorized"
            placeholder="+55 11 99999-9999"
            value={whatsappConfig.authorizedNumber}
            onChange={(e) => updateConfig('whatsapp', { authorizedNumber: e.target.value })}
            disabled={connectionState.isConnected}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Somente este número receberá respostas do conselheiro principal
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <Label htmlFor="autoReply">Resposta Automática</Label>
            <p className="text-xs text-gray-500">Enviar confirmação automática ao receber mensagens</p>
          </div>
          <Switch
            id="autoReply"
            checked={whatsappConfig.autoReply}
            onCheckedChange={(checked) => updateConfig('whatsapp', { autoReply: checked })}
          />
        </div>

        {connectionState.isConnected && (
          <div className="flex gap-2 mt-4">
            <Button onClick={handleDisconnect} variant="destructive" className="flex-1">
              Desconectar e Limpar Dados
            </Button>
          </div>
        )}

        {connectionState.isConnected && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              💡 <strong>Armazenamento Local:</strong> Sua conexão fica salva no navegador e reconecta automaticamente. 
              A sessão expira em 24 horas por segurança.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
