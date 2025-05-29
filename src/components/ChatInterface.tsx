
import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { WhatsAppConnection } from '@/components/WhatsAppConnection';

export function ChatInterface() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="WhatsApp Chat"
        subtitle="Conecte e gerencie suas conversas do WhatsApp"
      />
      
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <WhatsAppConnection />
        </div>
      </div>
    </div>
  );
}
