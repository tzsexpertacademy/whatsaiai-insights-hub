import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Zap, MessageSquare, Globe, Settings, Code, QrCode, Building2, Server } from 'lucide-react';

interface PlatformSelectorProps {
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
}

export function PlatformSelector({ selectedPlatform, onPlatformChange }: PlatformSelectorProps) {
  const platforms = [
    {
      id: 'wppconnect',
      name: 'WPPConnect Server',
      description: '🚀 RECOMENDADO - Servidor local robusto e estável',
      icon: <Server className="h-5 w-5" />,
      pros: ['100% gratuito', 'Muito estável', 'API completa', 'Suporte multi-sessões', 'Self-hosted'],
      cons: ['Requer servidor local', 'Configuração inicial']
    },
    {
      id: 'whatsappweb',
      name: 'WhatsApp Web Simples',
      description: '✨ MAIS FÁCIL - Conecta direto pelo navegador',
      icon: <QrCode className="h-5 w-5" />,
      pros: ['Super fácil de usar', '100% gratuito', 'Sem programação', 'Conecta em 2 minutos'],
      cons: ['Precisa manter navegador aberto', 'Celular deve estar online']
    },
    {
      id: 'chatwoot',
      name: 'Chatwoot (Self-hosted)',
      description: '🏢 EMPRESARIAL - Plataforma completa open-source',
      icon: <Building2 className="h-5 w-5" />,
      pros: ['Open-source gratuito', 'Muito estável', 'Interface completa', 'API robusta', 'Self-hosted'],
      cons: ['Requer servidor próprio', 'Configuração inicial mais complexa']
    },
    {
      id: 'greenapi',
      name: 'GREEN-API',
      description: '☁️ CLOUD - API em nuvem oficial',
      icon: <Globe className="h-5 w-5" />,
      pros: ['Hospedado em nuvem', 'Fácil configuração', 'Suporte técnico', 'API REST'],
      cons: ['Pago após trial', 'Rate limits', 'Dependente de terceiros']
    },
    {
      id: 'atendechat',
      name: 'Atendechat',
      description: 'Plataforma brasileira especializada',
      icon: <MessageSquare className="h-5 w-5" />,
      pros: ['Suporte em português', 'Integração simples', 'Foco no mercado brasileiro'],
      cons: ['Serviço pago', 'Menos customizável']
    },
    {
      id: 'make',
      name: 'Make.com + Puppeteer',
      description: 'Solução gratuita customizável',
      icon: <Zap className="h-5 w-5" />,
      pros: ['Gratuito', 'Totalmente customizável', 'Sem limites de mensagens'],
      cons: ['Requer configuração técnica', 'Menos estável', 'Manutenção manual']
    },
    {
      id: 'wati',
      name: 'Wati (WhatsApp Team Inbox)',
      description: 'Plataforma profissional focada em WhatsApp',
      icon: <MessageSquare className="h-5 w-5" />,
      pros: ['Muito estável', 'Suporte técnico', 'Interface amigável', 'Compliance oficial'],
      cons: ['Pago (a partir de $20/mês)', 'Limitações de customização']
    },
    {
      id: 'sleekflow',
      name: 'SleekFlow',
      description: 'Plataforma multi-canal robusta',
      icon: <Globe className="h-5 w-5" />,
      pros: ['Multi-canal', 'Analytics avançados', 'Automação poderosa', 'Escalável'],
      cons: ['Mais caro', 'Complexidade adicional']
    },
    {
      id: 'wawebjs',
      name: 'WhatsApp Web JS',
      description: 'Biblioteca não oficial gratuita',
      icon: <Code className="h-5 w-5" />,
      pros: ['Totalmente gratuito', 'API estruturada', 'Boa documentação'],
      cons: ['Não oficial', 'Pode quebrar com atualizações', 'Requer servidor Node.js']
    }
  ];

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-600" />
          Escolher Plataforma de Integração
        </CardTitle>
        <CardDescription>
          Selecione a plataforma para conectar seu WhatsApp Business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="platform">Plataforma</Label>
          <Select value={selectedPlatform} onValueChange={onPlatformChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma plataforma" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map(platform => (
                <SelectItem key={platform.id} value={platform.id}>
                  <div className="flex items-center gap-2">
                    {platform.icon}
                    {platform.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPlatformData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {platforms.map(platform => (
              <div 
                key={platform.id}
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  platform.id === selectedPlatform 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                } ${platform.id === 'wppconnect' ? 'ring-2 ring-green-200' : ''}`}
                onClick={() => onPlatformChange(platform.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  {platform.icon}
                  <h3 className="font-medium text-xs">{platform.name}</h3>
                </div>
                <p className="text-xs text-gray-600 mb-2">{platform.description}</p>
                
                <div className="space-y-1">
                  <div>
                    <p className="text-xs font-medium text-green-700">Vantagens:</p>
                    <ul className="text-xs text-green-600 list-disc list-inside">
                      {platform.pros.slice(0, 2).map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-red-700">Limitações:</p>
                    <ul className="text-xs text-red-600 list-disc list-inside">
                      {platform.cons.slice(0, 2).map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedPlatform && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">
              Configuração selecionada: {selectedPlatformData?.name}
            </h4>
            <p className="text-sm text-blue-700">
              {selectedPlatformData?.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
