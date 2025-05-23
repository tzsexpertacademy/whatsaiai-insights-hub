
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Database, Bot, MessageSquare, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Componente simples para testar cada aba
function SimpleWhatsAppConfig() {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-600" />
          Configuração WhatsApp
        </CardTitle>
        <CardDescription>
          Configurações do WhatsApp Business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-6 w-6 text-yellow-500" />
          <span className="text-yellow-600 font-medium">Configuração Simplificada</span>
        </div>
        <p className="text-gray-600">
          Esta é uma versão simplificada da configuração do WhatsApp. 
          As funcionalidades completas serão restauradas após os testes.
        </p>
      </CardContent>
    </Card>
  );
}

function SimpleFirebaseConfig() {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-orange-600" />
          Configuração Firebase
        </CardTitle>
        <CardDescription>
          Configurações do banco de dados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-6 w-6 text-yellow-500" />
          <span className="text-yellow-600 font-medium">Configuração Simplificada</span>
        </div>
        <p className="text-gray-600">
          Esta é uma versão simplificada da configuração do Firebase. 
          As funcionalidades completas serão restauradas após os testes.
        </p>
      </CardContent>
    </Card>
  );
}

function SimpleOpenAIConfig() {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-green-600" />
          Configuração OpenAI
        </CardTitle>
        <CardDescription>
          Configurações da API OpenAI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-6 w-6 text-yellow-500" />
          <span className="text-yellow-600 font-medium">Configuração Simplificada</span>
        </div>
        <p className="text-gray-600">
          Esta é uma versão simplificada da configuração da OpenAI. 
          As funcionalidades completas serão restauradas após os testes.
        </p>
      </CardContent>
    </Card>
  );
}

function SimpleAssistantsConfig() {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Configuração Assistentes
        </CardTitle>
        <CardDescription>
          Gerenciar assistentes de IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-6 w-6 text-yellow-500" />
          <span className="text-yellow-600 font-medium">Configuração Simplificada</span>
        </div>
        <p className="text-gray-600">
          Esta é uma versão simplificada da configuração dos assistentes. 
          As funcionalidades completas serão restauradas após os testes.
        </p>
      </CardContent>
    </Card>
  );
}

function SimpleClientConfig() {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-600" />
          Configuração Clientes
        </CardTitle>
        <CardDescription>
          Gerenciar clientes do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-6 w-6 text-yellow-500" />
          <span className="text-yellow-600 font-medium">Configuração Simplificada</span>
        </div>
        <p className="text-gray-600">
          Esta é uma versão simplificada da configuração dos clientes. 
          As funcionalidades completas serão restauradas após os testes.
        </p>
      </CardContent>
    </Card>
  );
}

export function SettingsPage() {
  console.log('SettingsPage - Componente sendo renderizado (versão simplificada)');
  
  const { user, isAuthenticated } = useAuth();
  
  console.log('SettingsPage - Estado da autenticação:', {
    isAuthenticated,
    user: user ? { id: user.id, email: user.email } : null
  });

  if (!isAuthenticated) {
    console.log('SettingsPage - Usuário não autenticado');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              Você precisa estar logado para acessar as configurações.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  try {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Configurações do Sistema</h1>
          <p className="text-slate-600">Configure todas as integrações e assistentes da plataforma</p>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Modo de Teste</span>
            </div>
            <p className="text-yellow-700 mt-1">
              Esta é uma versão simplificada para diagnosticar problemas. 
              As configurações completas serão restauradas após confirmar que tudo está funcionando.
            </p>
          </div>
        </div>

        <Tabs defaultValue="whatsapp" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="firebase" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Firebase
            </TabsTrigger>
            <TabsTrigger value="openai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              OpenAI
            </TabsTrigger>
            <TabsTrigger value="assistants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assistentes
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Clientes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="whatsapp">
            <SimpleWhatsAppConfig />
          </TabsContent>

          <TabsContent value="firebase">
            <SimpleFirebaseConfig />
          </TabsContent>

          <TabsContent value="openai">
            <SimpleOpenAIConfig />
          </TabsContent>

          <TabsContent value="assistants">
            <SimpleAssistantsConfig />
          </TabsContent>

          <TabsContent value="clients">
            <SimpleClientConfig />
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error('SettingsPage - Erro na renderização:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro na Página de Configurações</h1>
          <p className="text-gray-600">Erro: {error.message}</p>
          <p className="text-gray-500 mt-2">Verifique o console para mais detalhes</p>
        </div>
      </div>
    );
  }
}
