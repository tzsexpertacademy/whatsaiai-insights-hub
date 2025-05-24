import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Database, CheckCircle, AlertCircle, Upload, Copy, Shield, Cloud, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { FirebaseConnectionDiagnostics } from './FirebaseConnectionDiagnostics';

export function FirebaseConfig() {
  const { config, updateConfig, saveConfig, isLoading, connectionStatus, testFirebaseConnection } = useClientConfig();
  const [configFile, setConfigFile] = useState<File | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();

  const isFirebaseConnected = connectionStatus.firebase;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setConfigFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const firebaseConfig = JSON.parse(e.target?.result as string);
          
          updateConfig('firebase', {
            projectId: firebaseConfig.projectId || '',
            apiKey: firebaseConfig.apiKey || '',
            authDomain: firebaseConfig.authDomain || '',
            databaseURL: firebaseConfig.databaseURL || '',
            storageBucket: firebaseConfig.storageBucket || '',
            messagingSenderId: firebaseConfig.messagingSenderId || '',
            appId: firebaseConfig.appId || ''
          });
          
          toast({
            title: "Configuração importada",
            description: "Arquivo Firebase importado com sucesso",
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
    }
  };

  const handleTestAndSave = async () => {
    if (!config.firebase.projectId || !config.firebase.apiKey) {
      toast({
        title: "Erro",
        description: "Project ID e API Key são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    try {
      const isConnected = await testFirebaseConnection();
      
      if (isConnected) {
        await saveConfig();
        
        toast({
          title: "Firebase conectado!",
          description: "Configuração salva no seu perfil com sucesso",
        });
      } else {
        toast({
          title: "Falha na conexão",
          description: "Verifique suas credenciais do Firebase",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível testar a conexão",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const disconnectFirebase = async () => {
    updateConfig('firebase', {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      databaseURL: ''
    });

    await saveConfig();
    
    toast({
      title: "Firebase desconectado",
      description: "Configuração removida do seu perfil",
    });
  };

  const generateFirebaseStructure = () => {
    const structure = {
      rules: {
        ".read": "auth != null",
        ".write": "auth != null",
        "clients": {
          "$uid": {
            ".read": "$uid === auth.uid",
            ".write": "$uid === auth.uid",
            "profile": {
              ".validate": "newData.hasChildren(['name', 'phone'])"
            },
            "conversations": {
              "$conversationId": {
                ".validate": "newData.hasChildren(['messages', 'timestamp'])"
              }
            },
            "analysis": {
              ".validate": "newData.hasChildren(['psychologicalProfile', 'insights'])"
            }
          }
        }
      },
      structure: {
        "clients": {
          "{userId}": {
            "profile": {
              "name": "string",
              "phone": "string", 
              "createdAt": "timestamp",
              "lastActivity": "timestamp"
            },
            "conversations": {
              "{conversationId}": {
                "messages": "array",
                "participants": "array",
                "timestamp": "timestamp",
                "platform": "string"
              }
            },
            "analysis": {
              "psychologicalProfile": "object",
              "emotionalStates": "array",
              "behavioralPatterns": "object",
              "insights": "array",
              "lastAnalysis": "timestamp"
            },
            "assistants": {
              "{assistantId}": {
                "name": "string",
                "prompt": "string", 
                "model": "string",
                "isActive": "boolean",
                "createdAt": "timestamp"
              }
            }
          }
        }
      }
    };

    return JSON.stringify(structure, null, 2);
  };

  const copyStructure = async () => {
    try {
      await navigator.clipboard.writeText(generateFirebaseStructure());
      toast({
        title: "Copiado!",
        description: "Estrutura do Firebase copiada para área de transferência"
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a estrutura",
        variant: "destructive"
      });
    }
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
              Conexão com banco de dados do cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              {isLoading ? (
                <>
                  <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                  <span className="text-blue-600 font-medium">Verificando...</span>
                </>
              ) : isFirebaseConnected ? (
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
            
            {isFirebaseConnected && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                <p className="text-sm text-green-700">
                  Projeto: {config.firebase.projectId}
                </p>
                <p className="text-sm text-green-700">
                  Configuração salva no seu perfil
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="config-file">Importar Configuração</Label>
              <input
                id="config-file"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isFirebaseConnected}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('config-file')?.click()}
                className="w-full"
                disabled={isFirebaseConnected}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload firebase-config.json
              </Button>
              <p className="text-xs text-gray-500">
                Arquivo do console Firebase do cliente
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              {!isFirebaseConnected ? (
                <Button 
                  onClick={handleTestAndSave} 
                  disabled={isTestingConnection || isLoading}
                  className="flex-1"
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    "Testar e Salvar"
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={disconnectFirebase} 
                  variant="destructive"
                  className="flex-1"
                  disabled={isLoading}
                >
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
              Credenciais do Firebase do cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="projectId">Project ID *</Label>
              <Input
                id="projectId"
                placeholder="projeto-do-cliente"
                value={config.firebase.projectId}
                onChange={(e) => updateConfig('firebase', { projectId: e.target.value })}
                disabled={isFirebaseConnected}
              />
            </div>
            
            <div>
              <Label htmlFor="apiKey">API Key *</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="AIza..."
                value={config.firebase.apiKey}
                onChange={(e) => updateConfig('firebase', { apiKey: e.target.value })}
                disabled={isFirebaseConnected}
              />
            </div>

            <div>
              <Label htmlFor="authDomain">Auth Domain</Label>
              <Input
                id="authDomain"
                placeholder="projeto-do-cliente.firebaseapp.com"
                value={config.firebase.authDomain}
                onChange={(e) => updateConfig('firebase', { authDomain: e.target.value })}
                disabled={isFirebaseConnected}
              />
            </div>

            <div>
              <Label htmlFor="databaseURL">Database URL *</Label>
              <Input
                id="databaseURL"
                placeholder="https://projeto-do-cliente-default-rtdb.firebaseio.com/"
                value={config.firebase.databaseURL}
                onChange={(e) => updateConfig('firebase', { databaseURL: e.target.value })}
                disabled={isFirebaseConnected}
              />
              <p className="text-xs text-gray-500 mt-1">
                Deve terminar com .firebaseio.com/ (com barra no final)
              </p>
            </div>

            {!isFirebaseConnected && (
              <Button 
                onClick={saveConfig} 
                className="w-full mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <FirebaseConnectionDiagnostics config={config.firebase} />

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Privacidade e Segurança
          </CardTitle>
          <CardDescription>
            Como garantimos a privacidade dos dados do cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Dados na Conta do Cliente
                </h4>
                <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                  <li>Todos os dados ficam no Firebase do cliente</li>
                  <li>Nossa plataforma não armazena informações sensíveis</li>
                  <li>Cliente tem controle total dos seus dados</li>
                  <li>Conformidade com LGPD garantida</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">🔒 Segurança</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Conexão criptografada (HTTPS/SSL)</li>
                  <li>Autenticação por token temporário</li>
                  <li>Acesso restrito por usuário</li>
                  <li>Logs de auditoria automáticos</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Estrutura Recomendada</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <Textarea
                  value={generateFirebaseStructure()}
                  readOnly
                  className="min-h-[200px] font-mono text-xs"
                />
              </div>
              <Button 
                onClick={copyStructure}
                className="w-full mt-2"
                variant="outline"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Estrutura
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
