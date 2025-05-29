
import React from 'react';
import { PageHeader } from '@/components/PageHeader';

export function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Notificações"
        subtitle="Gerencie suas notificações e alertas do sistema"
      />
      
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Centro de Notificações</h2>
          <p className="text-gray-600">Conteúdo das notificações será implementado aqui.</p>
        </div>
      </div>
    </div>
  );
}
