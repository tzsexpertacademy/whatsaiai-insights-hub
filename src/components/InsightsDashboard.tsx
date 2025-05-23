
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Heart, User, FileText, Timer, BarChart3, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const emotionalData = [
  { name: 'Seg', level: 75, emotion: 'Confiante' },
  { name: 'Ter', level: 62, emotion: 'Reflexivo' },
  { name: 'Qua', level: 48, emotion: 'Ansioso' },
  { name: 'Qui', level: 70, emotion: 'Motivado' },
  { name: 'Sex', level: 85, emotion: 'Entusiasmado' },
  { name: 'Sáb', level: 78, emotion: 'Tranquilo' },
  { name: 'Dom', level: 65, emotion: 'Contemplativo' },
];

const lifeAreasData = [
  { subject: 'Profissional', A: 80, fullMark: 100 },
  { subject: 'Financeiro', A: 65, fullMark: 100 },
  { subject: 'Relacionamentos', A: 70, fullMark: 100 },
  { subject: 'Saúde Física', A: 55, fullMark: 100 },
  { subject: 'Saúde Mental', A: 75, fullMark: 100 },
  { subject: 'Espiritualidade', A: 60, fullMark: 100 },
  { subject: 'Crescimento Pessoal', A: 85, fullMark: 100 },
];

const psychProfileData = [
  { name: 'Extroversão', value: 65 },
  { name: 'Abertura', value: 85 },
  { name: 'Neuroticismo', value: 45 },
  { name: 'Amabilidade', value: 70 },
  { name: 'Conscienciosidade', value: 75 },
];

const skillsData = [
  {
    title: "Comunicação",
    value: "82%",
    trend: "+6%",
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Inteligência Emocional",
    value: "75%",
    trend: "+12%",
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  {
    title: "Capacidade Analítica",
    value: "88%",
    trend: "+4%",
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  }
];

const insights = [
  "Aumento na reflexão sobre propósito nas últimas 2 semanas",
  "Padrão de procrastinação detectado na área financeira",
  "Maior ansiedade em conversas sobre relacionamentos recentemente",
  "Queda na atenção à saúde física nos últimos 30 dias"
];

export function InsightsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Observatório da Consciência</h1>
        <p className="text-slate-600">Um espelho da sua mente, comportamentos e evolução pessoal</p>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Perfil Psicológico</p>
                <p className="text-3xl font-bold">ENFP</p>
                <p className="text-blue-100 text-sm flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  Evolução positiva
                </p>
              </div>
              <Brain className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Estado Emocional</p>
                <p className="text-3xl font-bold">Confiante</p>
                <p className="text-green-100 text-sm flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  Mais estável que ontem
                </p>
              </div>
              <Heart className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Foco Principal</p>
                <p className="text-3xl font-bold">Crescimento</p>
                <p className="text-purple-100 text-sm flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +18% este mês
                </p>
              </div>
              <Timer className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Consciência Relacional</p>
                <p className="text-3xl font-bold">72%</p>
                <p className="text-orange-100 text-sm flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +8% este mês
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa de Áreas da Vida */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Mapa das Áreas da Vida</CardTitle>
            <CardDescription>Distribuição de atenção aos aspectos fundamentais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={lifeAreasData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Você" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Termômetro Emocional</CardTitle>
            <CardDescription>Evolução do seu estado emocional na semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={emotionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip labelFormatter={(value) => `${value}: ${emotionalData.find(item => item.name === value)?.emotion}`} />
                <Line type="monotone" dataKey="level" stroke="#8884d8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Perfil Psicológico */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Perfil Psicológico (Big Five)</CardTitle>
          <CardDescription>Análise de traços de personalidade predominantes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={psychProfileData}
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Habilidades e Desenvolvimento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {skillsData.map((skill, index) => (
          <Card key={index} className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${skill.bgColor}`}>
                  <skill.icon className={`h-5 w-5 ${skill.color}`} />
                </div>
                {skill.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-slate-800">{skill.value}</p>
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  {skill.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights e alertas */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Alertas e Insights</CardTitle>
          <CardDescription>Padrões e tendências detectados nas suas interações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-slate-50">
                <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
                <p>{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Recomendações Personalizadas</CardTitle>
          <CardDescription>Sugestões baseadas na análise dos assistentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <Brain className="h-4 w-4 mr-2" />
              Desenvolver Autocompaixão
            </Button>
            <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
              <FileText className="h-4 w-4 mr-2" />
              Praticar Journaling Diário
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
              <Heart className="h-4 w-4 mr-2" />
              Revisitar Metas Financeiras
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
