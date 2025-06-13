
import { useCallback } from 'react';

export interface WPPConfig {
  sessionName: string;
  serverUrl: string;
  secretKey: string;
  token: string;
  webhookUrl?: string;
}

export function useWPPConfig() {
  const getWPPConfig = useCallback((): WPPConfig => {
    const savedConfig = {
      sessionName: localStorage.getItem('wpp_session_name') || 'NERDWHATS_AMERICA',
      serverUrl: localStorage.getItem('wpp_server_url') || 'http://localhost:21465',
      secretKey: localStorage.getItem('wpp_secret_key') || '',
      token: localStorage.getItem('wpp_token') || '',
      webhookUrl: localStorage.getItem('wpp_webhook_url') || ''
    };
    
    console.log('🔧 getWPPConfig - Configurações atuais:', {
      sessionName: savedConfig.sessionName,
      serverUrl: savedConfig.serverUrl,
      hasSecretKey: !!savedConfig.secretKey,
      hasToken: !!savedConfig.token,
      secretKeyLength: savedConfig.secretKey.length,
      tokenLength: savedConfig.token.length
    });
    
    return savedConfig;
  }, []);

  const saveWPPConfig = useCallback((config: Partial<WPPConfig>) => {
    console.log('💾 Salvando configuração WPPConnect:', config);
    
    if (config.sessionName !== undefined) localStorage.setItem('wpp_session_name', config.sessionName);
    if (config.serverUrl !== undefined) localStorage.setItem('wpp_server_url', config.serverUrl);
    if (config.secretKey !== undefined) localStorage.setItem('wpp_secret_key', config.secretKey);
    if (config.token !== undefined) localStorage.setItem('wpp_token', config.token);
    if (config.webhookUrl !== undefined) localStorage.setItem('wpp_webhook_url', config.webhookUrl);
    
    console.log('✅ Configuração salva no localStorage');
  }, []);

  return {
    getWPPConfig,
    saveWPPConfig
  };
}
