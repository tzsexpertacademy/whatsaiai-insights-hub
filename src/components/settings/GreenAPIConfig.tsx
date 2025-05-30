
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";
import { Globe, CheckCircle, AlertCircle, Loader2, QrCode } from 'lucide-react';

export function GreenAPIConfig() {
  const { toast } = useToast();
  const { whatsappConfig, updateWhatsAppConfig, isSaving } = useWhatsAppConfig();
  const { connectionState, checkConnection } = useWhatsAppConnection();
  
  const [formData, setFormData] = useState({
    instanceId: '',
    apiToken: ''
  });

  // Sincronizar form com config
  useEffect(() => {
    setFormData({
      instanceId: whatsappConfig.instanceId || '',
      apiToken: whatsappConfig.apiToken || ''
    });
  }, [whatsappConfig]);

  const handleSave = async () => {
    if (!formData.instanceId.trim() || !formData.apiToken.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Instance ID e API Token são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    console.log('💾 Salvando configurações GREEN-API...');
    
    const success = await updateWhatsAppConfig({
      instanceId: formData.instanceId.trim(),
      apiToken: formData.apiToken.trim()
    });

    if (success) {
      // Verificar conexão após salvar
      setTimeout(() => {
        checkConnection(formData.instanceId.trim(), formData.apiToken.trim());
      }, 1000);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.instanceId || !formData.apiToken) {
      toast({
        title: "Configure primeiro",
        description: "Salve as configurações antes de testar",
        variant: "destructive"
      });
      return;
    }

    await checkConnection(formData.instanceId, formData.apiToken);
  };

  const getStatusBadge = () => {
    if (connectionState.isChecking) {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Verificando...
        </Badge>
      );
    }

    if (connectionState.isConnected) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Conectado
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-600">
        <AlertCircle className="h-3 w-3 mr-1" />
        Desconectado
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Configuração GREEN-API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da Conexão */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Status da Conexão</p>
            {connectionState.phoneNumber && (
              <p className="text-sm text-gray-600">
                Número: {connectionState.phoneNumber}
              </p>
            )}
          </div>
          {getStatusBadge()}
        </div>

        {/* Formulário de Configuração */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instanceId">Instance ID</Label>
            <Input
              id="instanceId"
              value={formData.instanceId}
              onChange={(e) => setFormData(prev => ({ ...prev, instanceId: e.target.value }))}
              placeholder="Digite seu Instance ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiToken">API Token</Label>
            <Input
              id="apiToken"
              type="password"
              value={formData.apiToken}
              onChange={(e) => setFormData(prev => ({ ...prev, apiToken: e.target.value }))}
              placeholder="Digite seu API Token"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Configurações'
            )}
          </Button>
          
          <Button 
            onClick={handleTestConnection}
            variant="outline"
            disabled={connectionState.isChecking || !whatsappConfig.instanceId}
          >
            {connectionState.isChecking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Testar'
            )}
          </Button>
        </div>

        {/* Informações de Ajuda */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Como obter suas credenciais:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Acesse o <a href="https://green-api.com" target="_blank" rel="noopener noreferrer" className="underline">GREEN-API</a></li>
            <li>Crie uma conta e uma instância</li>
            <li>Copie o Instance ID e API Token</li>
            <li>Cole aqui e salve as configurações</li>
          </ol>
        </div>

        {/* Debug Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Instance ID: {whatsappConfig.instanceId ? 'Configurado' : 'Não configurado'}</div>
          <div>API Token: {whatsappConfig.apiToken ? 'Configurado' : 'Não configurado'}</div>
          <div>Última verificação: {connectionState.lastChecked ? new Date(connectionState.lastChecked).toLocaleString('pt-BR') : 'Nunca'}</div>
        </div>
      </CardContent>
    </Card>
  );
}
