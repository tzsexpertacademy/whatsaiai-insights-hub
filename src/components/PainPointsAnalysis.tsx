
import React from 'react';
import { PageHeader } from '@/components/PageHeader';

export function PainPointsAnalysis() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Pontos de Dor"
        subtitle="Identifique e trabalhe os principais desafios e obstáculos"
      />
      
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Análise de Pontos de Dor</h2>
          <p className="text-gray-600">Conteúdo da análise de pontos de dor será implementado aqui.</p>
        </div>
      </div>
    </div>
  );
}
