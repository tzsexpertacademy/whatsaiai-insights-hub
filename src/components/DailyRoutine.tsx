
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, Calendar, Clock, Target, CheckCircle, AlertCircle, Coffee, Book, Dumbbell, Heart } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';

export function DailyRoutine() {
  const { data, isLoading } = useAnalysisData();

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Badge className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
        📅 Minha Rotina
      </Badge>
      <AIAnalysisButton />
    </div>
  );

  if (isLoading) {
    return (
      <PageLayout
        title="Minha Rotina"
        description="Organize e acompanhe suas atividades diárias"
        showBackButton={true}
        headerActions={headerActions}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </PageLayout>
    );
  }

  if (!data.hasRealData) {
    return (
      <PageLayout
        title="Minha Rotina"
        description="Organize e acompanhe suas atividades diárias"
        showBackButton={true}
        headerActions={headerActions}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Rotina ainda não configurada
            </CardTitle>
            <CardDescription>
              Configure sua rotina diária para acompanhar melhor seu progresso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">• Execute a análise por IA no dashboard</p>
                <p className="text-sm text-gray-600">• Os assistentes irão sugerir uma rotina personalizada</p>
                <p className="text-sm text-gray-600">• Dados serão atualizados automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // Dados simulados da rotina baseados nos insights
  const routineData = {
    morningActivities: [
      { id: 1, title: 'Meditação', time: '07:00', duration: '15 min', icon: Heart, completed: true },
      { id: 2, title: 'Exercício', time: '07:30', duration: '30 min', icon: Dumbbell, completed: false },
      { id: 3, title: 'Café da manhã', time: '08:00', duration: '20 min', icon: Coffee, completed: true }
    ],
    afternoonActivities: [
      { id: 4, title: 'Trabalho focado', time: '14:00', duration: '2h', icon: Target, completed: true },
      { id: 5, title: 'Leitura', time: '16:30', duration: '30 min', icon: Book, completed: false }
    ],
    eveningActivities: [
      { id: 6, title: 'Revisão do dia', time: '20:00', duration: '15 min', icon: CheckCircle, completed: false },
      { id: 7, title: 'Relaxamento', time: '21:00', duration: '30 min', icon: Heart, completed: false }
    ]
  };

  const totalActivities = [...routineData.morningActivities, ...routineData.afternoonActivities, ...routineData.eveningActivities];
  const completedActivities = totalActivities.filter(activity => activity.completed);
  const completionRate = (completedActivities.length / totalActivities.length) * 100;

  return (
    <PageLayout
      title="Minha Rotina"
      description="Organize e acompanhe suas atividades diárias"
      showBackButton={true}
      headerActions={headerActions}
    >
      {/* Métricas do dia */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progresso Hoje</p>
                <p className="text-2xl font-bold text-blue-600">{completionRate.toFixed(0)}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{completedActivities.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">{totalActivities.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Próxima</p>
                <p className="text-lg font-bold text-orange-600">16:30</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rotina do dia */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manhã */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-orange-500" />
              Manhã
            </CardTitle>
            <CardDescription>Comece o dia com energia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {routineData.morningActivities.map(activity => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50">
                    <div className={`p-2 rounded-full ${activity.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <IconComponent className={`h-4 w-4 ${activity.completed ? 'text-green-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${activity.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {activity.title}
                        </span>
                        {activity.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                      <p className="text-sm text-gray-600">{activity.time} • {activity.duration}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tarde */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Tarde
            </CardTitle>
            <CardDescription>Foco e produtividade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {routineData.afternoonActivities.map(activity => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className={`p-2 rounded-full ${activity.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <IconComponent className={`h-4 w-4 ${activity.completed ? 'text-green-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${activity.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {activity.title}
                        </span>
                        {activity.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                      <p className="text-sm text-gray-600">{activity.time} • {activity.duration}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Noite */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-500" />
              Noite
            </CardTitle>
            <CardDescription>Relaxamento e reflexão</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {routineData.eveningActivities.map(activity => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className={`p-2 rounded-full ${activity.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <IconComponent className={`h-4 w-4 ${activity.completed ? 'text-green-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${activity.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {activity.title}
                        </span>
                        {activity.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                      <p className="text-sm text-gray-600">{activity.time} • {activity.duration}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights da rotina */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Insights da Rotina</CardTitle>
          <CardDescription>Sugestões baseadas na análise dos assistentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">💡 Sugestão do Assistente</h4>
              <p className="text-sm text-blue-700">
                Baseado nos seus padrões, considere adicionar 10 minutos de journaling após a meditação matinal.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">📊 Análise de Performance</h4>
              <p className="text-sm text-green-700">
                Você tem mantido 85% de consistência nas atividades matinais. Excelente progresso!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
