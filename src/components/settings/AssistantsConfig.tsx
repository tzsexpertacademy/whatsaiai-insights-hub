
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, Plus, Eye, MessageCircle } from 'lucide-react';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';

interface Assistant {
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

export function AssistantsConfig() {
  const { assistants, setAssistants, saveAssistants, isLoading } = useAssistantsConfig();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAssistant, setNewAssistant] = useState<Partial<Assistant>>({});
  const [showNewForm, setShowNewForm] = useState(false);

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = (id: string, updatedAssistant: Partial<Assistant>) => {
    const updatedAssistants = assistants.map(assistant => 
      assistant.id === id ? { ...assistant, ...updatedAssistant } : assistant
    );
    setAssistants(updatedAssistants);
    saveAssistants(updatedAssistants);
    setEditingId(null);
  };

  const handleToggleActive = (id: string) => {
    const updatedAssistants = assistants.map(assistant => 
      assistant.id === id ? { ...assistant, isActive: !assistant.isActive } : assistant
    );
    setAssistants(updatedAssistants);
    saveAssistants(updatedAssistants);
  };

  const handleAddAssistant = () => {
    if (!newAssistant.name || !newAssistant.prompt) {
      return;
    }

    const assistant: Assistant = {
      id: `custom-${Date.now()}`,
      name: newAssistant.name || '',
      description: newAssistant.description || '',
      prompt: newAssistant.prompt || '',
      model: newAssistant.model || 'gpt-4o-mini',
      isActive: true,
      canRespond: newAssistant.canRespond || false,
      icon: newAssistant.icon || '🤖',
      color: newAssistant.color || 'gray',
      area: newAssistant.area || 'geral'
    };

    const updatedAssistants = [...assistants, assistant];
    setAssistants(updatedAssistants);
    saveAssistants(updatedAssistants);
    setNewAssistant({});
    setShowNewForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Carregando assistentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Assistentes do Sistema</h2>
          <p className="text-slate-600">Configure personalidades e prompts dos assistentes que analisam suas conversas</p>
        </div>
        <Button onClick={() => setShowNewForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Assistente
        </Button>
      </div>

      {showNewForm && (
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Criar Novo Assistente</CardTitle>
            <CardDescription>Configure um novo assistente personalizado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-name">Nome *</Label>
                <Input
                  id="new-name"
                  value={newAssistant.name || ''}
                  onChange={(e) => setNewAssistant(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do assistente"
                />
              </div>
              <div>
                <Label htmlFor="new-icon">Ícone</Label>
                <Input
                  id="new-icon"
                  value={newAssistant.icon || ''}
                  onChange={(e) => setNewAssistant(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="🤖"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="new-description">Descrição</Label>
              <Input
                id="new-description"
                value={newAssistant.description || ''}
                onChange={(e) => setNewAssistant(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição breve do assistente"
              />
            </div>

            <div>
              <Label htmlFor="new-area">Área de Especialidade</Label>
              <Select value={newAssistant.area || 'geral'} onValueChange={(value) => setNewAssistant(prev => ({ ...prev, area: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Geral</SelectItem>
                  <SelectItem value="psicologia">Psicologia</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="saude">Saúde</SelectItem>
                  <SelectItem value="estrategia">Estratégia</SelectItem>
                  <SelectItem value="proposito">Propósito</SelectItem>
                  <SelectItem value="criatividade">Criatividade</SelectItem>
                  <SelectItem value="relacionamentos">Relacionamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="new-prompt">Prompt / Personalidade *</Label>
              <Textarea
                id="new-prompt"
                value={newAssistant.prompt || ''}
                onChange={(e) => setNewAssistant(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Defina a personalidade e comportamento do assistente..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-model">Modelo</Label>
                <Select value={newAssistant.model || 'gpt-4o-mini'} onValueChange={(value) => setNewAssistant(prev => ({ ...prev, model: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <Switch
                  id="new-canRespond"
                  checked={newAssistant.canRespond || false}
                  onCheckedChange={(checked) => setNewAssistant(prev => ({ ...prev, canRespond: checked }))}
                />
                <Label htmlFor="new-canRespond">Pode responder no WhatsApp</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddAssistant}>Criar Assistente</Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assistants.map((assistant) => (
          <Card key={assistant.id} className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{assistant.icon}</span>
                  {editingId === assistant.id ? (
                    <Input
                      defaultValue={assistant.name}
                      onBlur={(e) => handleSave(assistant.id, { name: e.target.value })}
                      className="font-semibold"
                    />
                  ) : (
                    assistant.name
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={assistant.isActive}
                    onCheckedChange={() => handleToggleActive(assistant.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editingId === assistant.id ? setEditingId(null) : handleEdit(assistant.id)}
                  >
                    {editingId === assistant.id ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <CardDescription>{assistant.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={assistant.isActive ? "default" : "secondary"}>
                  {assistant.isActive ? "Ativo" : "Inativo"}
                </Badge>
                <Badge variant="outline">
                  {assistant.model}
                </Badge>
                <Badge variant="outline">
                  {assistant.area || 'geral'}
                </Badge>
                {assistant.canRespond ? (
                  <Badge className="bg-green-100 text-green-800">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Responde WhatsApp
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Eye className="h-3 w-3 mr-1" />
                    Só Análise
                  </Badge>
                )}
              </div>

              <div>
                <Label>Prompt / Personalidade</Label>
                {editingId === assistant.id ? (
                  <Textarea
                    defaultValue={assistant.prompt}
                    onBlur={(e) => handleSave(assistant.id, { prompt: e.target.value })}
                    rows={4}
                    className="mt-2"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded-md">
                    {assistant.prompt}
                  </p>
                )}
              </div>

              {editingId === assistant.id && (
                <div className="space-y-3">
                  <div>
                    <Label>Área de Especialidade</Label>
                    <Select defaultValue={assistant.area || 'geral'} onValueChange={(value) => handleSave(assistant.id, { area: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geral">Geral</SelectItem>
                        <SelectItem value="psicologia">Psicologia</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="saude">Saúde</SelectItem>
                        <SelectItem value="estrategia">Estratégia</SelectItem>
                        <SelectItem value="proposito">Propósito</SelectItem>
                        <SelectItem value="criatividade">Criatividade</SelectItem>
                        <SelectItem value="relacionamentos">Relacionamentos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Modelo</Label>
                    <Select defaultValue={assistant.model} onValueChange={(value) => handleSave(assistant.id, { model: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={assistant.canRespond}
                      onCheckedChange={(checked) => handleSave(assistant.id, { canRespond: checked })}
                    />
                    <Label>Pode responder no WhatsApp</Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
