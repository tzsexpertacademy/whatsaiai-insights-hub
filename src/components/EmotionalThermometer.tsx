
import React from 'react';
import { PageHeader } from '@/components/PageHeader';

export function EmotionalThermometer() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Termômetro Emocional"
        subtitle="Monitore e analise seu estado emocional ao longo do tempo"
      />
      
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Análise Emocional</h2>
          <p className="text-gray-600">Conteúdo do termômetro emocional será implementado aqui.</p>
        </div>
      </div>
    </div>
  );
}
