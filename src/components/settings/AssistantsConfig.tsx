
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Brain, Edit, Save, X, Plus, Eye, MessageCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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
}

const defaultAssistants: Assistant[] = [
  {
    id: 'kairon',
    name: 'Kairon',
    description: 'Conselheiro Principal - Responde no WhatsApp',
    prompt: 'Você é Kairon, o conselheiro principal. Sua função é fornecer orientações práticas e compassivas baseadas nas análises dos outros assistentes. Mantenha um tom acolhedor mas direto.',
    model: 'gpt-4o',
    isActive: true,
    canRespond: true,
    icon: '🧠',
    color: 'blue'
  },
  {
    id: 'oracle',
    name: 'Oráculo das Sombras',
    description: 'Assistente Terapêutico - Análise apenas',
    prompt: 'Você é o Oráculo das Sombras, especialista em psicologia profunda. Analise padrões inconscientes, traumas não resolvidos e aspectos sombrios da personalidade. Sua análise é usada internamente.',
    model: 'gpt-4o',
    isActive: true,
    canRespond: false,
    icon: '🔮',
    color: 'purple'
  },
  {
    id: 'guardian',
    name: 'Guardião dos Recursos',
    description: 'Mentor Financeiro - Análise apenas',
    prompt: 'Você é o Guardião dos Recursos, mentor financeiro especializado. Analise padrões de gastos, decisões financeiras e relacionamento com dinheiro. Identifique oportunidades de crescimento financeiro.',
    model: 'gpt-4o-mini',
    isActive: true,
    canRespond: false,
    icon: '💰',
    color: 'green'
  },
  {
    id: 'engineer',
    name: 'Engenheiro do Corpo',
    description: 'Biohacker - Análise apenas',
    prompt: 'Você é o Engenheiro do Corpo, especialista em biohacking e otimização física. Analise padrões de saúde, sono, alimentação e exercícios mencionados nas conversas.',
    model: 'gpt-4o-mini',
    isActive: true,
    canRespond: false,
    icon: '⚡',
    color: 'red'
  },
  {
    id: 'architect',
    name: 'Arquiteto do Jogo',
    description: 'Estratégia de Vida - Análise apenas',
    prompt: 'Você é o Arquiteto do Jogo, estrategista de vida. Analise padrões de tomada de decisão, planejamento e execução de metas. Identifique pontos de melhoria na estratégia de vida.',
    model: 'gpt-4o-mini',
    isActive: true,
    canRespond: false,
    icon: '🎯',
    color: 'orange'
  },
  {
    id: 'weaver',
    name: 'Tecelão da Alma',
    description: 'Propósito e Legado - Análise apenas',
    prompt: 'Você é o Tecelão da Alma, especialista em propósito e legado. Analise conexões com propósito de vida, valores fundamentais e direcionamento existencial.',
    model: 'gpt-4o-mini',
    isActive: true,
    canRespond: false,
    icon: '✨',
    color: 'yellow'
  },
  {
    id: 'catalyst',
    name: 'Catalisador',
    description: 'Criatividade - Análise apenas',
    prompt: 'Você é o Catalisador, especialista em criatividade e inovação. Analise padrões criativos, bloqueios e potencial de inovação nas conversas.',
    model: 'gpt-4o-mini',
    isActive: true,
    canRespond: false,
    icon: '🎨',
    color: 'pink'
  },
  {
    id: 'mirror',
    name: 'Espelho Social',
    description: 'Relacionamentos - Análise apenas',
    prompt: 'Você é o Espelho Social, especialista em relacionamentos. Analise padrões de comunicação, vínculos sociais e dinâmicas relacionais mencionadas.',
    model: 'gpt-4o-mini',
    isActive: true,
    canRespond: false,
    icon: '👥',
    color: 'indigo'
  }
];

export function AssistantsConfig() {
  const [assistants, setAssistants] = useState<Assistant[]>(defaultAssistants);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAssistant, setNewAssistant] = useState<Partial<Assistant>>({});
  const [showNewForm, setShowNewForm] = useState(false);
  const { toast } = useToast();

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = (id: string, updatedAssistant: Partial<Assistant>) => {
    setAssistants(prev => prev.map(assistant => 
      assistant.id === id ? { ...assistant, ...updatedAssistant } : assistant
    ));
    setEditingId(null);
    toast({
      title: "Assistente atualizado",
      description: "Configurações salvas com sucesso",
    });
  };

  const handleToggleActive = (id: string) => {
    setAssistants(prev => prev.map(assistant => 
      assistant.id === id ? { ...assistant, isActive: !assistant.isActive } : assistant
    ));
  };

  const handleAddAssistant = () => {
    if (!newAssistant.name || !newAssistant.prompt) {
      toast({
        title: "Erro",
        description: "Nome e prompt são obrigatórios",
        variant: "destructive",
      });
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
      color: newAssistant.color || 'gray'
    };

    setAssistants(prev => [...prev, assistant]);
    setNewAssistant({});
    setShowNewForm(false);
    toast({
      title: "Assistente criado",
      description: "Novo assistente adicionado com sucesso",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Assistentes do Sistema</h2>
          <p className="text-slate-600">Configure personalidades e prompts dos assistentes</p>
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
                    <SelectItem value="gpt-4.5-preview">GPT-4.5 Preview</SelectItem>
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
                    <Label>Modelo</Label>
                    <Select defaultValue={assistant.model} onValueChange={(value) => handleSave(assistant.id, { model: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        <SelectItem value="gpt-4.5-preview">GPT-4.5 Preview</SelectItem>
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
