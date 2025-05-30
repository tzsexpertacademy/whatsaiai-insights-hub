
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bot, Settings } from 'lucide-react';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';

interface AssistantSelectorProps {
  selectedAssistant: string;
  onAssistantChange: (assistantId: string) => void;
  className?: string;
}

export function AssistantSelector({ selectedAssistant, onAssistantChange, className = "" }: AssistantSelectorProps) {
  const { assistants, isLoading } = useAssistantsConfig();

  const selectedAssistantInfo = assistants.find(a => a.id === selectedAssistant) || assistants[0];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Bot className="h-4 w-4 text-purple-600" />
      <Select 
        value={selectedAssistant} 
        onValueChange={onAssistantChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-48 bg-white border-purple-200">
          <SelectValue placeholder="Selecionar assistente" />
        </SelectTrigger>
        <SelectContent>
          {assistants.map((assistant) => (
            <SelectItem key={assistant.id} value={assistant.id}>
              <div className="flex flex-col">
                <span className="font-medium">{assistant.name}</span>
                <span className="text-xs text-gray-500">{assistant.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedAssistantInfo && (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          {selectedAssistantInfo.name}
        </Badge>
      )}
      
      <Settings 
        className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" 
        onClick={() => window.location.href = '/settings'}
      />
    </div>
  );
}
