
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ExternalLink, CheckCircle, PlayCircle, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function MakeSetupGuide() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();

  const markStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
      toast({
        title: "Passo concluído!",
        description: `Etapa ${stepNumber} marcada como completa`,
      });
    }
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${description} copiado para a área de transferência`,
    });
  };

  const scenarios = [
    {
      id: 1,
      title: "🔐 Conexão WhatsApp",
      description: "Gera QR Code e mantém conexão ativa",
      status: "Essencial",
      modules: ["Webhook", "WhatsApp Web", "HTTP"],
      webhookUrl: "https://hook.make.com/your-webhook-qr"
    },
    {
      id: 2,
      title: "📥 Receber Mensagens",
      description: "Captura todas as mensagens recebidas",
      status: "Essencial", 
      modules: ["WhatsApp Web", "Webhook", "Router"],
      webhookUrl: "https://hook.make.com/your-webhook-receive"
    },
    {
      id: 3,
      title: "🤖 Resposta Inteligente",
      description: "OpenAI + resposta automática",
      status: "Inteligência",
      modules: ["OpenAI", "WhatsApp Web", "Text Parser"],
      webhookUrl: "https://hook.make.com/your-webhook-ai"
    },
    {
      id: 4,
      title: "📤 Enviar Mensagens",
      description: "Envia mensagens via dashboard",
      status: "Dashboard",
      modules: ["Webhook", "WhatsApp Web"],
      webhookUrl: "https://hook.make.com/your-webhook-send"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-purple-600" />
            Configuração Make.com - WhatsApp Real
          </CardTitle>
          <CardDescription>
            4 cenários no Make.com para WhatsApp Business funcional e inteligente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">WhatsApp Web Automatizado</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Respostas com OpenAI</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium">Dashboard Integrado</span>
              </div>
            </div>
            <Button asChild>
              <a href="https://make.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Make.com
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cenários */}
      {scenarios.map((scenario) => (
        <Card key={scenario.id} className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {scenario.title}
                <Badge variant={scenario.status === 'Essencial' ? 'destructive' : 'secondary'}>
                  {scenario.status}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                {completedSteps.includes(scenario.id) && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markStepComplete(scenario.id)}
                >
                  Marcar Concluído
                </Button>
              </div>
            </div>
            <CardDescription>{scenario.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Módulos necessários */}
            <div>
              <h4 className="font-medium mb-2">Módulos Make.com:</h4>
              <div className="flex flex-wrap gap-2">
                {scenario.modules.map((module) => (
                  <Badge key={module} variant="outline">{module}</Badge>
                ))}
              </div>
            </div>

            {/* URL do Webhook */}
            <div>
              <h4 className="font-medium mb-2">Webhook URL:</h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-100 p-2 rounded text-sm">
                  {scenario.webhookUrl}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(scenario.webhookUrl, 'Webhook URL')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Instruções específicas */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">📋 Como configurar:</h4>
              {scenario.id === 1 && (
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Crie novo cenário no Make.com</li>
                  <li>Adicione módulo "Webhook" → "Custom webhook"</li>
                  <li>Adicione módulo "WhatsApp" → "Generate QR Code"</li>
                  <li>Conecte módulo HTTP para enviar QR para nossa plataforma</li>
                  <li>Configure timer para verificar conexão a cada 30s</li>
                </ol>
              )}
              {scenario.id === 2 && (
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Módulo WhatsApp → "Watch messages"</li>
                  <li>Router para separar mensagens por tipo</li>
                  <li>HTTP module para enviar para nossa plataforma</li>
                  <li>Filter para ignorar mensagens próprias</li>
                </ol>
              )}
              {scenario.id === 3 && (
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Webhook recebe mensagem da plataforma</li>
                  <li>OpenAI processa com contexto do cliente</li>
                  <li>Text parser formata resposta</li>
                  <li>WhatsApp envia resposta automaticamente</li>
                </ol>
              )}
              {scenario.id === 4 && (
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Webhook recebe dados do dashboard</li>
                  <li>WhatsApp module envia mensagem</li>
                  <li>HTTP confirma entrega para plataforma</li>
                </ol>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Template JSON */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-green-600" />
            Templates Prontos
          </CardTitle>
          <CardDescription>
            JSONs dos cenários para importar diretamente no Make.com
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">🚀 Templates Disponíveis:</h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                📥 Download: Cenário 1 - Conexão WhatsApp.json
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                📥 Download: Cenário 2 - Receber Mensagens.json
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                📥 Download: Cenário 3 - IA + Resposta.json
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                📥 Download: Cenário 4 - Enviar Mensagens.json
              </Button>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-2">⚡ Importação Rápida:</h4>
            <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
              <li>Make.com → Create Scenario → Import Blueprint</li>
              <li>Upload o arquivo JSON do cenário</li>
              <li>Configure suas credenciais (WhatsApp, OpenAI)</li>
              <li>Ajuste as URLs dos webhooks</li>
              <li>Ative o cenário</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Status geral */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>📊 Progresso da Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Cenários configurados:</span>
              <Badge variant={completedSteps.length === 4 ? "default" : "secondary"}>
                {completedSteps.length}/4
              </Badge>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSteps.length / 4) * 100}%` }}
              ></div>
            </div>

            {completedSteps.length === 4 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  🎉 <strong>Parabéns!</strong> Todos os cenários estão configurados. 
                  Seu WhatsApp Business está funcionando com IA!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
