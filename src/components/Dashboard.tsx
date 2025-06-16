
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, BarChart3, MessageSquare, Zap, Users } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">YumerMind Dashboard</h1>
          <p className="text-lg text-slate-600">Interface para a Mente - Análise Inteligente de Conversas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Análise de Conversas
              </CardTitle>
              <CardDescription>
                Análise IA das suas conversas do WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">0</span>
                <Badge variant="outline">Conversas analisadas</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                WhatsApp API Hub
                <Badge className="bg-green-100 text-green-800">NOVO</Badge>
              </CardTitle>
              <CardDescription>
                Solução universal para integração WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">Hub</span>
                <Badge variant="outline">Ativo</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Insights
              </CardTitle>
              <CardDescription>
                Relatórios e métricas de comportamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-600">0</span>
                <Badge variant="outline">Insights gerados</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a 
                  href="/whatsapp-api-hub"
                  className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span className="font-medium">API Hub</span>
                  </div>
                  <p className="text-sm text-gray-600">Configurar WhatsApp</p>
                </a>
                
                <a 
                  href="/analysis"
                  className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Análises</span>
                  </div>
                  <p className="text-sm text-gray-600">Ver conversas marcadas</p>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>WhatsApp Connection</span>
                  <Badge variant="outline">Configurar</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>API Hub</span>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Análise IA</span>
                  <Badge className="bg-blue-100 text-blue-800">Disponível</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
