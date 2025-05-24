
import React from 'react';
import { useToast } from "@/hooks/use-toast";
import { useCommercialAssistantsConfig } from '@/hooks/useCommercialAssistantsConfig';
import { AssistantsHeader } from './assistants/AssistantsHeader';
import { AssistantCard } from './assistants/AssistantCard';

export function CommercialAssistantsConfig() {
  const { 
    assistants, 
    setAssistants, 
    saveAssistants, 
    isLoading,
    defaultAssistants 
  } = useCommercialAssistantsConfig();
  
  const { toast } = useToast();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingAssistant, setEditingAssistant] = React.useState<any>(null);

  const handleEdit = (assistant: any) => {
    setEditingId(assistant.id);
    setEditingAssistant({ ...assistant });
  };

  const handleSave = async () => {
    if (!editingAssistant) return;
    
    const updatedAssistants = assistants.map(a => 
      a.id === editingAssistant.id ? editingAssistant : a
    );
    
    await saveAssistants(updatedAssistants);
    setEditingId(null);
    setEditingAssistant(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingAssistant(null);
  };

  const handleDelete = async (assistantId: string) => {
    const updatedAssistants = assistants.filter(a => a.id !== assistantId);
    await saveAssistants(updatedAssistants);
  };

  const handleToggleActive = async (assistantId: string) => {
    const updatedAssistants = assistants.map(a => 
      a.id === assistantId ? { ...a, isActive: !a.isActive } : a
    );
    await saveAssistants(updatedAssistants);
  };

  const handleAddNew = () => {
    const newAssistant = {
      id: `commercial_${Date.now()}`,
      name: 'Novo Assistente Comercial',
      description: 'Assistente especializado em vendas',
      prompt: 'Você é um assistente comercial especializado...',
      model: 'gpt-4o-mini',
      isActive: true,
      canRespond: false,
      icon: '💼',
      color: 'green',
      area: 'vendas'
    };
    
    setAssistants([...assistants, newAssistant]);
    handleEdit(newAssistant);
  };

  const resetToDefaults = async () => {
    await saveAssistants(defaultAssistants);
    toast({
      title: "Configuração restaurada",
      description: "Assistentes comerciais restaurados para configuração padrão",
    });
  };

  return (
    <div className="space-y-6">
      <AssistantsHeader
        onAddNew={handleAddNew}
        onResetToDefaults={resetToDefaults}
        isLoading={isLoading}
      />

      <div className="grid gap-6">
        {assistants.map((assistant) => (
          <AssistantCard
            key={assistant.id}
            assistant={assistant}
            isEditing={editingId === assistant.id}
            editingAssistant={editingAssistant}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            onUpdateEditingAssistant={setEditingAssistant}
          />
        ))}
      </div>
    </div>
  );
}
