
import React from 'react';
import { PageHeader } from '@/components/PageHeader';

export function AreasOfLife() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Áreas da Vida"
        subtitle="Avalie e equilibre as diferentes áreas da sua vida"
      />
      
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Mapeamento das Áreas</h2>
          <p className="text-gray-600">Conteúdo das áreas da vida será implementado aqui.</p>
        </div>
      </div>
    </div>
  );
}
