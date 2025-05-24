
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Edit, Save, X, Target, TrendingUp, Users, Cog, DollarSign, Zap, Rocket } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useCommercialAssistantsConfig } from '@/hooks/useCommercialAssistantsConfig';

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

  const getAreaIcon = (area: string) => {
    switch (area) {
      case 'estrategia': return <Target className="h-4 w-4" />;
      case 'gestao': return <Users className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'processos': return <Cog className="h-4 w-4" />;
      case 'vendas': return <DollarSign className="h-4 w-4" />;
      case 'prospeccao': return <Zap className="h-4 w-4" />;
      case 'expansao': return <Rocket className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Assistentes Inteligentes do Cérebro Comercial</h2>
          <p className="text-slate-600">
            Configure os 7 assistentes especializados na operação comercial completa
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Assistente
          </Button>
          <Button 
            onClick={resetToDefaults} 
            variant="outline"
            disabled={isLoading}
          >
            Restaurar Padrões
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {assistants.map((assistant) => (
          <Card key={assistant.id} className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center`}>
                    <span className="text-xl">{assistant.icon}</span>
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {editingId === assistant.id ? (
                        <Input
                          value={editingAssistant?.name || ''}
                          onChange={(e) => setEditingAssistant({
                            ...editingAssistant,
                            name: e.target.value
                          })}
                          className="text-lg font-bold"
                        />
                      ) : (
                        <>
                          {assistant.name}
                          {getAreaIcon(assistant.area)}
                        </>
                      )}
                    </CardTitle>
                    <CardDescription className="text-orange-600 font-medium">
                      {editingId === assistant.id ? (
                        <Input
                          value={editingAssistant?.description || ''}
                          onChange={(e) => setEditingAssistant({
                            ...editingAssistant,
                            description: e.target.value
                          })}
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
                    {editingId === assistant.id ? (
                      <>
                        <Button onClick={handleSave} size="sm" className="h-8 w-8 p-0">
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button onClick={handleCancel} variant="outline" size="sm" className="h-8 w-8 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => handleEdit(assistant)} variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDelete(assistant.id)} 
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
              {editingId === assistant.id ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Modelo</Label>
                    <Select 
                      value={editingAssistant?.model} 
                      onValueChange={(value) => setEditingAssistant({
                        ...editingAssistant,
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
                      value={editingAssistant?.area} 
                      onValueChange={(value) => setEditingAssistant({
                        ...editingAssistant,
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
                      value={editingAssistant?.prompt || ''}
                      onChange={(e) => setEditingAssistant({
                        ...editingAssistant,
                        prompt: e.target.value
                      })}
                      rows={8}
                      placeholder="Instruções detalhadas para o assistente..."
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingAssistant?.isActive || false}
                      onCheckedChange={(checked) => setEditingAssistant({
                        ...editingAssistant,
                        isActive: checked
                      })}
                    />
                    <Label>Assistente Ativo</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingAssistant?.canRespond || false}
                      onCheckedChange={(checked) => setEditingAssistant({
                        ...editingAssistant,
                        canRespond: checked
                      })}
                    />
                    <Label>Pode Responder no WhatsApp</Label>
                  </div>
                </div>
              ) : (
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
                      onCheckedChange={() => handleToggleActive(assistant.id)}
                    />
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Especialidade:</span>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2 bg-orange-50 p-2 rounded">
                      {assistant.prompt.substring(0, 200)}...
                    </p>
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
