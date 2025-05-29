
import React from 'react';
import { PageHeader } from '@/components/PageHeader';

export function VoiceChatInterface() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Chat com Assistentes"
        subtitle="Converse por voz com seus assistentes de IA"
      />
      
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Chat por Voz</h2>
          <p className="text-gray-600">Conteúdo do chat por voz será implementado aqui.</p>
        </div>
      </div>
    </div>
  );
}
