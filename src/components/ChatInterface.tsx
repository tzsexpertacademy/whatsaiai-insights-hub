
import React from 'react';
import { WPPConnectMirror } from './whatsapp/WPPConnectMirror';
import { PageLayout } from '@/components/layout/PageLayout';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, MessageSquare, WifiOff, RefreshCw, Settings } from 'lucide-react';

export function ChatInterface() {
  const headerActions = (
    <div className="flex items-center gap-2">
      <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        WPPConnect Real - Tempo Real
      </Badge>
    </div>
  );

  const connectionStatus = (
    <Card className="bg-green-50/80 backdrop-blur-sm border-green-200/50 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Conectado e Ativo</span>
            </div>
            <span className="text-sm text-green-600">Conectado</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Verificar Status
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              Atualizar Conversas
            </Button>
            <Button variant="outline" size="sm" className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200">
              Parar Live
            </Button>
            <Button variant="outline" size="sm">
              Desconectar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout
      title="WPPConnect Real - Tempo Real"
      description="Sistema de mensagens em tempo real via WPPConnect API"
      showBackButton={true}
      headerActions={headerActions}
    >
      <div className="space-y-4">
        {connectionStatus}
        <WPPConnectMirror />
      </div>
    </PageLayout>
  );
}
