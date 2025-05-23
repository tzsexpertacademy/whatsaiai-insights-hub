
import React from 'react';
import { ConnectionStatus } from './ConnectionStatus';
import { QRCodeGenerator } from './QRCodeGenerator';
import { WhatsAppConnectionStatus } from './WhatsAppConnectionStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Clock, MessageSquare } from 'lucide-react';
import { OpenAIConfig } from './OpenAIConfig';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useToast } from '@/hooks/use-toast';
import { WhatsAppPlatformConfig } from './WhatsAppPlatformConfig';

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
      {/* Grid principal com QR Code e Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QRCodeGenerator />
        <WhatsAppConnectionStatus />
      </div>
      
      {/* Importação de conversas */}
      <ConnectionStatus />
      
      {/* Configurações de plataforma */}
      <WhatsAppPlatformConfig />
      
      {/* Sincronização automática */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            Sincronização Automática
          </CardTitle>
          <CardDescription>
            Configure a sincronização automática para análise de conversas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="autoSync">Sincronização Automática</Label>
                <p className="text-xs text-gray-500">Reprocessar conversas automaticamente</p>
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
                  💡 A sincronização reprocessará arquivos importados para gerar novos insights
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Informações sobre respostas automáticas */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Sistema de Respostas Automáticas
          </CardTitle>
          <CardDescription>
            Como funciona o assistente conselheiro automático
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">✅ Funcionamento:</h4>
              <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                <li>Cliente envia mensagem no WhatsApp Business</li>
                <li>Sistema detecta nova mensagem automaticamente</li>
                <li>IA analisa o contexto e histórico do cliente</li>
                <li>Gera resposta personalizada como conselheiro</li>
                <li>Envia resposta automática instantaneamente</li>
              </ol>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">🎯 Recursos do Assistente:</h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Análise de sentimentos em tempo real</li>
                <li>Respostas baseadas no perfil psicológico</li>
                <li>Técnicas de aconselhamento personalizadas</li>
                <li>Contexto de conversas anteriores</li>
                <li>Encaminhamento para profissional quando necessário</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Próximos Passos:
              </h4>
              <ol className="text-sm text-purple-700 space-y-1 list-decimal list-inside">
                <li>Conecte seu WhatsApp Business usando o QR Code</li>
                <li>Configure suas credenciais OpenAI abaixo</li>
                <li>Teste o sistema enviando uma mensagem</li>
                <li>Importe conversas antigas para melhor contexto</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Configuração OpenAI */}
      <OpenAIConfig />
    </div>
  );
}
