
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Globe, Settings, MessageSquare } from 'lucide-react';

interface WhatsAppWebConfigProps {
  webConfig: {
    sessionName: string;
    autoReply: boolean;
    welcomeMessage: string;
  };
  updateWebConfig: (config: Partial<WhatsAppWebConfigProps['webConfig']>) => void;
}

export function WhatsAppWebConfig({ webConfig, updateWebConfig }: WhatsAppWebConfigProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Globe className="h-5 w-5" />
            WhatsApp Web Simples
            <Badge className="bg-green-100 text-green-800">RECOMENDADO</Badge>
          </CardTitle>
          <CardDescription className="text-green-700">
            Conecta igual WhatsApp Web - escaneia QR Code e pronto!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-100 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">✨ Vantagens:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>Super fácil:</strong> Funciona igual WhatsApp Web</li>
              <li>• <strong>Tempo real:</strong> Mensagens chegam automaticamente</li>
              <li>• <strong>Sem servidor:</strong> Não precisa instalar nada</li>
              <li>• <strong>Gratuito:</strong> 100% gratuito para sempre</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionName">Nome da Sessão</Label>
              <Input
                id="sessionName"
                placeholder="Minha Empresa - WhatsApp"
                value={webConfig.sessionName}
                onChange={(e) => updateWebConfig({ sessionName: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Resposta Automática</Label>
                <p className="text-sm text-gray-500">
                  Enviar mensagem automática para novos contatos
                </p>
              </div>
              <Switch
                checked={webConfig.autoReply}
                onCheckedChange={(checked) => updateWebConfig({ autoReply: checked })}
              />
            </div>

            {webConfig.autoReply && (
              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
                <Input
                  id="welcomeMessage"
                  placeholder="Olá! Obrigado por entrar em contato. Como posso ajudar?"
                  value={webConfig.welcomeMessage}
                  onChange={(e) => updateWebConfig({ welcomeMessage: e.target.value })}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Como usar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
              <h3 className="font-medium text-blue-900 mb-1">Conectar</h3>
              <p className="text-sm text-blue-700">Clique em "Conectar WhatsApp" e escaneie o QR Code</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
              <h3 className="font-medium text-green-900 mb-1">Receber</h3>
              <p className="text-sm text-green-700">Mensagens aparecem automaticamente no sistema</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
              <h3 className="font-medium text-purple-900 mb-1">Responder</h3>
              <p className="text-sm text-purple-700">Digite e envie respostas direto pelo sistema</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
