
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Download, ExternalLink, PlayCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function CommercialMakeConfig() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Make.com - Automação Comercial
          </CardTitle>
          <CardDescription>
            Configure automações específicas para o módulo comercial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              Templates especializados para automação de vendas e análise comercial
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-green-500" />
                Cenário 1: Captura de Leads Comerciais
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Detecta e captura automaticamente mensagens com intenção comercial
              </p>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar Template
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-blue-500" />
                Cenário 2: Análise de Intenção de Compra
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Analisa mensagens para identificar interesse e urgência de compra
              </p>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar Template
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-purple-500" />
                Cenário 3: Pipeline Automático
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Move leads automaticamente através do funil de vendas
              </p>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar Template
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-orange-500" />
                Cenário 4: Follow-up Inteligente
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Sistema automático de follow-up baseado no comportamento do lead
              </p>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar Template
              </Button>
            </div>
          </div>

          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription>
              <strong>Guia de Configuração Comercial:</strong> Acesse a documentação completa para configurar as automações de vendas no Make.com
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
