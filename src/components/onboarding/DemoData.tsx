
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Heart, 
  TrendingUp, 
  Target, 
  Award,
  Sparkles,
  Users,
  Briefcase,
  Home,
  Activity
} from 'lucide-react';

// Demo data for metrics
export const demoMetrics = {
  totalInsights: 23,
  emotionalScore: 87,
  growthAreas: 5,
  weeklyProgress: 15
};

// Demo insights from assistants
export const demoInsights = [
  {
    id: 'demo-1',
    title: 'Alta Capacidade de Liderança Identificada',
    description: 'Suas conversas demonstram um padrão consistente de tomada de decisão assertiva e capacidade de influenciar positivamente outros.',
    assistant: 'Psicólogo Comportamental',
    priority: 'high',
    category: 'Liderança',
    icon: '👑',
    impact: 'alto'
  },
  {
    id: 'demo-2', 
    title: 'Inteligência Emocional Acima da Média',
    description: 'Você demonstra 87% de inteligência emocional, com particular força em empatia e autorregulação.',
    assistant: 'Especialista em IE',
    priority: 'medium',
    category: 'Emocional',
    icon: '🧠',
    impact: 'médio'
  },
  {
    id: 'demo-3',
    title: 'Padrão de Comunicação Assertiva',
    description: 'Suas mensagens mostram clareza objetiva e capacidade de expressar ideias complexas de forma simples.',
    assistant: 'Analista de Comunicação',
    priority: 'medium', 
    category: 'Comunicação',
    icon: '💬',
    impact: 'médio'
  }
];

// Demo life areas data
export const demoLifeAreas = [
  { name: 'Carreira', score: 85, color: '#3B82F6', icon: Briefcase },
  { name: 'Relacionamentos', score: 78, color: '#EF4444', icon: Heart },
  { name: 'Saúde', score: 92, color: '#10B981', icon: Activity },
  { name: 'Família', score: 88, color: '#8B5CF6', icon: Home },
  { name: 'Crescimento', score: 81, color: '#F59E0B', icon: TrendingUp },
  { name: 'Social', score: 75, color: '#06B6D4', icon: Users }
];

// Demo emotional data for chart
export const demoEmotionalData = [
  { day: 'Seg', energia: 85, humor: 78, foco: 82 },
  { day: 'Ter', energia: 78, humor: 85, foco: 88 },
  { day: 'Qua', energia: 92, humor: 82, foco: 85 },
  { day: 'Qui', energia: 88, humor: 90, foco: 87 },
  { day: 'Sex', energia: 85, humor: 88, foco: 90 },
  { day: 'Sab', energia: 95, humor: 92, foco: 78 },
  { day: 'Dom', energia: 82, humor: 85, foco: 80 }
];

// Demo recommendations
export const demoRecommendations = [
  {
    id: 'rec-1',
    title: 'Desenvolver Habilidades de Negociação',
    description: 'Baseado no seu perfil de liderança, recomendamos focar em técnicas avançadas de negociação.',
    priority: 'high',
    category: 'Desenvolvimento Profissional',
    estimatedImpact: '25% melhoria em resultados'
  },
  {
    id: 'rec-2',
    title: 'Implementar Técnicas de Mindfulness',
    description: 'Para potencializar sua já alta inteligência emocional, práticas de mindfulness podem ser muito benéficas.',
    priority: 'medium',
    category: 'Bem-estar',
    estimatedImpact: '15% redução no estresse'
  }
];

// Demo component for showcasing the dashboard with data
export function DemoDashboard() {
  return (
    <div className="space-y-6 p-6 bg-gray-50 rounded-lg" data-tour="demo-dashboard">
      {/* Demo Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="metrics">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total de Insights</p>
                <p className="text-2xl font-bold text-blue-800">{demoMetrics.totalInsights}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Score Emocional</p>
                <p className="text-2xl font-bold text-green-800">{demoMetrics.emotionalScore}%</p>
              </div>
              <Heart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Áreas Analisadas</p>
                <p className="text-2xl font-bold text-purple-800">{demoMetrics.growthAreas}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Progresso Semanal</p>
                <p className="text-2xl font-bold text-orange-800">+{demoMetrics.weeklyProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Insights */}
      <Card data-tour="insights">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Últimos Insights dos Assistentes
          </CardTitle>
          <CardDescription>Descobertas recentes sobre seu perfil pessoal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {demoInsights.map((insight) => (
            <div key={insight.id} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{insight.icon}</span>
                  <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                </div>
                <Badge className={insight.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                  {insight.priority === 'high' ? 'Alto Impacto' : 'Médio Impacto'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {insight.assistant}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {insight.category}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Demo Life Areas */}
      <Card data-tour="areas">
        <CardHeader>
          <CardTitle>Mapa das Áreas da Vida</CardTitle>
          <CardDescription>Seu desempenho em diferentes aspectos da vida</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {demoLifeAreas.map((area) => (
              <div key={area.name} className="text-center p-4 bg-gray-50 rounded-lg">
                <area.icon className="h-8 w-8 mx-auto mb-2" style={{ color: area.color }} />
                <h4 className="font-medium text-sm text-gray-700 mb-2">{area.name}</h4>
                <div className="text-2xl font-bold mb-1" style={{ color: area.color }}>
                  {area.score}%
                </div>
                <Progress value={area.score} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo CTA */}
      <div className="text-center p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white" data-tour="ai-analysis">
        <h3 className="text-2xl font-bold mb-4">Pronto para seus insights reais?</h3>
        <p className="mb-6 text-blue-100">
          Esta é apenas uma prévia. Faça upload das suas conversas para descobrir insights únicos sobre você!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Análise 100% Privada e Segura
          </Badge>
          <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
            <Award className="w-4 h-4 mr-2" />
            Resultados em 2 minutos
          </Badge>
        </div>
      </div>
    </div>
  );
}
