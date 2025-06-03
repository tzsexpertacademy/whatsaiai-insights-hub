
import React from 'react';
import { RealWhatsAppMirror } from './whatsapp/RealWhatsAppMirror';
import { WPPConnectMirror } from './whatsapp/WPPConnectMirror';
import { WhatsAppMirror } from './whatsapp/WhatsAppMirror';
import { useClientConfig } from '@/contexts/ClientConfigContext';

export function ChatInterface() {
  const { config } = useClientConfig();
  
  // Determinar qual plataforma usar baseado na configuração
  const platform = config?.whatsapp?.platform || 'real';
  
  // Usar o novo WhatsApp Real como padrão
  if (platform === 'real' || platform === 'wppconnect') {
    return <RealWhatsAppMirror />;
  }
  
  // Fallback para outras opções
  return <WhatsAppMirror />;
}
