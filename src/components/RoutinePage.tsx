import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

export function RoutinePage() {
  const [showForm, setShowForm] = useState(false);
  const [activities, setActivities] = useState([
    { id: 1, name: 'Reunião Diária', time: '09:00', category: 'Trabalho', completed: true },
    { id: 2, name: 'Exercício Matinal', time: '07:00', category: 'Saúde', completed: false },
  ]);
  const [newActivity, setNewActivity] = useState({
    name: '',
    time: '',
    category: 'Trabalho',
    completed: false,
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [energyLevel, setEnergyLevel] = useState(50);
  const [toast] = useToast();

  useEffect(() => {
    // Simulação de carregamento de atividades do backend
    // Aqui você faria uma chamada à API para buscar as atividades do usuário
    // e atualizaria o estado 'activities' com os dados recebidos.
    // Exemplo:
    // fetch('/api/activities')
    //   .then(response => response.json())
    //   .then(data => setActivities(data));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewActivity(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewActivity(prev => ({ ...prev, completed: e.target.checked }));
  };

  const addActivity = () => {
    const newId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1;
    setActivities([...activities, { id: newId, ...newActivity }]);
    setNewActivity({ name: '', time: '', category: 'Trabalho', completed: false });
    setShowForm(false);

    toast({
      title: "Atividade Adicionada!",
      description: "Sua nova atividade foi adicionada à rotina.",
    })
  };

  const toggleComplete = (id: number) => {
    setActivities(activities.map(activity =>
      activity.id === id ? { ...activity, completed: !activity.completed } : activity
    ));
  };

  const totalActivities = activities.length;
  const completedActivities = activities.filter(activity => activity.completed).length;
  const completionRate = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Minha Rotina"
        subtitle="Gerencie suas atividades diárias e receba insights para otimizar sua rotina"
      >
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Atividade
        </Button>
      </PageHeader>

      <div className="p-4 md:p-6 space-y-6">
        {/* Resumo Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActivities}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividades Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedActivities}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Taxa de Conclusão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate.toFixed(0)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Insights IA */}
        <Card>
          <CardHeader>
            <CardTitle>Insights da IA</CardTitle>
            <CardDescription>Recomendações personalizadas para otimizar sua rotina.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Com base em suas atividades, a IA sugere que você reserve um tempo para atividades de relaxamento no meio do dia para aumentar sua produtividade.</p>
            <Badge variant="secondary">Mindfulness</Badge>
            <Badge variant="secondary">Descanso Ativo</Badge>
          </CardContent>
        </Card>

        {/* Lista de Atividades */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-none p-0">
              {activities.map(activity => (
                <li key={activity.id} className="py-2 border-b border-gray-200 last:border-none flex items-center justify-between">
                  <div>
                    <span className="font-semibold">{activity.name}</span> - <span className="text-gray-500">{activity.time}</span>
                    <Badge className="ml-2">{activity.category}</Badge>
                  </div>
                  <Checkbox
                    id={`activity-${activity.id}`}
                    checked={activity.completed}
                    onCheckedChange={() => toggleComplete(activity.id)}
                  />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Modal de Formulário */}
        {showForm && (
          <Drawer open={showForm} onOpenChange={setShowForm}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Adicionar Nova Atividade</DrawerTitle>
                <DrawerDescription>
                  Adicione uma nova atividade à sua rotina diária.
                </DrawerDescription>
              </DrawerHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input id="name" name="name" value={newActivity.name} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Horário
                  </Label>
                  <Input id="time" name="time" type="time" value={newActivity.time} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Categoria
                  </Label>
                  <Select onValueChange={(value) => setNewActivity(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione uma categoria" defaultValue={newActivity.category} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Trabalho">Trabalho</SelectItem>
                      <SelectItem value="Saúde">Saúde</SelectItem>
                      <SelectItem value="Lazer">Lazer</SelectItem>
                      <SelectItem value="Estudo">Estudo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="completed" className="text-right">
                    Concluída
                  </Label>
                  <Checkbox id="completed" name="completed" checked={newActivity.completed} onCheckedChange={handleCheckboxChange} className="col-span-3" />
                </div>
              </div>
              <DrawerFooter>
                <Button onClick={addActivity}>Adicionar Atividade</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </div>
  );
}
