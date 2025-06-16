
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { WhatsAppAPIHub } from './whatsapp/WhatsAppAPIHub';
import { Badge } from "@/components/ui/badge";
import { Zap } from 'lucide-react';

export function WhatsAppAPIHubPage() {
  const headerActions = (
    <div className="flex items-center gap-2">
      <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm flex items-center gap-1">
        <Zap className="h-3 w-3" />
        API Hub Universal
      </Badge>
    </div>
  );

  return (
    <PageLayout
      title="WhatsApp API Hub"
      description="Solução estilo Swagger para integração WhatsApp - Escaneie uma vez, funciona em qualquer sistema"
      showBackButton={true}
      headerActions={headerActions}
    >
      <WhatsAppAPIHub />
    </PageLayout>
  );
}
