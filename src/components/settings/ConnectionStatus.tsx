
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Smartphone, Wifi, WifiOff, Upload } from 'lucide-react';
import { useClientConfig } from "@/contexts/ClientConfigContext";
import { useToast } from "@/hooks/use-toast";

export function ConnectionStatus() {
  const { config, updateConfig } = useClientConfig();
  const { toast } = useToast();
  const whatsappConfig = config.whatsapp;
  
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  
  const importConversations = async () => {
    if (!selectedFile) return;
    
    setIsImporting(true);
    
    // Simulando processamento de arquivo
    setTimeout(() => {
      setIsImporting(false);
      updateConfig('whatsapp', { 
        isConnected: true,
        lastImport: new Date().toISOString()
      });
      
      toast({
        title: "Importação concluída",
        description: "Conversas importadas com sucesso para processamento"
      });
      
      setSelectedFile(null);
    }, 2000);
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
              <Wifi className="h-6 w-6 text-green-500" />
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
              Última importação: {new Date(whatsappConfig.lastImport).toLocaleDateString('pt-BR')}
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
                disabled={!selectedFile || isImporting}
                className="w-full flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isImporting ? 'Importando...' : 'Importar Conversas'}
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
            checked={whatsappConfig.autoReply}
            onCheckedChange={(checked) => updateConfig('whatsapp', { autoReply: checked })}
          />
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            💡 <strong>Dica:</strong> Para melhores resultados, importe conversas recentes e completas para que a IA possa processar o contexto adequadamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
