
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCommercialClientConfig } from '@/hooks/useCommercialClientConfig';

export function CommercialFirebaseConfig() {
  const [config, setConfig] = useState({
    projectId: '',
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    serviceAccountKey: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { updateConfig } = useCommercialClientConfig();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateConfig({
        commercial_firebase_config: {
          ...config,
          module: 'commercial',
          configured_at: new Date().toISOString()
        }
      });
      
      toast({
        title: "Configuração Firebase Comercial salva",
        description: "As configurações do Firebase para vendas foram atualizadas",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar configuração",
        description: "Não foi possível salvar as configurações do Firebase comercial",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuração Firebase Comercial
          </CardTitle>
          <CardDescription>
            Configure o Firebase especificamente para dados de vendas e análise comercial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              Esta configuração é independente e específica para o módulo comercial.
              Os dados de vendas serão armazenados separadamente dos dados do Observatório.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commercial-projectId">Project ID Comercial</Label>
              <Input
                id="commercial-projectId"
                value={config.projectId}
                onChange={(e) => setConfig(prev => ({ ...prev, projectId: e.target.value }))}
                placeholder="meu-projeto-comercial"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commercial-apiKey">API Key Comercial</Label>
              <Input
                id="commercial-apiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="AIza..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commercial-authDomain">Auth Domain</Label>
              <Input
                id="commercial-authDomain"
                value={config.authDomain}
                onChange={(e) => setConfig(prev => ({ ...prev, authDomain: e.target.value }))}
                placeholder="meu-projeto-comercial.firebaseapp.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commercial-databaseURL">Database URL</Label>
              <Input
                id="commercial-databaseURL"
                value={config.databaseURL}
                onChange={(e) => setConfig(prev => ({ ...prev, databaseURL: e.target.value }))}
                placeholder="https://meu-projeto-comercial.firebaseio.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commercial-storageBucket">Storage Bucket</Label>
              <Input
                id="commercial-storageBucket"
                value={config.storageBucket}
                onChange={(e) => setConfig(prev => ({ ...prev, storageBucket: e.target.value }))}
                placeholder="meu-projeto-comercial.appspot.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commercial-messagingSenderId">Messaging Sender ID</Label>
              <Input
                id="commercial-messagingSenderId"
                value={config.messagingSenderId}
                onChange={(e) => setConfig(prev => ({ ...prev, messagingSenderId: e.target.value }))}
                placeholder="123456789012"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="commercial-appId">App ID</Label>
            <Input
              id="commercial-appId"
              value={config.appId}
              onChange={(e) => setConfig(prev => ({ ...prev, appId: e.target.value }))}
              placeholder="1:123456789012:web:abcdef123456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commercial-serviceAccountKey">Service Account Key (JSON)</Label>
            <Textarea
              id="commercial-serviceAccountKey"
              value={config.serviceAccountKey}
              onChange={(e) => setConfig(prev => ({ ...prev, serviceAccountKey: e.target.value }))}
              placeholder="Cole aqui o JSON da chave da conta de serviço..."
              rows={4}
            />
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando configuração comercial...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Salvar Configuração Firebase Comercial
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
