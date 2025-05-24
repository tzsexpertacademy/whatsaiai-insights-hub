
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface AssistantsHeaderProps {
  onAddNew: () => void;
  onResetToDefaults: () => void;
  isLoading: boolean;
}

export function AssistantsHeader({ onAddNew, onResetToDefaults, isLoading }: AssistantsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Assistentes Inteligentes do Cérebro Comercial</h2>
        <p className="text-slate-600">
          Configure os 7 assistentes especializados na operação comercial completa
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Assistente
        </Button>
        <Button 
          onClick={onResetToDefaults} 
          variant="outline"
          disabled={isLoading}
        >
          Restaurar Padrões
        </Button>
      </div>
    </div>
  );
}
