
import React from 'react';
import { ConnectionStatus } from './ConnectionStatus';
import { QRCodeGenerator } from './QRCodeGenerator';
import { MakeConfig } from './MakeConfig';
import { IntegrationGuide } from './IntegrationGuide';

export function WhatsAppConfig() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConnectionStatus />
        <QRCodeGenerator />
      </div>
      <MakeConfig />
      <IntegrationGuide />
    </div>
  );
}
