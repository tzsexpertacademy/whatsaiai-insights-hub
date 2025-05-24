
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Zap, Bot, Globe, Smartphone } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export function CommercialWhatsAppPlatformConfig() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Plataformas WhatsApp Comerciais
          </CardTitle>
          <CardDescription>
            Escolha e configure sua plataforma WhatsApp para análise comercial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AtendeCha Comercial */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  AtendeCha Comercial
                  <Badge variant="outline" className="text-xs">Recomendado</Badge>
                </CardTitle>
                <CardDescription>
                  Automação inteligente para vendas via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <p className="text-blue-700">• Análise de intenção de compra</p>
                  <p className="text-blue-700">• Pipeline automático de vendas</p>
                  <p className="text-blue-700">• Métricas de conversão</p>
                  <p className="text-blue-700">• Follow-up inteligente</p>
                </div>
              </CardContent>
            </Card>

            {/* Chatwoot Comercial */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  Chatwoot Comercial
                </CardTitle>
                <CardDescription>
                  Central de atendimento comercial unificada
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <p className="text-green-700">• Dashboard de vendas unificado</p>
                  <p className="text-green-700">• Histórico de negociações</p>
                  <p className="text-green-700">• Equipe comercial integrada</p>
                  <p className="text-green-700">• Relatórios de performance</p>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp Web Comercial */}
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  WhatsApp Web Comercial
                </CardTitle>
                <CardDescription>
                  Conexão direta para análise de vendas
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <p className="text-purple-700">• Análise em tempo real</p>
                  <p className="text-purple-700">• Sem custos adicionais</p>
                  <p className="text-purple-700">• Setup rápido</p>
                  <p className="text-purple-700">• Métricas básicas</p>
                </div>
              </CardContent>
            </Card>

            {/* Wati Comercial */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-orange-600" />
                  Wati Comercial
                </CardTitle>
                <CardDescription>
                  WhatsApp Business API para vendas
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <p className="text-orange-700">• API oficial do WhatsApp</p>
                  <p className="text-orange-700">• Campanhas de vendas</p>
                  <p className="text-orange-700">• Templates comerciais</p>
                  <p className="text-orange-700">• Analytics avançados</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
