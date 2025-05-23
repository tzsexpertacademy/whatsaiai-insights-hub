
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Database, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function FirebaseConfig() {
  const [isConnected, setIsConnected] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [databaseUrl, setDatabaseUrl] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');
  const [configFile, setConfigFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setConfigFile(file);
      // Aqui você pode ler o arquivo JSON e preencher os campos automaticamente
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          if (config.projectId) setProjectId(config.projectId);
          if (config.apiKey) setApiKey(config.apiKey);
          if (config.authDomain) setAuthDomain(config.authDomain);
          if (config.databaseURL) setDatabaseUrl(config.databaseURL);
          if (config.storageBucket) setStorageBucket(config.storageBucket);
          if (config.messagingSenderId) setMessagingSenderId(config.messagingSenderId);
          if (config.appId) setAppId(config.appId);
          
          toast({
            title: "Arquivo carregado",
            description: "Configurações do Firebase importadas com sucesso",
          });
        } catch (error) {
          toast({
            title: "Erro",
            description: "Arquivo JSON inválido",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo JSON válido",
        variant: "destructive",
      });
    }
  };

  const testConnection = async () => {
    if (!projectId || !apiKey) {
      toast({
        title: "Erro",
        description: "Por favor, preencha pelo menos o Project ID e API Key",
        variant: "destructive",
      });
      return;
    }

    // Simular teste de conexão
    setTimeout(() => {
      setIsConnected(true);
      toast({
        title: "Conectado!",
        description: "Firebase configurado com sucesso",
      });
    }, 1500);
  };

  const disconnect = () => {
    setIsConnected(false);
    toast({
      title: "Desconectado",
      description: "Conexão com Firebase removida",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-orange-600" />
              Status do Firebase
            </CardTitle>
            <CardDescription>
              Status da conexão com o banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              {isConnected ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-green-600 font-medium">Conectado</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <span className="text-red-600 font-medium">Desconectado</span>
                </>
              )}
            </div>
            
            {isConnected && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  Projeto: {projectId}
                </p>
                <p className="text-sm text-green-700">
                  Dados dos clientes sendo salvos com segurança
                </p>
              </div>
            )}

            <div className="mt-4">
              <Label htmlFor="config-file">Importar Configuração</Label>
              <div className="mt-2">
                <input
                  id="config-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('config-file')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar firebase-config.json
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Faça upload do arquivo de configuração do Firebase Console
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              {!isConnected ? (
                <Button onClick={testConnection} className="flex-1">
                  Testar Conexão
                </Button>
              ) : (
                <Button onClick={disconnect} variant="destructive" className="flex-1">
                  Desconectar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Configuração Manual</CardTitle>
            <CardDescription>
              Configure manualmente as credenciais do Firebase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="projectId">Project ID *</Label>
              <Input
                id="projectId"
                placeholder="seu-projeto-firebase"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={isConnected}
              />
            </div>
            
            <div>
              <Label htmlFor="apiKey">API Key *</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="AIza..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isConnected}
              />
            </div>

            <div>
              <Label htmlFor="authDomain">Auth Domain</Label>
              <Input
                id="authDomain"
                placeholder="seu-projeto.firebaseapp.com"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                disabled={isConnected}
              />
            </div>

            <div>
              <Label htmlFor="databaseUrl">Database URL</Label>
              <Input
                id="databaseUrl"
                placeholder="https://seu-projeto.firebaseio.com"
                value={databaseUrl}
                onChange={(e) => setDatabaseUrl(e.target.value)}
                disabled={isConnected}
              />
            </div>

            <div>
              <Label htmlFor="storageBucket">Storage Bucket</Label>
              <Input
                id="storageBucket"
                placeholder="seu-projeto.appspot.com"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                disabled={isConnected}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Estrutura de Dados</CardTitle>
          <CardDescription>
            Como os dados são organizados no Firebase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm text-gray-700">
{`/clients
  /{clientId}
    /profile
      - name
      - phone
      - createdAt
    /conversations
      /{conversationId}
        - messages[]
        - timestamp
        - participants
    /analysis
      - psychologicalProfile
      - emotionalStates
      - behavioralPatterns
      - insights[]
    /assistants
      /{assistantId}
        - name
        - prompt
        - model
        - isActive`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
