
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bot, Phone } from 'lucide-react';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';

interface AssistantChatConfigProps {
  chatId: string;
  chatName: string;
  assignedAssistant?: string;
  onAssistantChange: (chatId: string, assistantId: string) => void;
}

export function AssistantChatConfig({ 
  chatId, 
  chatName, 
  assignedAssistant, 
  onAssistantChange 
}: AssistantChatConfigProps) {
  const { assistants } = useAssistantsConfig();

  const selectedAssistantInfo = assistants.find(a => a.id === assignedAssistant);

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Bot className="h-4 w-4" />
          Assistente para este número
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Phone className="h-3 w-3" />
          {chatName}
        </div>
        
        <Select 
          value={assignedAssistant || ''} 
          onValueChange={(value) => onAssistantChange(chatId, value)}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Selecionar assistente..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhum assistente</SelectItem>
            {assistants.filter(a => a.isActive).map((assistant) => (
              <SelectItem key={assistant.id} value={assistant.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{assistant.name}</span>
                  <span className="text-xs text-gray-500">{assistant.area}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedAssistantInfo && (
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
            🤖 {selectedAssistantInfo.name}
          </Badge>
        )}
        
        <p className="text-xs text-gray-500">
          Quando alguém mandar mensagem para este número, o assistente selecionado responderá automaticamente.
        </p>
      </CardContent>
    </Card>
  );
}
