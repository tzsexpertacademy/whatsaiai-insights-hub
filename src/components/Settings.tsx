
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Smartphone, Brain, Zap } from 'lucide-react';

export function Settings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Configurações</h1>
          <p className="text-lg text-slate-600">Configure suas integrações e preferências</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-600" />
                WhatsApp
              </CardTitle>
              <CardDescription>
                Configure suas integrações do WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Gerencie conexões, webhooks e configurações de API
              </p>
              <a 
                href="/whatsapp-api-hub"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Zap className="h-4 w-4" />
                Acessar API Hub
              </a>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Análise IA
              </CardTitle>
              <CardDescription>
                Configurações de análise inteligente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Personalize como a IA analisa suas conversas
              </p>
              <a 
                href="/analysis"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Brain className="h-4 w-4" />
                Ver Análises
              </a>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-gray-600" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>
              Preferências e configurações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Notificações</h3>
                <p className="text-sm text-gray-600">Configure como receber notificações do sistema</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Privacidade</h3>
                <p className="text-sm text-gray-600">Gerencie suas configurações de privacidade e dados</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Integrações</h3>
                <p className="text-sm text-gray-600">Configure integrações com outros serviços</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
