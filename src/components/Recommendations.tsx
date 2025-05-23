
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Heart, FileText, User, Timer } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const assistantRecommendations = [
  {
    from: "Oráculo das Sombras",
    title: "Prática de Mindfulness",
    description: "Dedique 10 minutos diários ao mindfulness para reduzir ansiedade identificada em conversas sobre prazos.",
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    priority: "Alta",
    impact: "Redução de Estresse"
  },
  {
    from: "Guardião dos Recursos",
    title: "Revisão de Investimentos",
    description: "É hora de reavaliar sua estratégia financeira. Sua atenção recente demonstra preocupação com estabilidade a longo prazo.",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    priority: "Média",
    impact: "Segurança Financeira"
  },
  {
    from: "Engenheiro do Corpo",
    title: "Melhorar Qualidade do Sono",
    description: "Seus padrões de comunicação sugerem fadiga. Implemente uma rotina de sono mais consistente para melhorar energia.",
    icon: Timer,
    color: "text-green-600",
    bgColor: "bg-green-50",
    priority: "Alta",
    impact: "Energia e Clareza Mental"
  },
  {
    from: "Espelho Social",
    title: "Fortalecer Conexões",
    description: "Padrões de linguagem mostram isolamento crescente. Programe encontros significativos com pessoas próximas.",
    icon: User,
    color: "text-red-600",
    bgColor: "bg-red-50",
    priority: "Média",
    impact: "Bem-estar Emocional"
  },
  {
    from: "Tecelão da Alma",
    title: "Reexaminar Propósito",
    description: "Há indicações de questões profundas sobre direção na vida. Dedique tempo para reflexão sobre valores fundamentais.",
    icon: Heart,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    priority: "Média",
    impact: "Alinhamento Interno"
  }
];

const practicalExercises = [
  {
    title: "Journaling Diário",
    description: "Escreva por 15 minutos todas as manhãs sobre pensamentos e emoções sem filtro ou julgamento.",
    category: "Autoconsciência",
    duration: "15 min/dia"
  },
  {
    title: "Meditação Guiada",
    description: "Prática de meditação focada na respiração para reduzir ansiedade identificada nas análises.",
    category: "Bem-estar Mental",
    duration: "10 min/dia"
  },
  {
    title: "Review Financeiro Semanal",
    description: "Análise estruturada de gastos, economias e investimentos alinhados com metas definidas.",
    category: "Finanças",
    duration: "30 min/semana"
  },
  {
    title: "Caminhada Contemplativa",
    description: "Exercício físico leve combinado com reflexão e presença no momento.",
    category: "Saúde Física/Mental",
    duration: "30 min/dia"
  }
];

export function Recommendations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Conselhos e Recomendações</h1>
        <p className="text-slate-600">Sugestões personalizadas baseadas na análise dos assistentes</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {assistantRecommendations.map((rec, index) => (
          <Card key={index} className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${rec.bgColor}`}>
                    <rec.icon className={`h-5 w-5 ${rec.color}`} />
                  </div>
                  <div>
                    <CardTitle>{rec.title}</CardTitle>
                    <CardDescription>Recomendação do {rec.from}</CardDescription>
                  </div>
                </div>
                <Badge variant={rec.priority === "Alta" ? "destructive" : "outline"}>
                  Prioridade {rec.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">{rec.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Impacto esperado: {rec.impact}</span>
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  Implementar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Exercícios Práticos Recomendados</CardTitle>
          <CardDescription>Atividades para implementação imediata</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {practicalExercises.map((exercise, index) => (
              <div key={index} className="border rounded-lg p-4 bg-slate-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{exercise.title}</h3>
                  <Badge variant="outline">{exercise.category}</Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{exercise.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">{exercise.duration}</span>
                  <Button variant="outline" size="sm">Iniciar</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-500 text-white border-0">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">Próximo Passo Recomendado</h3>
          <p className="mb-6">
            Baseado em todas as análises, seu foco imediato mais benéfico seria:
          </p>
          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-lg">
            <h4 className="text-lg font-semibold mb-2">Estabelecer Prática Diária de Mindfulness</h4>
            <p className="mb-4">
              Esta prática criará fundações para redução de ansiedade, clareza mental 
              e melhor tomada de decisões em todas as áreas de vida.
            </p>
            <Button size="lg" className="w-full bg-white text-blue-700 hover:bg-slate-100">
              <Brain className="mr-2 h-5 w-5" />
              Começar Agora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
