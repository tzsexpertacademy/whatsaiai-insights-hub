
import React from 'react';
import { PageHeader } from '@/components/PageHeader';

export function Recommendations() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Recomendações"
        subtitle="Sugestões personalizadas para seu desenvolvimento pessoal"
      />
      
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Recomendações da IA</h2>
          <p className="text-gray-600">Conteúdo das recomendações será implementado aqui.</p>
        </div>
      </div>
    </div>
  );
}
