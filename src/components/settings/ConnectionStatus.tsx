
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Smartphone, Wifi, WifiOff, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useClientConfig } from "@/contexts/ClientConfigContext";

export function ConnectionStatus() {
  const { config, updateConfig, saveConfig } = useClientConfig();
  const { toast } = useToast();

  const whatsappConfig = config.whatsapp;

  const handleDisconnect = async () => {
    updateConfig('whatsapp', { 
      isConnected: false, 
      qrCode: '' 
    });
    
    await saveConfig();
    
    toast({
      title: "Desconectado",
      description: "WhatsApp Business desconectado",
    });
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-green-600" />
          Status da Conexão
        </CardTitle>
        <CardDescription>
          Status atual do WhatsApp Business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          {whatsappConfig.isConnected ? (
            <>
              <Wifi className="h-6 w-6 text-green-500" />
              <span className="text-green-600 font-medium">Conectado</span>
            </>
          ) : (
            <>
              <WifiOff className="h-6 w-6 text-red-500" />
              <span className="text-red-600 font-medium">Desconectado</span>
            </>
          )}
        </div>
        
        {whatsappConfig.isConnected && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Número autorizado: {whatsappConfig.authorizedNumber}
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
            disabled={whatsappConfig.isConnected}
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

        {whatsappConfig.isConnected && (
          <div className="flex gap-2 mt-4">
            <Button onClick={handleDisconnect} variant="destructive" className="flex-1">
              Desconectar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
