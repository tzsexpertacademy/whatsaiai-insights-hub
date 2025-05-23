
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Wifi, WifiOff, QrCode } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function WhatsAppConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  const handleConnect = () => {
    if (!phoneNumber || !apiKey) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsConnected(true);
    toast({
      title: "Conectado!",
      description: "WhatsApp conectado com sucesso",
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast({
      title: "Desconectado",
      description: "WhatsApp desconectado",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Conexão WhatsApp</h1>
        <p className="text-slate-600">Configure sua conexão com a API do WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              Status da Conexão
            </CardTitle>
            <CardDescription>
              Status atual da sua conexão WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              {isConnected ? (
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
            
            {isConnected && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  Conectado ao número: {phoneNumber}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-blue-600" />
              Configuração
            </CardTitle>
            <CardDescription>
              Configure os dados de conexão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Número do WhatsApp</Label>
              <Input
                id="phone"
                placeholder="+55 11 99999-9999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isConnected}
              />
            </div>
            
            <div>
              <Label htmlFor="apikey">Chave da API OpenAI</Label>
              <Input
                id="apikey"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isConnected}
              />
            </div>

            <div className="flex gap-2">
              {!isConnected ? (
                <Button onClick={handleConnect} className="flex-1">
                  Conectar WhatsApp
                </Button>
              ) : (
                <Button onClick={handleDisconnect} variant="destructive" className="flex-1">
                  Desconectar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Como Conectar</CardTitle>
          <CardDescription>
            Siga os passos abaixo para configurar sua integração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
              <h3 className="font-medium text-blue-900 mb-1">API WhatsApp</h3>
              <p className="text-sm text-blue-700">Configure sua API do WhatsApp Business</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
              <h3 className="font-medium text-green-900 mb-1">OpenAI API</h3>
              <p className="text-sm text-green-700">Insira sua chave da API OpenAI</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
              <h3 className="font-medium text-purple-900 mb-1">Conectar</h3>
              <p className="text-sm text-purple-700">Clique em conectar e comece a usar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
