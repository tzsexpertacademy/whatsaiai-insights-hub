
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, MessageCircle, Brain, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const messageData = [
  { name: 'Seg', messages: 45, sentiment: 85 },
  { name: 'Ter', messages: 52, sentiment: 78 },
  { name: 'Qua', messages: 38, sentiment: 92 },
  { name: 'Qui', messages: 61, sentiment: 73 },
  { name: 'Sex', messages: 55, sentiment: 88 },
  { name: 'Sáb', messages: 42, sentiment: 95 },
  { name: 'Dom', messages: 33, sentiment: 91 },
];

const insights = [
  {
    title: "Sentimento Predominante",
    description: "Análise das emoções nas conversas",
    value: "Positivo (87%)",
    trend: "+5%",
    icon: Brain,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    title: "Tópicos Frequentes",
    description: "Assuntos mais discutidos",
    value: "Suporte, Vendas",
    trend: "Top 2",
    icon: MessageCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Tempo de Resposta",
    description: "Média de resposta",
    value: "2.5 min",
    trend: "-30s",
    icon: Zap,
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  }
];

export function InsightsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard de Insights</h1>
        <p className="text-slate-600">Análise inteligente das suas conversas WhatsApp</p>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total de Mensagens</p>
                <p className="text-3xl font-bold">1,247</p>
                <p className="text-blue-100 text-sm flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% esta semana
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Contatos Ativos</p>
                <p className="text-3xl font-bold">89</p>
                <p className="text-green-100 text-sm flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +8% esta semana
                </p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Score IA</p>
                <p className="text-3xl font-bold">94%</p>
                <p className="text-purple-100 text-sm flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +3% esta semana
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Taxa de Conversão</p>
                <p className="text-3xl font-bold">23%</p>
                <p className="text-orange-100 text-sm flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +5% esta semana
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Volume de Mensagens</CardTitle>
            <CardDescription>Mensagens enviadas e recebidas esta semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={messageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="messages" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Análise de Sentimento</CardTitle>
            <CardDescription>Score de sentimento das conversas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={messageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sentiment" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights da IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <Card key={index} className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${insight.bgColor}`}>
                  <insight.icon className={`h-5 w-5 ${insight.color}`} />
                </div>
                {insight.title}
              </CardTitle>
              <CardDescription>{insight.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-slate-800">{insight.value}</p>
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  {insight.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ações rápidas */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Execute análises e ações baseadas em IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <Brain className="h-4 w-4 mr-2" />
              Analisar Sentimentos
            </Button>
            <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              Gerar Resumo
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Relatório Completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
