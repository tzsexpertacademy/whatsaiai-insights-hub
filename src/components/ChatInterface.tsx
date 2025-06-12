
import React from 'react';
import { WPPConnectMirror } from './whatsapp/WPPConnectMirror';
import { PageLayout } from '@/components/layout/PageLayout';
import { Badge } from "@/components/ui/badge";

export function ChatInterface() {
  const headerActions = (
    <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">
      📱 WPPConnect Local
    </Badge>
  );

  return (
    <PageLayout
      title="WhatsApp Chat"
      description="Suas conversas do WhatsApp via WPPConnect"
      showBackButton={true}
      headerActions={headerActions}
    >
      <WPPConnectMirror />
    </PageLayout>
  );
}
