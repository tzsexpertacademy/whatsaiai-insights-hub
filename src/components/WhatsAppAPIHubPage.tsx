
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RealWhatsAppHub } from './whatsapp/RealWhatsAppHub';
import { WhatsAppMultiClientAdmin } from './whatsapp/WhatsAppMultiClientAdmin';
import { SimpleWhatsAppClient } from './whatsapp/SimpleWhatsAppClient';
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowLeft, Users, Server, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';

export function WhatsAppAPIHubPage() {
  const { isAdmin } = useAdmin();

  const headerActions = (
    <div className="flex items-center gap-4">
      <Link 
        to="/dashboard/settings"
        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Configurações
      </Link>
      <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm flex items-center gap-1">
        <Zap className="h-3 w-3" />
        {isAdmin ? 'API Hub Completo' : 'WhatsApp Business'}
      </Badge>
    </div>
  );

  // Interface simplificada para clientes regulares
  if (!isAdmin) {
    return (
      <PageLayout
        title="WhatsApp Business"
        description="Conecte seu WhatsApp Business de forma simples e segura"
        headerActions={headerActions}
      >
        <SimpleWhatsAppClient />
      </PageLayout>
    );
  }

  // Interface completa para administradores
  return (
    <PageLayout
      title="WhatsApp API Hub Completo"
      description="Soluções integradas de WhatsApp - APIs reais e sistema multi-cliente SaaS"
      headerActions={headerActions}
    >
      <Tabs defaultValue="client-simple" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="client-simple" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Cliente Simples
          </TabsTrigger>
          <TabsTrigger value="multicliente" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Multi-Cliente SaaS
          </TabsTrigger>
          <TabsTrigger value="apis" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            APIs Externas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="client-simple">
          <SimpleWhatsAppClient />
        </TabsContent>

        <TabsContent value="multicliente">
          <WhatsAppMultiClientAdmin />
        </TabsContent>

        <TabsContent value="apis">
          <RealWhatsAppHub />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
