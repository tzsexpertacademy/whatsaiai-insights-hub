
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  isActive: boolean;
  clientsCount: number;
  revenue: number;
}

export function PlanManagement() {
  const { toast } = useToast();
  
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: '1',
      name: 'Básico',
      price: 139.90,
      description: 'Plano ideal para pequenas empresas e profissionais autônomos',
      features: ['Análise básica de conversas', 'Até 100 conversas/mês', 'Relatórios simples', 'Suporte por email'],
      isActive: true,
      clientsCount: 89,
      revenue: 12450
    },
    {
      id: '2',
      name: 'Premium',
      price: 279.90,
      description: 'Plano completo para empresas em crescimento',
      features: ['Análise avançada de conversas', 'Até 500 conversas/mês', 'Relatórios detalhados', 'IA personalizada', 'Suporte prioritário'],
      isActive: true,
      clientsCount: 67,
      revenue: 18690
    },
    {
      id: '3',
      name: 'Enterprise',
      price: 449.90,
      description: 'Solução empresarial completa',
      features: ['Análise ilimitada', 'Conversas ilimitadas', 'API personalizada', 'Treinamento da equipe', 'Suporte 24/7'],
      isActive: true,
      clientsCount: 31,
      revenue: 13860
    }
  ]);

  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlan, setNewPlan] = useState<Partial<Plan>>({
    name: '',
    price: 0,
    description: '',
    features: [],
    isActive: true
  });

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan({ ...plan });
  };

  const handleSaveEdit = () => {
    if (!editingPlan) return;
    
    setPlans(plans.map(plan => 
      plan.id === editingPlan.id ? editingPlan : plan
    ));
    setEditingPlan(null);
    toast({
      title: "Plano atualizado",
      description: `O plano ${editingPlan.name} foi atualizado com sucesso`
    });
  };

  const handleCreatePlan = () => {
    if (!newPlan.name || !newPlan.price) {
      toast({
        title: "Erro",
        description: "Nome e preço são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const plan: Plan = {
      id: Date.now().toString(),
      name: newPlan.name,
      price: newPlan.price,
      description: newPlan.description || '',
      features: newPlan.features || [],
      isActive: newPlan.isActive || true,
      clientsCount: 0,
      revenue: 0
    };

    setPlans([...plans, plan]);
    setNewPlan({
      name: '',
      price: 0,
      description: '',
      features: [],
      isActive: true
    });
    setIsCreating(false);
    toast({
      title: "Plano criado",
      description: `O plano ${plan.name} foi criado com sucesso`
    });
  };

  const handleDeletePlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    if (plan.clientsCount > 0) {
      toast({
        title: "Erro",
        description: "Não é possível excluir um plano com clientes ativos",
        variant: "destructive"
      });
      return;
    }

    setPlans(plans.filter(p => p.id !== planId));
    toast({
      title: "Plano excluído",
      description: `O plano ${plan.name} foi excluído com sucesso`
    });
  };

  const addFeature = (planData: any, setData: any, newFeature: string) => {
    if (!newFeature.trim()) return;
    setData({
      ...planData,
      features: [...(planData.features || []), newFeature.trim()]
    });
  };

  const removeFeature = (planData: any, setData: any, index: number) => {
    setData({
      ...planData,
      features: planData.features.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Planos</h2>
          <p className="text-gray-600">Gerencie os planos de assinatura da plataforma</p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Plano</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo plano de assinatura
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-name">Nome do Plano</Label>
                  <Input
                    id="new-name"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                    placeholder="Ex: Premium"
                  />
                </div>
                <div>
                  <Label htmlFor="new-price">Preço (R$)</Label>
                  <Input
                    id="new-price"
                    type="number"
                    step="0.01"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({...newPlan, price: parseFloat(e.target.value)})}
                    placeholder="279.90"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="new-description">Descrição</Label>
                <Textarea
                  id="new-description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                  placeholder="Descrição do plano..."
                />
              </div>

              <div>
                <Label>Funcionalidades</Label>
                <div className="space-y-2">
                  {newPlan.features?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 text-sm">{feature}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFeature(newPlan, setNewPlan, index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nova funcionalidade..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addFeature(newPlan, setNewPlan, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addFeature(newPlan, setNewPlan, input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreatePlan}>
                  Criar Plano
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {plan.name}
                  {plan.isActive && <Badge variant="default">Ativo</Badge>}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditPlan(plan)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeletePlan(plan.id)}
                    disabled={plan.clientsCount > 0}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-3xl font-bold">R$ {plan.price}</span>
                  <span className="text-gray-500">/mês</span>
                </div>
                
                <div className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • {feature}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-sm text-gray-500 pt-4 border-t">
                  <span>{plan.clientsCount} clientes</span>
                  <span>R$ {plan.revenue.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Edição */}
      {editingPlan && (
        <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Plano: {editingPlan.name}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Nome do Plano</Label>
                  <Input
                    id="edit-name"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price">Preço (R$)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({...editingPlan, price: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({...editingPlan, description: e.target.value})}
                />
              </div>

              <div>
                <Label>Funcionalidades</Label>
                <div className="space-y-2">
                  {editingPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...editingPlan.features];
                          newFeatures[index] = e.target.value;
                          setEditingPlan({...editingPlan, features: newFeatures});
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFeature(editingPlan, setEditingPlan, index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nova funcionalidade..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addFeature(editingPlan, setEditingPlan, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addFeature(editingPlan, setEditingPlan, input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingPlan(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
