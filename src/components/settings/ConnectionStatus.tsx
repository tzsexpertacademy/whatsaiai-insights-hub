
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Smartphone, Wifi, WifiOff, Upload, RefreshCw, CheckCircle } from 'lucide-react';
import { useClientConfig } from "@/contexts/ClientConfigContext";
import { useToast } from "@/hooks/use-toast";
import { useConversationUpload } from "@/hooks/useConversationUpload";

export function ConnectionStatus() {
  const { config, updateConfig, saveConfig } = useClientConfig();
  const { toast } = useToast();
  const { uploadAndAnalyze, syncExistingConversations, isUploading } = useConversationUpload();
  const whatsappConfig = config.whatsapp;
  
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  
  const importConversations = async () => {
    if (!selectedFile) return;
    
    const result = await uploadAndAnalyze(selectedFile);
    
    if (result.success) {
      updateConfig('whatsapp', { 
        isConnected: true,
        lastImport: new Date().toISOString()
      });
      await saveConfig();
      setSelectedFile(null);
    }
  };

  const handleManualSync = async () => {
    await syncExistingConversations();
  };

  const handleAutoReplyToggle = async (checked: boolean) => {
    updateConfig('whatsapp', { autoReply: checked });
    try {
      await saveConfig();
      toast({
        title: checked ? "Resposta automática ativada" : "Resposta automática desativada",
        description: checked ? "O assistente responderá automaticamente" : "Respostas automáticas foram pausadas"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-green-600" />
          Importação de Conversas
        </CardTitle>
        <CardDescription>
          Importe suas conversas do WhatsApp para análise com OpenAI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          {whatsappConfig.isConnected ? (
            <>
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="font-medium text-green-600">
                Dados importados
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-6 w-6 text-red-500" />
              <span className="font-medium text-red-600">
                Sem dados importados
              </span>
            </>
          )}
        </div>
        
        {whatsappConfig.isConnected && whatsappConfig.lastImport && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
            <p className="text-sm text-green-700">
              Última importação: {new Date(whatsappConfig.lastImport).toLocaleDateString('pt-BR')} às {new Date(whatsappConfig.lastImport).toLocaleTimeString('pt-BR')}
            </p>
          </div>
        )}

        {whatsappConfig.isConnected && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900">Sincronização Manual</h4>
              <Button 
                onClick={handleManualSync} 
                disabled={isUploading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isUploading ? 'animate-spin' : ''}`} />
                {isUploading ? 'Sincronizando...' : 'Sincronizar Agora'}
              </Button>
            </div>
            <p className="text-sm text-blue-700">
              Reprocessar conversas existentes e buscar por novos insights com a OpenAI
            </p>
          </div>
        )}

        <div className="space-y-4 mt-4">
          <Label htmlFor="authorized">Número do WhatsApp</Label>
          <Input
            id="authorized"
            placeholder="+55 11 99999-9999"
            value={whatsappConfig.authorizedNumber || ''}
            onChange={(e) => updateConfig('whatsapp', { authorizedNumber: e.target.value })}
            className="mb-4"
          />

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Importar conversas:</h4>
            <p className="text-sm text-gray-700 mb-3">
              Exporte as conversas do seu WhatsApp e carregue o arquivo abaixo
            </p>
            
            <div className="space-y-3">
              <Input 
                type="file" 
                onChange={handleFileChange}
                accept=".txt,.json,.zip,.csv"
              />
              
              {selectedFile && (
                <p className="text-sm text-gray-600">
                  Arquivo selecionado: {selectedFile.name}
                </p>
              )}
              
              <Button 
                onClick={importConversations} 
                disabled={!selectedFile || isUploading}
                className="w-full flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Analisando...' : 'Importar e Analisar'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <Label htmlFor="autoReply">Resposta Automática</Label>
            <p className="text-xs text-gray-500">Enviar respostas automáticas da IA</p>
          </div>
          <Switch
            id="autoReply"
            checked={whatsappConfig.autoReply || false}
            onCheckedChange={handleAutoReplyToggle}
          />
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            💡 <strong>Como funciona:</strong> O sistema analisa suas conversas com OpenAI para gerar insights psicológicos e emocionais. As respostas automáticas usam o perfil do cliente para personalizar as mensagens.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
