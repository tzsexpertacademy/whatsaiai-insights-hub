
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function ConnectionStatus() {
  const [status, setStatus] = useState({
    openai: 'checking',
    firebase: 'checking',
    whatsapp: 'checking'
  });
  const { toast } = useToast();

  const checkConnections = async () => {
    console.log('🔍 Verificando status das conexões...');
    
    // Check OpenAI
    const openaiKey = localStorage.getItem('openai_api_key');
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
          },
        });
        setStatus(prev => ({ 
          ...prev, 
          openai: response.ok ? 'connected' : 'error' 
        }));
      } catch (error) {
        setStatus(prev => ({ ...prev, openai: 'error' }));
      }
    } else {
      setStatus(prev => ({ ...prev, openai: 'disconnected' }));
    }

    // Check Firebase
    const firebaseConfig = localStorage.getItem('firebase_config');
    setStatus(prev => ({ 
      ...prev, 
      firebase: firebaseConfig ? 'connected' : 'disconnected' 
    }));

    // Check WhatsApp
    const whatsappConfig = localStorage.getItem('whatsapp_config');
    setStatus(prev => ({ 
      ...prev, 
      whatsapp: whatsappConfig ? 'connected' : 'disconnected' 
    }));

    toast({
      title: "Status atualizado",
      description: "Verificação de conexões concluída",
    });
  };

  useEffect(() => {
    checkConnections();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'checking': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'checking': return <RefreshCw className="w-4 h-4 animate-spin" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="w-5 h-5" />
          Status das Conexões
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="font-medium">OpenAI API</span>
            <Badge className={getStatusColor(status.openai)}>
              {getStatusIcon(status.openai)}
              <span className="ml-1 capitalize">{status.openai}</span>
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="font-medium">Firebase</span>
            <Badge className={getStatusColor(status.firebase)}>
              {getStatusIcon(status.firebase)}
              <span className="ml-1 capitalize">{status.firebase}</span>
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="font-medium">WhatsApp</span>
            <Badge className={getStatusColor(status.whatsapp)}>
              {getStatusIcon(status.whatsapp)}
              <span className="ml-1 capitalize">{status.whatsapp}</span>
            </Badge>
          </div>
        </div>

        <Button 
          onClick={checkConnections} 
          className="w-full"
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Verificar Novamente
        </Button>
      </CardContent>
    </Card>
  );
}
