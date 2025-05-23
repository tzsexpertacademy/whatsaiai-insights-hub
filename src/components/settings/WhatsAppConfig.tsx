
import React from 'react';
import { ConnectionStatus } from './ConnectionStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Clock } from 'lucide-react';
import { OpenAIConfig } from './OpenAIConfig';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useToast } from '@/hooks/use-toast';

export function WhatsAppConfig() {
  const { config, updateConfig, saveConfig } = useClientConfig();
  const { toast } = useToast();
  
  const handleSyncIntervalChange = async (value: string) => {
    updateConfig('whatsapp', { syncInterval: value });
    try {
      await saveConfig();
      toast({
        title: "Configuração salva",
        description: "Intervalo de sincronização atualizado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    }
  };
  
  const handleAutoSyncToggle = async (checked: boolean) => {
    updateConfig('whatsapp', { autoSync: checked });
    try {
      await saveConfig();
      toast({
        title: checked ? "Sincronização automática ativada" : "Sincronização automática desativada",
        description: checked ? "As conversas serão sincronizadas automaticamente" : "A sincronização automática foi desativada"
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <ConnectionStatus />
      </div>
      
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            Sincronização Automática
          </CardTitle>
          <CardDescription>
            Configure a sincronização automática das conversas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="autoSync">Sincronização Automática</Label>
                <p className="text-xs text-gray-500">Importar conversas automaticamente</p>
              </div>
              <Switch
                id="autoSync"
                checked={config.whatsapp.autoSync || false}
                onCheckedChange={handleAutoSyncToggle}
              />
            </div>
            
            {config.whatsapp.autoSync && (
              <div className="space-y-2">
                <Label htmlFor="syncInterval">Intervalo de Sincronização</Label>
                <Select 
                  value={config.whatsapp.syncInterval || 'daily'}
                  onValueChange={handleSyncIntervalChange}
                >
                  <SelectTrigger id="syncInterval" className="w-full">
                    <SelectValue placeholder="Selecione o intervalo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">A cada hora</SelectItem>
                    <SelectItem value="daily">Diariamente</SelectItem>
                    <SelectItem value="weekly">Semanalmente</SelectItem>
                  </SelectContent>
                </Select>
                
                <p className="text-xs text-blue-600 mt-1">
                  💡 A sincronização ocorrerá automaticamente de acordo com o intervalo selecionado
                </p>
              </div>
            )}
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2">Como funciona:</h4>
              <p className="text-sm text-amber-700">
                A sincronização automática requer que você mantenha o navegador aberto e o sistema funcionando. 
                O sistema tentará importar novas conversas de acordo com o intervalo configurado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Processamento de Conversas com OpenAI
          </CardTitle>
          <CardDescription>
            Entenda como funciona a integração simplificada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">
              Este sistema utiliza a API da OpenAI para processar e analisar as conversas do WhatsApp,
              gerando insights e respostas automáticas inteligentes.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Como funciona:</h4>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>As conversas do WhatsApp são importadas para o sistema</li>
                <li>Os dados são armazenados no Firebase do cliente</li>
                <li>A OpenAI processa as mensagens e gera análises</li>
                <li>O sistema pode produzir respostas automáticas baseadas na análise da IA</li>
                <li>Insights e métricas são exibidos no dashboard</li>
              </ol>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Benefícios:</h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Análise avançada de sentimentos nas conversas</li>
                <li>Detecção automática de tópicos importantes</li>
                <li>Sugestões de resposta personalizadas</li>
                <li>Insights sobre o comportamento dos clientes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <OpenAIConfig />
    </div>
  );
}
