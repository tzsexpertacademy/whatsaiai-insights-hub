
import React from 'react';
import { RealWhatsAppMirror } from './whatsapp/RealWhatsAppMirror';
import { PageLayout } from '@/components/layout/PageLayout';
import { Badge } from "@/components/ui/badge";

export function ChatInterface() {
  const headerActions = (
    <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">
      📱 WhatsApp Conectado
    </Badge>
  );

  return (
    <PageLayout
      title="WhatsApp Chat"
      description="Suas conversas do WhatsApp em tempo real"
      showBackButton={true}
      headerActions={headerActions}
    >
      <RealWhatsAppMirror />
    </PageLayout>
  );
}
