
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { getAreaIcon } from '../../../utils/assistantUtils';

interface CommercialAssistant {
  id: string;
  name: string;
  description: string;
  prompt: string;
  model: string;
  isActive: boolean;
  canRespond: boolean;
  icon: string;
  color: string;
  area?: string;
}

interface AssistantDisplayProps {
  assistant: CommercialAssistant;
  onToggleActive: (assistantId: string) => void;
}

export function AssistantDisplay({ assistant, onToggleActive }: AssistantDisplayProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Modelo:</span>
        <Badge variant="outline">{assistant.model}</Badge>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Área:</span>
        <Badge variant="outline" className="flex items-center gap-1">
          {getAreaIcon(assistant.area)}
          {assistant.area}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Status:</span>
        <Switch
          checked={assistant.isActive}
          onCheckedChange={() => onToggleActive(assistant.id)}
        />
      </div>
      
      <div>
        <span className="text-sm font-medium">Especialidade:</span>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2 bg-orange-50 p-2 rounded">
          {assistant.prompt.substring(0, 200)}...
        </p>
      </div>
    </div>
  );
}
