import React, { useState } from 'react';
import { PlatformSelector } from './whatsapp/PlatformSelector';
import { WatiConfig } from './whatsapp/WatiConfig';
import { SleekFlowConfig } from './whatsapp/SleekFlowConfig';
import { MakeConfig } from './MakeConfig';
import { WAWebJSConfig } from './whatsapp/WAWebJSConfig';
import { WhatsAppWebConfig } from './whatsapp/WhatsAppWebConfig';
import { AtendechatConfig } from './whatsapp/AtendechatConfig';

export function WhatsAppPlatformConfig() {
  const [selectedPlatform, setSelectedPlatform] = useState('atendechat');
  
  // Configurações para cada plataforma
  const [watiConfig, setWatiConfig] = useState({
    apiKey: localStorage.getItem('wati_api_key') || '',
    webhookUrl: localStorage.getItem('wati_webhook_url') || '',
    sendEndpoint: localStorage.getItem('wati_send_endpoint') || ''
  });

  const [sleekflowConfig, setSleekflowConfig] = useState({
    apiToken: localStorage.getItem('sleekflow_api_token') || '',
    channelId: localStorage.getItem('sleekflow_channel_id') || '',
    webhookUrl: localStorage.getItem('sleekflow_webhook_url') || ''
  });
  
  const [wawebjsConfig, setWAWebJSConfig] = useState({
    serverUrl: localStorage.getItem('wawebjs_server_url') || '',
    clientId: localStorage.getItem('wawebjs_client_id') || '',
    autoRestart: localStorage.getItem('wawebjs_auto_restart') === 'true'
  });

  const [webConfig, setWebConfig] = useState({
    sessionName: localStorage.getItem('whatsappweb_session_name') || '',
    autoReply: localStorage.getItem('whatsappweb_auto_reply') === 'true',
    welcomeMessage: localStorage.getItem('whatsappweb_welcome_message') || ''
  });

  const [atendechatConfig, setAtendechatConfig] = useState({
    apiUrl: localStorage.getItem('atendechat_api_url') || 'https://api.enigmafranquias.tzsacademy.com',
    authToken: localStorage.getItem('atendechat_auth_token') || '',
    username: localStorage.getItem('atendechat_username') || '',
    password: localStorage.getItem('atendechat_password') || '',
    sessionId: localStorage.getItem('atendechat_session_id') || '',
    isConnected: localStorage.getItem('atendechat_is_connected') === 'true'
  });

  const updateWatiConfig = (config: Partial<typeof watiConfig>) => {
    const newConfig = { ...watiConfig, ...config };
    setWatiConfig(newConfig);
    
    // Salvar no localStorage
    Object.entries(newConfig).forEach(([key, value]) => {
      localStorage.setItem(`wati_${key}`, value);
    });
  };

  const updateSleekFlowConfig = (config: Partial<typeof sleekflowConfig>) => {
    const newConfig = { ...sleekflowConfig, ...config };
    setSleekflowConfig(newConfig);
    
    // Salvar no localStorage
    Object.entries(newConfig).forEach(([key, value]) => {
      localStorage.setItem(`sleekflow_${key}`, value);
    });
  };
  
  const updateWAWebJSConfig = (config: Partial<typeof wawebjsConfig>) => {
    const newConfig = { ...wawebjsConfig, ...config };
    setWAWebJSConfig(newConfig);
    
    // Salvar no localStorage
    Object.entries(newConfig).forEach(([key, value]) => {
      localStorage.setItem(`wawebjs_${key}`, typeof value === 'boolean' ? String(value) : value);
    });
  };

  const updateWebConfig = (config: Partial<typeof webConfig>) => {
    const newConfig = { ...webConfig, ...config };
    setWebConfig(newConfig);
    
    // Salvar no localStorage
    Object.entries(newConfig).forEach(([key, value]) => {
      localStorage.setItem(`whatsappweb_${key}`, typeof value === 'boolean' ? String(value) : value);
    });
  };

  const updateAtendechatConfig = (config: Partial<typeof atendechatConfig>) => {
    const newConfig = { ...atendechatConfig, ...config };
    setAtendechatConfig(newConfig);
    
    // Salvar no localStorage
    Object.entries(newConfig).forEach(([key, value]) => {
      localStorage.setItem(`atendechat_${key}`, typeof value === 'boolean' ? String(value) : value);
    });
  };

  const renderPlatformConfig = () => {
    switch (selectedPlatform) {
      case 'atendechat':
        return (
          <AtendechatConfig 
            atendechatConfig={atendechatConfig}
            updateAtendechatConfig={updateAtendechatConfig}
          />
        );
      case 'whatsappweb':
        return (
          <WhatsAppWebConfig 
            webConfig={webConfig}
            updateWebConfig={updateWebConfig}
          />
        );
      case 'wati':
        return (
          <WatiConfig 
            watiConfig={watiConfig}
            updateWatiConfig={updateWatiConfig}
          />
        );
      case 'sleekflow':
        return (
          <SleekFlowConfig 
            sleekflowConfig={sleekflowConfig}
            updateSleekFlowConfig={updateSleekFlowConfig}
          />
        );
      case 'wawebjs':
        return (
          <WAWebJSConfig 
            wawebjsConfig={wawebjsConfig}
            updateWAWebJSConfig={updateWAWebJSConfig}
          />
        );
      case 'make':
      default:
        return <MakeConfig />;
    }
  };

  return (
    <div className="space-y-6">
      <PlatformSelector 
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
      />
      
      {renderPlatformConfig()}
    </div>
  );
}
