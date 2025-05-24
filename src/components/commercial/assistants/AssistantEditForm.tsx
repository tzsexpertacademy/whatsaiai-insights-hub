
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface AssistantEditFormProps {
  assistant: CommercialAssistant;
  onUpdate: (assistant: CommercialAssistant) => void;
}

export function AssistantEditForm({ assistant, onUpdate }: AssistantEditFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>Modelo</Label>
        <Select 
          value={assistant?.model} 
          onValueChange={(value) => onUpdate({
            ...assistant,
            model: value
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Área de Especialização</Label>
        <Select 
          value={assistant?.area} 
          onValueChange={(value) => onUpdate({
            ...assistant,
            area: value
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="estrategia">Estratégia</SelectItem>
            <SelectItem value="gestao">Gestão</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="processos">Processos</SelectItem>
            <SelectItem value="vendas">Vendas</SelectItem>
            <SelectItem value="prospeccao">Prospecção</SelectItem>
            <SelectItem value="expansao">Expansão</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="md:col-span-2">
        <Label>Prompt do Sistema</Label>
        <Textarea
          value={assistant?.prompt || ''}
          onChange={(e) => onUpdate({
            ...assistant,
            prompt: e.target.value
          })}
          rows={8}
          placeholder="Instruções detalhadas para o assistente..."
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          checked={assistant?.isActive || false}
          onCheckedChange={(checked) => onUpdate({
            ...assistant,
            isActive: checked
          })}
        />
        <Label>Assistente Ativo</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          checked={assistant?.canRespond || false}
          onCheckedChange={(checked) => onUpdate({
            ...assistant,
            canRespond: checked
          })}
        />
        <Label>Pode Responder no WhatsApp</Label>
      </div>
    </div>
  );
}
