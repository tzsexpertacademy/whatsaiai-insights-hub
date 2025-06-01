
import React from 'react';
import { WPPConnectMirror } from './whatsapp/WPPConnectMirror';
import { WhatsAppMirror } from './whatsapp/WhatsAppMirror';
import { useClientConfig } from '@/contexts/ClientConfigContext';

export function ChatInterface() {
  const { config } = useClientConfig();
  
  // Determinar qual plataforma usar baseado na configuração
  const platform = config?.whatsapp?.platform || 'wppconnect';
  
  // Por enquanto, usar WPPConnect como padrão para a nova implementação
  if (platform === 'wppconnect') {
    return <WPPConnectMirror />;
  }
  
  // Fallback para GREEN-API se especificado
  return <WhatsAppMirror />;
}
