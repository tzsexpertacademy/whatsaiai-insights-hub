import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Database, CheckCircle, AlertCircle, Upload, Copy, Shield, Cloud, Loader2, BookOpen, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { FirebaseConnectionDiagnostics } from './FirebaseConnectionDiagnostics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="setup-guide" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Guia de Configuração
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="setup-guide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Guia Completo: Como Configurar Firebase para o Cliente
              </CardTitle>
              <CardDescription>
                Passo a passo detalhado para criar e configurar um projeto Firebase para seu cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Passo 1 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  Acessar o Console do Firebase
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700">Acesse o console do Firebase e faça login com uma conta Google:</p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Console Firebase
                  </Button>
                  <p className="text-sm text-gray-600">
                    💡 <strong>Dica:</strong> Use a conta Google do cliente ou uma conta dedicada para o projeto.
                  </p>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  Criar Novo Projeto
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700">No console, clique em "Adicionar projeto" e siga os passos:</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li><strong>Nome do projeto:</strong> Use um nome descritivo (ex: "projeto-cliente-joao")</li>
                      <li><strong>Google Analytics:</strong> Recomendado deixar habilitado</li>
                      <li><strong>Conta do Analytics:</strong> Use a conta padrão ou crie uma nova</li>
                    </ol>
                  </div>
                  <p className="text-sm text-gray-600">
                    ⚠️ <strong>Importante:</strong> O nome do projeto não pode ser alterado depois.
                  </p>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                  Configurar Realtime Database
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700">Configure o banco de dados em tempo real:</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>No menu lateral, clique em <strong>"Realtime Database"</strong></li>
                      <li>Clique em <strong>"Criar banco de dados"</strong></li>
                      <li><strong>Localização:</strong> Escolha "us-central1" (padrão)</li>
                      <li><strong>Regras de segurança:</strong> Comece em "Modo de teste"</li>
                    </ol>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700">
                      🔒 <strong>Segurança:</strong> Depois de configurar, altere as regras para permitir apenas usuários autenticados.
                    </p>
                  </div>
                </div>
              </div>

              {/* Passo 4 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                  Criar Aplicativo Web
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700">Registre um aplicativo web para obter as configurações:</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Na página principal do projeto, clique no ícone <strong>"&lt;/&gt;"</strong> (Web)</li>
                      <li><strong>Nome do app:</strong> Use um nome descritivo (ex: "app-cliente-joao")</li>
                      <li><strong>Firebase Hosting:</strong> Pode deixar desmarcado</li>
                      <li>Clique em <strong>"Registrar app"</strong></li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Passo 5 */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
                  Obter Configurações
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700">Copie as configurações do Firebase:</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Após registrar o app, você verá um objeto JavaScript com as configurações</li>
                      <li>Copie todo o objeto <code className="bg-gray-200 px-1 rounded">firebaseConfig</code></li>
                      <li>Ou vá em <strong>Configurações do projeto → Geral → Seus apps</strong></li>
                      <li>Clique no ícone de configuração do seu app web</li>
                    </ol>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      💾 <strong>Alternativa:</strong> Você pode baixar o arquivo <code>firebase-config.json</code> e fazer upload aqui na plataforma.
                    </p>
                  </div>
                </div>
              </div>

              {/* Passo 6 */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">6</span>
                  Configurar Regras de Segurança
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700">Configure as regras de segurança do Realtime Database:</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Vá em <strong>Realtime Database → Regras</strong></li>
                      <li>Substitua as regras padrão pelas regras recomendadas</li>
                      <li>Clique em <strong>"Publicar"</strong> para aplicar</li>
                    </ol>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-700 mb-2">
                      <strong>Regras recomendadas:</strong>
                    </p>
                    <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
{`{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "conversations": {
      "$module": {
        ".read": true,
        ".write": true
      }
    },
    "analyses": {
      "$module": {
        ".read": true,
        ".write": true
      }
    }
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Passo 7 */}
              <div className="border-l-4 border-gray-500 pl-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span className="bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">7</span>
                  Conectar na Plataforma
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700">Agora conecte o Firebase na nossa plataforma:</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Volte para a aba <strong>"Configuração"</strong> desta página</li>
                      <li>Cole as informações do Firebase nos campos correspondentes</li>
                      <li>Ou faça upload do arquivo <code>firebase-config.json</code></li>
                      <li>Clique em <strong>"Testar e Salvar"</strong></li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Informações importantes */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Informações Importantes</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li><strong>Custo:</strong> Firebase tem uma camada gratuita generosa (até 1GB de dados)</li>
                  <li><strong>Backup:</strong> Recomendamos configurar backups automáticos</li>
                  <li><strong>Monitoramento:</strong> Ative alertas de uso no console do Firebase</li>
                  <li><strong>Acesso:</strong> Adicione outros usuários como colaboradores se necessário</li>
                </ul>
              </div>

              {/* Problemas comuns */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">🚨 Problemas Comuns</h4>
                <div className="text-sm text-red-700 space-y-2">
                  <div>
                    <strong>Erro 403 (Acesso negado):</strong> Verifique as regras de segurança
                  </div>
                  <div>
                    <strong>Erro 404 (Projeto não encontrado):</strong> Confirme o Project ID
                  </div>
                  <div>
                    <strong>Erro 401 (Não autorizado):</strong> Verifique a API Key
                  </div>
                  <div>
                    <strong>URL inválida:</strong> Certifique-se que a Database URL termina com "/"
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
