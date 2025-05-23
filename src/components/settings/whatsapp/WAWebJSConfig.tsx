
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Code, Server, MessageSquare } from 'lucide-react';

interface WAWebJSConfigProps {
  wawebjsConfig: {
    serverUrl: string;
    clientId: string;
    autoRestart: boolean;
  };
  updateWAWebJSConfig: (config: Partial<{
    serverUrl: string;
    clientId: string;
    autoRestart: boolean;
  }>) => void;
}

export function WAWebJSConfig({ wawebjsConfig, updateWAWebJSConfig }: WAWebJSConfigProps) {
  const { toast } = useToast();
  const [testLoading, setTestLoading] = useState(false);
  
  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações do WhatsApp Web JS foram salvas com sucesso"
    });
  };
  
  const testConnection = async () => {
    if (!wawebjsConfig.serverUrl) {
      toast({
        title: "URL inválida",
        description: "Por favor, informe a URL do servidor WhatsApp Web JS",
        variant: "destructive"
      });
      return;
    }
    
    setTestLoading(true);
    
    try {
      const testUrl = `${wawebjsConfig.serverUrl}/status`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        toast({
          title: "Conexão bem-sucedida",
          description: "Servidor WhatsApp Web JS está online"
        });
      } else {
        toast({
          title: "Erro de conexão",
          description: "Não foi possível se conectar ao servidor",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível se conectar ao servidor: " + (error instanceof Error ? error.message : 'Erro desconhecido'),
        variant: "destructive"
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-violet-600" />
            Configuração do Servidor WhatsApp Web JS
          </CardTitle>
          <CardDescription>
            Configure a conexão com o servidor Node.js que executa a biblioteca WhatsApp Web JS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="server-url">URL do Servidor</Label>
            <Input
              id="server-url"
              placeholder="https://seu-servidor-wawebjs.herokuapp.com"
              value={wawebjsConfig.serverUrl}
              onChange={(e) => updateWAWebJSConfig({ serverUrl: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              URL do servidor Node.js que executa a biblioteca WhatsApp Web JS
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client-id">ID do Cliente</Label>
            <Input
              id="client-id"
              placeholder="cliente_123"
              value={wawebjsConfig.clientId}
              onChange={(e) => updateWAWebJSConfig({ clientId: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Identificador único para sua sessão (opcional)
            </p>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="auto-restart">Reinício Automático</Label>
              <p className="text-xs text-gray-500">Reiniciar automaticamente se a conexão cair</p>
            </div>
            <Switch
              id="auto-restart"
              checked={wawebjsConfig.autoRestart}
              onCheckedChange={(checked) => updateWAWebJSConfig({ autoRestart: checked })}
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1">
              Salvar Configurações
            </Button>
            <Button 
              onClick={testConnection} 
              variant="outline" 
              disabled={testLoading}
              className="flex items-center gap-2"
            >
              {testLoading ? "Testando..." : "Testar Conexão"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-600" />
            Sobre WhatsApp Web JS
          </CardTitle>
          <CardDescription>
            Informações sobre esta biblioteca não oficial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h4 className="font-medium text-indigo-900 mb-2">O que é WhatsApp Web JS?</h4>
              <p className="text-sm text-indigo-700">
                WhatsApp Web JS é uma biblioteca Node.js que permite interagir com o WhatsApp Web
                de forma programática. Ela usa Puppeteer para automatizar o navegador e oferece uma API
                estruturada para enviar e receber mensagens.
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Como implementar:</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Configure um servidor Node.js (Heroku, Vercel, etc)</li>
                <li>Instale a biblioteca whatsapp-web.js</li>
                <li>Crie endpoints REST para controlar o cliente</li>
                <li>Configure webhooks para receber eventos</li>
                <li>Conecte esta interface ao seu servidor</li>
              </ol>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Importante:
              </h4>
              <p className="text-sm text-amber-700">
                Como esta é uma solução não oficial, ela pode parar de funcionar se o WhatsApp mudar
                sua interface web. Use por sua conta e risco e considere as soluções oficiais para
                ambientes de produção.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
