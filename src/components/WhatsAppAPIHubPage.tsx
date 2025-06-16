
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { RealWhatsAppHub } from './whatsapp/RealWhatsAppHub';
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function WhatsAppAPIHubPage() {
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
        API Real
      </Badge>
    </div>
  );

  return (
    <PageLayout
      title="WhatsApp API Hub Real"
      description="Conecte seu WhatsApp usando APIs reais - WPPConnect, Green API, Baileys e mais"
      headerActions={headerActions}
    >
      <RealWhatsAppHub />
    </PageLayout>
  );
}
