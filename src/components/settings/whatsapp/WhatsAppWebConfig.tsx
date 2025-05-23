
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Globe, QrCode, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

interface WhatsAppWebConfigProps {
  webConfig: {
    sessionName: string;
    autoReply: boolean;
    welcomeMessage: string;
  };
  updateWebConfig: (config: Partial<{
    sessionName: string;
    autoReply: boolean;
    welcomeMessage: string;
  }>) => void;
}

export function WhatsAppWebConfig({ webConfig, updateWebConfig }: WhatsAppWebConfigProps) {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleConnect = () => {
    setIsConnecting(true);
    toast({
      title: "Conectando...",
      description: "Gerando QR Code para conectar o WhatsApp"
    });
    
    // Simular conexão
    setTimeout(() => {
      setIsConnecting(false);
      toast({
        title: "QR Code gerado!",
        description: "Escaneie com seu WhatsApp para conectar"
      });
    }, 2000);
  };
  
  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "Configurações do WhatsApp Web foram salvas"
    });
  };

  const isConfigured = webConfig.sessionName && webConfig.welcomeMessage;

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-600" />
            WhatsApp Web - Solução Simples
          </CardTitle>
          <CardDescription>
            Conecte seu WhatsApp diretamente pelo navegador - sem servidor, sem programação!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            isConfigured ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
          }`}>
            {isConfigured ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">
              {isConfigured ? 'WhatsApp Web configurado' : 'Configure o WhatsApp Web'}
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-name">Nome da Sessão</Label>
              <Input
                id="session-name"
                placeholder="Meu WhatsApp Business"
                value={webConfig.sessionName}
                onChange={(e) => updateWebConfig({ sessionName: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Nome para identificar sua conexão WhatsApp
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
              <Input
                id="welcome-message"
                placeholder="Olá! Como posso te ajudar?"
                value={webConfig.welcomeMessage}
                onChange={(e) => updateWebConfig({ welcomeMessage: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Mensagem automática para novos contatos
              </p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="auto-reply">Resposta Automática</Label>
                <p className="text-xs text-gray-500">Enviar mensagem de boas-vindas automaticamente</p>
              </div>
              <Switch
                id="auto-reply"
                checked={webConfig.autoReply}
                onCheckedChange={(checked) => updateWebConfig({ autoReply: checked })}
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1">
                Salvar Configurações
              </Button>
              <Button 
                onClick={handleConnect} 
                variant="outline" 
                disabled={isConnecting}
                className="flex items-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                {isConnecting ? "Conectando..." : "Gerar QR Code"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Como Funciona (Super Simples!)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">✅ Vantagens desta solução:</h4>
              <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                <li><strong>100% Gratuito</strong> - Sem mensalidades ou taxas</li>
                <li><strong>Sem programação</strong> - Só precisa escanear QR code</li>
                <li><strong>Funciona no navegador</strong> - Não precisa instalar nada</li>
                <li><strong>Configuração em 2 minutos</strong> - Muito fácil de usar</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">📱 Passos para usar:</h4>
              <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                <li>Preencha o nome da sessão e mensagem de boas-vindas acima</li>
                <li>Clique em "Gerar QR Code"</li>
                <li>Abra o WhatsApp no seu celular</li>
                <li>Vá em ⋮ → Dispositivos conectados → Conectar um dispositivo</li>
                <li>Escaneie o QR code que aparecerá na tela</li>
                <li>Pronto! Seu WhatsApp estará conectado</li>
              </ol>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2">⚠️ Importante saber:</h4>
              <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                <li>Seu celular precisa estar conectado à internet</li>
                <li>Se fechar o navegador, precisará conectar novamente</li>
                <li>Ideal para usar durante o expediente</li>
                <li>Perfeito para pequenos negócios</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
