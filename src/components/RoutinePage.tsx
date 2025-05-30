import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Clock, Target, TrendingUp, Edit2, Trash2, Lightbulb, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';

interface RoutineActivity {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  category: 'work' | 'health' | 'personal' | 'study' | 'leisure';
  priority: 'low' | 'medium' | 'high';
  frequency: 'daily' | 'weekly' | 'monthly';
  createdAt: Date;
}

interface RoutineInsight {
  id: string;
  activityId: string;
  type: 'optimization' | 'health' | 'productivity' | 'balance';
  title: string;
  description: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
  createdAt: Date;
}

const categoryLabels = {
  work: 'Trabalho',
  health: 'Saúde',
  personal: 'Pessoal',
  study: 'Estudos',
  leisure: 'Lazer'
};

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta'
};

const frequencyLabels = {
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal'
};

// Simulação de insights gerados por IA
const generateInsights = (activities: RoutineActivity[]): RoutineInsight[] => {
  const insights: RoutineInsight[] = [];
  
  activities.forEach(activity => {
    // Análise de horários de trabalho
    if (activity.category === 'work') {
      const startHour = parseInt(activity.startTime.split(':')[0]);
      if (startHour < 7 || startHour > 9) {
        insights.push({
          id: `insight-${activity.id}-timing`,
          activityId: activity.id,
          type: 'productivity',
          title: 'Otimização de Horário',
          description: 'Horário de início pode impactar produtividade',
          suggestion: 'Considere iniciar trabalho entre 7h e 9h para máxima produtividade.',
          impact: 'medium',
          createdAt: new Date()
        });
      }
    }
    
    // Análise de atividades de saúde
    if (activity.category === 'health') {
      insights.push({
        id: `insight-${activity.id}-health`,
        activityId: activity.id,
        type: 'health',
        title: 'Excelente Hábito',
        description: 'Atividade de saúde bem posicionada na rotina',
        suggestion: 'Continue mantendo esta atividade! Considere aumentar a duração gradualmente.',
        impact: 'high',
        createdAt: new Date()
      });
    }
  });
  
  // Análise geral de equilíbrio
  const workActivities = activities.filter(a => a.category === 'work').length;
  const healthActivities = activities.filter(a => a.category === 'health').length;
  const leisureActivities = activities.filter(a => a.category === 'leisure').length;
  
  if (workActivities > healthActivities + leisureActivities) {
    insights.push({
      id: 'insight-balance',
      activityId: '',
      type: 'balance',
      title: 'Equilíbrio Vida-Trabalho',
      description: 'Detectado foco excessivo em atividades profissionais',
      suggestion: 'Considere adicionar mais atividades de saúde e lazer para melhor equilíbrio.',
      impact: 'high',
      createdAt: new Date()
    });
  }
  
  return insights;
};

export function RoutinePage() {
  const [activities, setActivities] = useState<RoutineActivity[]>([]);
  const [insights, setInsights] = useState<RoutineInsight[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<RoutineActivity | null>(null);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    category: 'personal' as const,
    priority: 'medium' as const,
    frequency: 'daily' as const
  });

  const headerActions = (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Nova Atividade
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Atividade</DialogTitle>
          <DialogDescription>
            Configure uma nova atividade para sua rotina
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={newActivity.title}
              onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Exercício matinal"
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={newActivity.description}
              onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a atividade..."
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startTime">Início *</Label>
              <Input
                id="startTime"
                type="time"
                value={newActivity.startTime}
                onChange={(e) => setNewActivity(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endTime">Fim *</Label>
              <Input
                id="endTime"
                type="time"
                value={newActivity.endTime}
                onChange={(e) => setNewActivity(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={newActivity.category} onValueChange={(value: any) => setNewActivity(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={newActivity.priority} onValueChange={(value: any) => setNewActivity(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="frequency">Frequência</Label>
              <Select value={newActivity.frequency} onValueChange={(value: any) => setNewActivity(prev => ({ ...prev, frequency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(frequencyLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={handleAddActivity} className="w-full sm:w-auto">
            Adicionar Atividade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Carregar dados do localStorage
  useEffect(() => {
    const savedActivities = localStorage.getItem('user-routine-activities');
    if (savedActivities) {
      try {
        const parsed = JSON.parse(savedActivities);
        const loadedActivities = parsed.map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt)
        }));
        setActivities(loadedActivities);
      } catch (error) {
        console.error('Erro ao carregar atividades:', error);
      }
    }
  }, []);

  // Gerar insights quando atividades mudarem
  useEffect(() => {
    if (activities.length > 0) {
      const newInsights = generateInsights(activities);
      setInsights(newInsights);
    }
  }, [activities]);

  // Salvar atividades no localStorage
  const saveActivities = (newActivities: RoutineActivity[]) => {
    localStorage.setItem('user-routine-activities', JSON.stringify(newActivities));
    setActivities(newActivities);
  };

  const handleAddActivity = () => {
    if (!newActivity.title || !newActivity.startTime || !newActivity.endTime) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const activity: RoutineActivity = {
      id: Date.now().toString(),
      ...newActivity,
      createdAt: new Date()
    };

    const updated = [...activities, activity];
    saveActivities(updated);
    
    setNewActivity({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      category: 'personal',
      priority: 'medium',
      frequency: 'daily'
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Atividade adicionada!",
      description: "Nova atividade foi adicionada à sua rotina.",
    });
  };

  const handleDeleteActivity = (id: string) => {
    const updated = activities.filter(a => a.id !== id);
    saveActivities(updated);
    
    toast({
      title: "Atividade removida",
      description: "A atividade foi removida da sua rotina.",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      work: 'bg-blue-100 text-blue-800',
      health: 'bg-green-100 text-green-800',
      personal: 'bg-purple-100 text-purple-800',
      study: 'bg-orange-100 text-orange-800',
      leisure: 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getInsightColor = (type: string) => {
    const colors = {
      optimization: 'border-blue-200 bg-blue-50',
      health: 'border-green-200 bg-green-50',
      productivity: 'border-orange-200 bg-orange-50',
      balance: 'border-purple-200 bg-purple-50'
    };
    return colors[type as keyof typeof colors] || 'border-gray-200 bg-gray-50';
  };

  const sortedActivities = [...activities].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <PageLayout
      title="Minha Rotina"
      description="Gerencie suas atividades diárias e receba insights personalizados"
      showBackButton={true}
      headerActions={headerActions}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lista de Atividades */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Cronograma Diário ({activities.length} atividades)
              </CardTitle>
              <CardDescription>
                Suas atividades organizadas por horário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma atividade configurada</p>
                    <p className="text-sm">Clique em "Nova Atividade" para começar</p>
                  </div>
                ) : (
                  sortedActivities.map((activity) => (
                    <div key={activity.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {activity.startTime} - {activity.endTime}
                          </div>
                          <Badge className={getCategoryColor(activity.category)}>
                            {categoryLabels[activity.category]}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(activity.priority)}>
                            {priorityLabels[activity.priority]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {frequencyLabels[activity.frequency]}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteActivity(activity.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{activity.title}</h3>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights e Recomendações */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Insights IA ({insights.length})
              </CardTitle>
              <CardDescription>
                Recomendações baseadas em sua rotina
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Adicione atividades para receber insights personalizados</p>
                  </div>
                ) : (
                  insights.map((insight) => (
                    <div key={insight.id} className={`border rounded-lg p-4 space-y-2 ${getInsightColor(insight.type)}`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-gray-600 capitalize">{insight.impact}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{insight.description}</p>
                      <p className="text-xs font-medium text-gray-800">{insight.suggestion}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Resumo da Rotina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Atividades de Trabalho:</span>
                  <span className="font-medium">{activities.filter(a => a.category === 'work').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Atividades de Saúde:</span>
                  <span className="font-medium">{activities.filter(a => a.category === 'health').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Atividades de Lazer:</span>
                  <span className="font-medium">{activities.filter(a => a.category === 'leisure').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Alta Prioridade:</span>
                  <span className="font-medium">{activities.filter(a => a.priority === 'high').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
