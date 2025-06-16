
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Brain, Eye, Target } from 'lucide-react';

interface ConsciousnessAlert {
  type: 'warning' | 'info' | 'danger';
  title: string;
  message: string;
}

interface ConsciousnessAlertsProps {
  alerts: ConsciousnessAlert[];
}

export function ConsciousnessAlerts({ alerts }: ConsciousnessAlertsProps) {
  if (alerts.length === 0) return null;

  const getAlertConfig = (type: string) => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          titleColor: 'text-red-900'
        };
      case 'warning':
        return {
          icon: <Eye className="h-5 w-5 text-yellow-600" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          titleColor: 'text-yellow-900'
        };
      default:
        return {
          icon: <Brain className="h-5 w-5 text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          titleColor: 'text-blue-900'
        };
    }
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => {
        const config = getAlertConfig(alert.type);
        
        return (
          <Card key={index} className={`${config.bgColor} ${config.borderColor} border`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {config.icon}
                <div className="flex-1">
                  <h4 className={`font-medium ${config.titleColor} mb-1`}>
                    {alert.title}
                  </h4>
                  <p className={`text-sm ${config.textColor}`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
