
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { 
  Brain, 
  Heart, 
  Target, 
  MessageSquare, 
  TrendingUp, 
  Sparkles,
  Eye,
  Zap,
  Star,
  Award
} from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

// Dados demo impressionantes
const demoEmotionalData = [
  { name: 'Seg', level: 78, emotion: 'Confiante' },
  { name: 'Ter', level: 85, emotion: 'Focado' },
  { name: 'Qua', level: 72, emotion: 'Determinado' },
  { name: 'Qui', level: 89, emotion: 'Otimista' },
  { name: 'Sex', level: 82, emotion: 'Criativo' },
  { name: 'Sáb', level: 76, emotion: 'Equilibrado' },
  { name: 'Dom', level: 88, emotion: 'Inspirado' }
];

const demoLifeAreasData = [
  { subject: 'Carreira', A: 85 },
  { subject: 'Relacionamentos', A: 78 },
  { subject: 'Saúde', A: 82 },
  { subject: 'Finanças', A: 75 },
  { subject: 'Crescimento', A: 90 },
  { subject: 'Propósito', A: 88 }
];

const demoInsights = [
  {
    title: "Perfil de Liderança Natural",
    description: "Análise detectou traços de liderança em 87% das suas interações, com foco em resultados e pessoas.",
    icon: Award,
    color: "bg-blue-50 text-blue-800 border-blue-200"
  },
  {
    title: "Inteligência Emocional Elevada",
    description: "Score de 8.5/10 em empatia e gestão emocional, indicando alta capacidade de relacionamento.",
    icon: Heart,
    color: "bg-green-50 text-green-800 border-green-200"
  },
  {
    title: "Pensamento Estratégico",
    description: "Padrão consistente de visão de longo prazo e planejamento em 92% das decisões analisadas.",
    icon: Brain,
    color: "bg-purple-50 text-purple-800 border-purple-200"
  },
  {
    title: "Comunicação Assertiva",
    description: "Excelente clareza e objetividade, com 89% de efetividade nas comunicações interpessoais.",
    icon: MessageSquare,
    color: "bg-orange-50 text-orange-800 border-orange-200"
  }
];

export function DemoDashboard() {
  const { completeOnboarding } = useOnboarding();

  const handleStartRealAnalysis = () => {
    completeOnboarding();
  };

  return (
    <div className="space-y-6">
      {/* Header Demo */}
      <div className="relative bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="absolute top-4 right-4">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            DEMO
          </Badge>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Seu Observatório da Consciência
            </h1>
            <p className="text-slate-600 text-lg mb-4">
              Veja como seria sua análise psicológica completa baseada em IA
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-green-100 text-green-800">✨ 250+ Conversas Analisadas</Badge>
              <Badge className="bg-blue-100 text-blue-800">🧠 15 Insights Descobertos</Badge>
              <Badge className="bg-purple-100 text-purple-800">📊 Perfil 94% Completo</Badge>
            </div>
          </div>
          
          <div className="text-center lg:text-right">
            <div className="text-4xl font-bold text-blue-600 mb-1">94%</div>
            <div className="text-sm text-slate-600">Precisão da Análise</div>
          </div>
        </div>
      </div>

      {/* Métricas Demo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Insights Gerados</p>
                <p className="text-3xl font-bold text-blue-800">15</p>
                <p className="text-xs text-blue-600 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +8 esta semana
                </p>
              </div>
              <Brain className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Score Emocional</p>
                <p className="text-3xl font-bold text-green-800">82%</p>
                <p className="text-xs text-green-600 mt-1">
                  <Star className="w-3 h-3 inline mr-1" />
                  Acima da média
                </p>
              </div>
              <Heart className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Conversas Analisadas</p>
                <p className="text-3xl font-bold text-purple-800">247</p>
                <p className="text-xs text-purple-600 mt-1">
                  <Zap className="w-3 h-3 inline mr-1" />
                  Base robusta
                </p>
              </div>
              <MessageSquare className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Áreas Mapeadas</p>
                <p className="text-3xl font-bold text-orange-800">6</p>
                <p className="text-xs text-orange-600 mt-1">
                  <Target className="w-3 h-3 inline mr-1" />
                  Perfil completo
                </p>
              </div>
              <Target className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Termômetro Emocional
            </CardTitle>
            <CardDescription>Evolução emocional dos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                level: { label: "Nível", color: "hsl(var(--chart-1))" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demoEmotionalData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="level" fill="var(--color-level)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Mapa das Áreas da Vida
            </CardTitle>
            <CardDescription>Análise completa do seu perfil psicológico</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                A: { label: "Score", color: "hsl(var(--chart-1))" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={demoLifeAreasData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="var(--color-A)"
                    fill="var(--color-A)"
                    fillOpacity={0.6}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-500" />
            Insights Descobertos pela IA
          </CardTitle>
          <CardDescription>Análises profundas sobre sua personalidade e comportamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoInsights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${insight.color}`}>
                <div className="flex items-start gap-3">
                  <insight.icon className="h-6 w-6 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{insight.title}</h4>
                    <p className="text-sm opacity-90">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-indigo-50 to-cyan-50 border-indigo-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-indigo-800">
            Pronto para Sua Análise Real?
          </CardTitle>
          <CardDescription className="text-lg text-indigo-600">
            Faça upload das suas conversas e descubra insights únicos sobre você
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-indigo-600">
              <span>✅ 100% Privado e Seguro</span>
              <span>✅ Análise em Tempo Real</span>
              <span>✅ Insights Personalizados</span>
            </div>
            
            <Button
              onClick={handleStartRealAnalysis}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white px-8 py-3 text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Começar Minha Análise Real
            </Button>
            
            <p className="text-xs text-gray-500">
              Seus dados são processados com segurança máxima e nunca compartilhados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
