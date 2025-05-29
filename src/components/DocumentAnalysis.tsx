
import React from 'react';
import { PageHeader } from '@/components/PageHeader';

export function DocumentAnalysis() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Análise de Documentos"
        subtitle="Analise e extraia insights de seus documentos e textos"
      />
      
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Processamento de Documentos</h2>
          <p className="text-gray-600">Conteúdo da análise de documentos será implementado aqui.</p>
        </div>
      </div>
    </div>
  );
}
