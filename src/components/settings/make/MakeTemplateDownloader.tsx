
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Zap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function MakeTemplateDownloader() {
  const { toast } = useToast();

  const downloadTemplate = (templateName: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = `/make-templates/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download iniciado",
      description: `Template ${templateName} baixado com sucesso`,
    });
  };

  const templates = [
    {
      id: 1,
      name: "Conexão WhatsApp",
      description: "Gera QR Code e mantém conexão ativa",
      fileName: "cenario-1-conexao-whatsapp.json",
      priority: "Essencial",
      modules: ["Webhook", "WhatsApp Business", "HTTP"]
    },
    {
      id: 2,
      name: "Receber Mensagens", 
      description: "Captura todas as mensagens recebidas",
      fileName: "cenario-2-receber-mensagens.json",
      priority: "Essencial",
      modules: ["WhatsApp Business", "Router", "Filter", "HTTP"]
    },
    {
      id: 3,
      name: "IA + Resposta",
      description: "OpenAI + resposta automática inteligente",
      fileName: "cenario-3-ia-resposta.json", 
      priority: "Inteligência",
      modules: ["Webhook", "OpenAI", "Text Parser", "WhatsApp Business"]
    },
    {
      id: 4,
      name: "Enviar Mensagens",
      description: "Envia mensagens via dashboard",
      fileName: "cenario-4-enviar-mensagens.json",
      priority: "Dashboard", 
      modules: ["Webhook", "WhatsApp Business", "HTTP"]
    }
  ];

  const downloadGuide = () => {
    const link = document.createElement('a');
    link.href = '/make-templates/guia-importacao.md';
    link.download = 'guia-importacao-make.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Guia baixado",
      description: "Guia completo de importação dos templates",
    });
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-green-600" />
          Download Templates Make.com
        </CardTitle>
        <CardDescription>
          Baixe os templates JSON prontos para importar no Make.com
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Botão do guia principal */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-green-900 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Guia Completo de Importação
              </h4>
              <p className="text-sm text-green-700">Instruções passo a passo para importar e configurar</p>
            </div>
            <Button onClick={downloadGuide} className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Baixar Guia
            </Button>
          </div>
        </div>

        {/* Lista de templates */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Templates dos Cenários:</h4>
          
          {templates.map((template) => (
            <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">{template.name}</span>
                  <Badge 
                    variant={template.priority === 'Essencial' ? 'destructive' : 
                             template.priority === 'Inteligência' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {template.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <div className="flex flex-wrap gap-1">
                  {template.modules.map((module) => (
                    <Badge key={module} variant="outline" className="text-xs">
                      {module}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate(template.name, template.fileName)}
                className="ml-3"
              >
                <Download className="h-4 w-4 mr-1" />
                JSON
              </Button>
            </div>
          ))}
        </div>

        {/* Instruções rápidas */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">🚀 Como usar:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Baixe o <strong>Guia Completo</strong> primeiro</li>
            <li>Baixe os templates JSON que você precisa</li>
            <li>Acesse <strong>make.com</strong> → Create Scenario → Import Blueprint</li>
            <li>Faça upload dos arquivos JSON</li>
            <li>Configure suas credenciais (WhatsApp, OpenAI)</li>
            <li>Ajuste as URLs dos webhooks</li>
            <li>Ative os cenários</li>
          </ol>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">
            ✅ <strong>Todos os templates estão prontos!</strong> Basta baixar, importar no Make.com e configurar suas credenciais. 
            Em poucos minutos você terá WhatsApp Business real funcionando com IA! 🎉
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
