
import React from 'react';
import { PageHeader } from '@/components/PageHeader';

export function BehavioralProfile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Perfil Comportamental"
        subtitle="Descubra padrões e características do seu comportamento"
      />
      
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Análise Comportamental</h2>
          <p className="text-gray-600">Conteúdo do perfil comportamental será implementado aqui.</p>
        </div>
      </div>
    </div>
  );
}
