
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, Smartphone } from 'lucide-react';
import { useCommercialClientConfig } from '@/hooks/useCommercialClientConfig';

export function CommercialWhatsAppConnectionStatus() {
  const { config } = useCommercialClientConfig();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    // Verificar status da conexão comercial
    const checkConnection = () => {
      const whatsappConfig = config?.commercial_whatsapp_config;
      if (whatsappConfig && Object.keys(whatsappConfig).length > 0) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    };

    checkConnection();
  }, [config]);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'disconnected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>;
      case 'disconnected':
        return <Badge className="bg-red-100 text-red-800">Desconectado</Badge>;
      case 'checking':
        return <Badge className="bg-yellow-100 text-yellow-800">Verificando</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Status da Conexão WhatsApp Comercial
          {getStatusIcon()}
        </CardTitle>
        <CardDescription>
          Monitoramento da conexão WhatsApp específica para vendas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              Sistema Comercial WhatsApp
            </p>
            <p className="text-sm text-muted-foreground">
              Configuração independente para análise de vendas
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardContent>
    </Card>
  );
}
