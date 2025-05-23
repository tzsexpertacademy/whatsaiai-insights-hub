
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const sentimentData = [
  { name: 'Positivo', value: 65, color: '#10b981' },
  { name: 'Neutro', value: 25, color: '#6b7280' },
  { name: 'Negativo', value: 10, color: '#ef4444' },
];

const topicsData = [
  { topic: 'Suporte Técnico', count: 45, percentage: 35 },
  { topic: 'Vendas', count: 38, percentage: 30 },
  { topic: 'Dúvidas Gerais', count: 25, percentage: 20 },
  { topic: 'Reclamações', count: 12, percentage: 10 },
  { topic: 'Elogios', count: 6, percentage: 5 },
];

const weeklyData = [
  { day: 'Seg', interactions: 45, avgResponse: 2.3 },
  { day: 'Ter', interactions: 52, avgResponse: 1.8 },
  { day: 'Qua', interactions: 38, avgResponse: 2.1 },
  { day: 'Qui', interactions: 61, avgResponse: 1.5 },
  { day: 'Sex', interactions: 55, avgResponse: 1.9 },
  { day: 'Sáb', interactions: 42, avgResponse: 2.8 },
  { day: 'Dom', interactions: 33, avgResponse: 3.2 },
];

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Analytics Avançado</h1>
        <p className="text-slate-600">Análise detalhada das conversas e insights de IA</p>
      </div>

      <Tabs defaultValue="sentiment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-sm">
          <TabsTrigger value="sentiment">Sentimentos</TabsTrigger>
          <TabsTrigger value="topics">Tópicos</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle>Distribuição de Sentimentos</CardTitle>
                <CardDescription>Análise emocional das conversas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle>Detalhes por Sentimento</CardTitle>
                <CardDescription>Breakdown detalhado das análises</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sentimentData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="secondary">{item.value}%</Badge>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Tópicos Mais Discutidos</CardTitle>
              <CardDescription>Assuntos identificados pela IA nas conversas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topicsData.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-800">{topic.topic}</h3>
                      <p className="text-sm text-slate-600">{topic.count} mensagens</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{topic.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Performance Semanal</CardTitle>
              <CardDescription>Interações e tempo de resposta</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="interactions" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardHeader>
                <CardTitle>Insight Principal</CardTitle>
                <CardDescription className="text-purple-100">
                  Descoberta mais relevante da semana
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">
                  "Clientes que mencionam 'urgente' têm 73% mais chance de conversão quando respondidos em menos de 1 minuto."
                </p>
                <Badge className="bg-white text-purple-600">Confiança: 94%</Badge>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardHeader>
                <CardTitle>Recomendação IA</CardTitle>
                <CardDescription className="text-green-100">
                  Ação sugerida para melhorar resultados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">
                  "Implementar respostas automáticas para as 5 perguntas mais frequentes pode reduzir tempo de resposta em 45%."
                </p>
                <Badge className="bg-white text-green-600">Impacto: Alto</Badge>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Padrões Identificados</CardTitle>
              <CardDescription>Comportamentos detectados pela análise de IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Pico de Atividade</h3>
                  <p className="text-sm text-blue-700">Quintas-feiras entre 14h-16h apresentam 40% mais mensagens</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-900 mb-2">Palavras-chave</h3>
                  <p className="text-sm text-yellow-700">'Problema', 'Ajuda', 'Erro' indicam necessidade de suporte técnico</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">Satisfação</h3>
                  <p className="text-sm text-green-700">87% das conversas terminam com sentimento positivo</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">Conversão</h3>
                  <p className="text-sm text-purple-700">Respostas em até 2 min aumentam conversão em 65%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
