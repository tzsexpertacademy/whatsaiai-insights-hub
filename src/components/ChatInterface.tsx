
import React from 'react';
import { PageHeader } from '@/components/PageHeader';

export function ChatInterface() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="WhatsApp Chat"
        subtitle="Conecte e gerencie suas conversas do WhatsApp"
      />
      
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Interface do WhatsApp</h2>
          <p className="text-gray-600">Conteúdo do chat do WhatsApp será implementado aqui.</p>
        </div>
      </div>
    </div>
  );
}
