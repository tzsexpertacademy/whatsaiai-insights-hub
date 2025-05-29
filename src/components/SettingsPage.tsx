
import React from 'react';
import { PageHeader } from '@/components/PageHeader';

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Configurações"
        subtitle="Gerencie suas preferências e configurações do sistema"
      />
      
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Configurações do Sistema</h2>
          <p className="text-gray-600">Conteúdo das configurações será implementado aqui.</p>
        </div>
      </div>
    </div>
  );
}
