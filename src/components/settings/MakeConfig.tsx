
import React from 'react';
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";
import { BasicConnectionConfig } from './make/BasicConnectionConfig';
import { AutoReplyConfig } from './make/AutoReplyConfig';
import { MakeInstructions } from './make/MakeInstructions';

export function MakeConfig() {
  const { makeConfig, updateMakeConfig, connectionState, toggleAutoReply } = useWhatsAppConnection();

  return (
    <div className="space-y-6">
      <BasicConnectionConfig 
        makeConfig={makeConfig} 
        updateMakeConfig={updateMakeConfig} 
      />
      
      <AutoReplyConfig 
        makeConfig={makeConfig} 
        updateMakeConfig={updateMakeConfig}
        connectionState={connectionState}
        toggleAutoReply={toggleAutoReply}
      />
      
      <MakeInstructions />
    </div>
  );
}
