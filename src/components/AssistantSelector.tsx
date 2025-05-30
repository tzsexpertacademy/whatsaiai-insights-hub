
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bot, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useClientConfig } from '@/contexts/ClientConfigContext';

interface Assistant {
  id: string;
  assistant_name: string;
  assistant_role: string;
  prompt: string;
  is_active: boolean;
}

interface AssistantSelectorProps {
  selectedAssistant: string;
  onAssistantChange: (assistantId: string) => void;
  className?: string;
}

export function AssistantSelector({ selectedAssistant, onAssistantChange, className = "" }: AssistantSelectorProps) {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const { config } = useClientConfig();

  // Assistente padrão
  const defaultAssistant = {
    id: 'autoconhecimento',
    assistant_name: 'Autoconhecimento',
    assistant_role: 'Especialista em desenvolvimento pessoal',
    prompt: 'Assistente focado em autoconhecimento e reflexão pessoal',
    is_active: true
  };

  useEffect(() => {
    loadAssistants();
  }, []);

  const loadAssistants = async () => {
    try {
      setLoading(true);
      
      // Buscar assistentes configurados pelo usuário
      const { data: userAssistants, error } = await supabase
        .from('assistants_config')
        .select('*')
        .eq('user_id', config.whatsapp?.authorizedNumber || 'default')
        .eq('is_active', true)
        .order('assistant_name');

      if (error) {
        console.error('Erro ao carregar assistentes:', error);
        setAssistants([defaultAssistant]);
        return;
      }

      // Combinar assistente padrão com assistentes personalizados
      const allAssistants = [
        defaultAssistant,
        ...(userAssistants || []).map(assistant => ({
          id: assistant.assistant_name.toLowerCase(),
          assistant_name: assistant.assistant_name,
          assistant_role: assistant.assistant_role,
          prompt: assistant.prompt,
          is_active: assistant.is_active
        }))
      ];

      setAssistants(allAssistants);
      
    } catch (error) {
      console.error('Erro ao carregar assistentes:', error);
      setAssistants([defaultAssistant]);
    } finally {
      setLoading(false);
    }
  };

  const selectedAssistantInfo = assistants.find(a => a.id === selectedAssistant) || defaultAssistant;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Bot className="h-4 w-4 text-purple-600" />
      <Select 
        value={selectedAssistant} 
        onValueChange={onAssistantChange}
        disabled={loading}
      >
        <SelectTrigger className="w-48 bg-white border-purple-200">
          <SelectValue placeholder="Selecionar assistente" />
        </SelectTrigger>
        <SelectContent>
          {assistants.map((assistant) => (
            <SelectItem key={assistant.id} value={assistant.id}>
              <div className="flex flex-col">
                <span className="font-medium">{assistant.assistant_name}</span>
                <span className="text-xs text-gray-500">{assistant.assistant_role}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedAssistantInfo && (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          {selectedAssistantInfo.assistant_name}
        </Badge>
      )}
      
      <Settings 
        className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" 
        onClick={() => window.location.href = '/settings'}
        title="Configurar assistentes"
      />
    </div>
  );
}
