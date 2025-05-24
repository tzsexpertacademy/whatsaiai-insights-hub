
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit, Save, X, Trash2 } from 'lucide-react';
import { AssistantEditForm } from './AssistantEditForm';
import { AssistantDisplay } from './AssistantDisplay';
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

interface AssistantCardProps {
  assistant: CommercialAssistant;
  isEditing: boolean;
  editingAssistant: CommercialAssistant | null;
  onEdit: (assistant: CommercialAssistant) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (assistantId: string) => void;
  onToggleActive: (assistantId: string) => void;
  onUpdateEditingAssistant: (assistant: CommercialAssistant) => void;
}

export function AssistantCard({
  assistant,
  isEditing,
  editingAssistant,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleActive,
  onUpdateEditingAssistant
}: AssistantCardProps) {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center`}>
              <span className="text-xl">{assistant.icon}</span>
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editingAssistant?.name || ''}
                    onChange={(e) => onUpdateEditingAssistant({
                      ...editingAssistant!,
                      name: e.target.value
                    })}
                    className="text-lg font-bold border rounded px-2 py-1"
                  />
                ) : (
                  <>
                    {assistant.name}
                    {getAreaIcon(assistant.area)}
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-orange-600 font-medium">
                {isEditing ? (
                  <input
                    type="text"
                    value={editingAssistant?.description || ''}
                    onChange={(e) => onUpdateEditingAssistant({
                      ...editingAssistant!,
                      description: e.target.value
                    })}
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : (
                  assistant.description
                )}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={assistant.isActive ? "default" : "secondary"}
              className={assistant.isActive ? "bg-green-500" : ""}
            >
              {assistant.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
            
            {assistant.canRespond && (
              <Badge variant="outline" className="border-blue-500 text-blue-600">
                Responde no WhatsApp
              </Badge>
            )}
            
            <div className="flex gap-1">
              {isEditing ? (
                <>
                  <Button onClick={onSave} size="sm" className="h-8 w-8 p-0">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button onClick={onCancel} variant="outline" size="sm" className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => onEdit(assistant)} variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => onDelete(assistant.id)} 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEditing ? (
          <AssistantEditForm
            assistant={editingAssistant!}
            onUpdate={onUpdateEditingAssistant}
          />
        ) : (
          <AssistantDisplay
            assistant={assistant}
            onToggleActive={onToggleActive}
          />
        )}
      </CardContent>
    </Card>
  );
}
