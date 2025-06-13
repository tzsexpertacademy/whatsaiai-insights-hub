
import React from 'react';
import { CheckCircle, WifiOff } from 'lucide-react';

interface ConnectionStatusDisplayProps {
  connectionStatus: 'active' | 'idle' | 'disconnected';
  phoneNumber?: string;
}

export function ConnectionStatusDisplay({ connectionStatus, phoneNumber }: ConnectionStatusDisplayProps) {
  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'active':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          text: 'Conectado e Ativo',
          color: 'text-green-600'
        };
      default:
        return {
          icon: <WifiOff className="h-6 w-6 text-gray-400" />,
          text: 'Desconectado',
          color: 'text-gray-600'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      {statusInfo.icon}
      <span className={`font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
      {phoneNumber && (
        <span className="text-sm text-gray-500 ml-auto">
          {phoneNumber}
        </span>
      )}
    </div>
  );
}
