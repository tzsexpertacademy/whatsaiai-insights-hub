
import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { ChatWithAssistants } from '@/components/ChatWithAssistants';

export function VoiceChatInterface() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Chat com Assistentes"
        subtitle="Converse por voz com seus assistentes de IA"
      />
      
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <ChatWithAssistants />
        </div>
      </div>
    </div>
  );
}
