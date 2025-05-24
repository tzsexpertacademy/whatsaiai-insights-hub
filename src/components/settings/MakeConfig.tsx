
import React from 'react';
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";
import { BasicConnectionConfig } from './make/BasicConnectionConfig';
import { AutoReplyConfig } from './make/AutoReplyConfig';
import { MakeInstructions } from './make/MakeInstructions';
import { MakeSetupGuide } from './make/MakeSetupGuide';
import { MakeConnectionTest } from './make/MakeConnectionTest';

export function MakeConfig() {
  const { makeConfig, updateMakeConfig, connectionState, toggleAutoReply } = useWhatsAppConnection();

  return (
    <div className="space-y-6">
      {/* Guia completo de configuração */}
      <MakeSetupGuide />
      
      {/* Configuração básica */}
      <BasicConnectionConfig 
        makeConfig={makeConfig} 
        updateMakeConfig={updateMakeConfig} 
      />
      
      {/* Configuração de respostas automáticas */}
      <AutoReplyConfig 
        makeConfig={makeConfig} 
        updateMakeConfig={updateMakeConfig}
        connectionState={connectionState}
        toggleAutoReply={toggleAutoReply}
      />

      {/* Teste de conexão */}
      <MakeConnectionTest 
        makeConfig={makeConfig} 
        updateMakeConfig={updateMakeConfig}
      />
      
      {/* Instruções finais */}
      <MakeInstructions />
    </div>
  );
}
