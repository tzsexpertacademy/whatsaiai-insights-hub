
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Wifi, WifiOff, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useClientConfig } from "@/contexts/ClientConfigContext";
import { useGreenAPI } from "@/hooks/useGreenAPI";

export function WhatsAppConnectionStatus() {
  const { config } = useClientConfig();
  const { greenAPIState, checkConnectionStatus } = useGreenAPI();
  const [isChecking, setIsChecking] = useState(false);

  // Verificar conexão quando o componente carrega
  useEffect(() => {
    if (config?.whatsapp?.greenapi?.instanceId && config?.whatsapp?.greenapi?.apiToken) {
      checkConnectionStatus();
    }
  }, [config?.whatsapp?.greenapi?.instanceId, config?.whatsapp?.greenapi?.apiToken]);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    try {
      await checkConnectionStatus();
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusBadge = () => {
    if (greenAPIState.isConnected) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Conectado</Badge>;
    } else if (config?.whatsapp?.greenapi?.instanceId && config?.whatsapp?.greenapi?.apiToken) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Configurado</Badge>;
    } else {
      return <Badge variant="secondary">Não Configurado</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (greenAPIState.isConnected) {
      return <Wifi className="h-5 w-5 text-green-500" />;
    } else {
      return <WifiOff className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-blue-600" />
          Status da Conexão GREEN-API
        </CardTitle>
        <CardDescription>
          Status da sua conexão WhatsApp Business via GREEN-API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">WhatsApp Business</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button 
              onClick={handleCheckConnection} 
              variant="outline" 
              size="sm"
              disabled={isChecking || !config?.whatsapp?.greenapi?.instanceId}
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {greenAPIState.isConnected && greenAPIState.phoneNumber && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Número conectado: {greenAPIState.phoneNumber}</span>
            </div>
            
            {greenAPIState.lastConnected && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>
                  Verificado em: {new Date(greenAPIState.lastConnected).toLocaleDateString('pt-BR')} às {new Date(greenAPIState.lastConnected).toLocaleTimeString('pt-BR')}
                </span>
              </div>
            )}

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                ✅ <strong>WhatsApp conectado!</strong> Agora você pode receber e enviar mensagens automaticamente.
              </p>
            </div>
          </div>
        )}

        {!greenAPIState.isConnected && config?.whatsapp?.greenapi?.instanceId && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-700">
              ⚠️ <strong>GREEN-API configurado mas não conectado.</strong> Gere um QR Code na aba GREEN-API para conectar.
            </p>
          </div>
        )}

        {!config?.whatsapp?.greenapi?.instanceId && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              📱 Configure suas credenciais GREEN-API na aba correspondente para conectar seu WhatsApp Business.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
