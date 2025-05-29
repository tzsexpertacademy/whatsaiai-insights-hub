
import React from 'react';
import { PageHeader } from '@/components/PageHeader';

export function ObservatoryTimeline() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Linha do Tempo"
        subtitle="Acompanhe sua evolução e marcos importantes ao longo do tempo"
      />
      
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Histórico de Evolução</h2>
          <p className="text-gray-600">Conteúdo da linha do tempo será implementado aqui.</p>
        </div>
      </div>
    </div>
  );
}
