
import React, { useState } from 'react';
import { PlatformSelector } from './whatsapp/PlatformSelector';
import { WatiConfig } from './whatsapp/WatiConfig';
import { SleekFlowConfig } from './whatsapp/SleekFlowConfig';
import { MakeConfig } from './MakeConfig';

export function WhatsAppPlatformConfig() {
  const [selectedPlatform, setSelectedPlatform] = useState('make');
  
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

  const renderPlatformConfig = () => {
    switch (selectedPlatform) {
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
