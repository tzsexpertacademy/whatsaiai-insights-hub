
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingDown,
  AlertTriangle,
  Users,
  Calendar,
  Target,
  Brain,
  MessageSquare,
  Clock,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";

export function ChurnAnalysis() {
  const [timeRange, setTimeRange] = useState('3m');

  // Dados históricos de churn
  const churnHistory = [
    { month: 'Jan', churn: 2.1, voluntary: 1.3, involuntary: 0.8, cohort: 'Jan-2024' },
    { month: 'Fev', churn: 1.8, voluntary: 1.1, involuntary: 0.7, cohort: 'Fev-2024' },
    { month: 'Mar', churn: 2.4, voluntary: 1.6, involuntary: 0.8, cohort: 'Mar-2024' },
    { month: 'Abr', churn: 3.1, voluntary: 2.0, involuntary: 1.1, cohort: 'Abr-2024' },
    { month: 'Mai', churn: 2.9, voluntary: 1.9, involuntary: 1.0, cohort: 'Mai-2024' },
    { month: 'Jun', churn: 3.2, voluntary: 2.1, involuntary: 1.1, cohort: 'Jun-2024' }
  ];

  // Análise por segmento
  const churnBySegment = [
    { segment: 'Básico', rate: 4.2, clients: 89, lost: 4, reason: 'Preço/Funcionalidades', action: 'Melhorar valor percebido' },
    { segment: 'Premium', rate: 2.8, clients: 67, lost: 2, reason: 'Migração concorrente', action: 'Programa de retenção' },
    { segment: 'Enterprise', rate: 1.5, clients: 31, lost: 1, reason: 'Mudança estratégica', action: 'Account management' }
  ];

  // Motivos de cancelamento
  const churnReasons = [
    { reason: 'Preço muito alto', percentage: 28, trend: 'up', count: 12 },
    { reason: 'Falta de funcionalidades', percentage: 22, trend: 'down', count: 9 },
    { reason: 'Concorrente melhor', percentage: 18, trend: 'up', count: 8 },
    { reason: 'Dificuldade de uso', percentage: 15, trend: 'stable', count: 6 },
    { reason: 'Mudança de empresa', percentage: 10, trend: 'stable', count: 4 },
    { reason: 'Outros', percentage: 7, trend: 'down', count: 3 }
  ];

  // Análise de coorte
  const cohortData = [
    { cohort: 'Jan-2024', month0: 100, month1: 95, month2: 92, month3: 89, month4: 87, month5: 85 },
    { cohort: 'Fev-2024', month0: 100, month1: 96, month2: 93, month3: 91, month4: 89, month5: null },
    { cohort: 'Mar-2024', month0: 100, month1: 94, month2: 91, month3: 88, month4: null, month5: null },
    { cohort: 'Abr-2024', month0: 100, month1: 93, month2: 89, month3: null, month4: null, month5: null },
    { cohort: 'Mai-2024', month0: 100, month1: 95, month2: null, month3: null, month4: null, month5: null },
    { cohort: 'Jun-2024', month0: 100, month1: null, month2: null, month3: null, month4: null, month5: null }
  ];

  // Riscos de churn atuais
  const riskSegments = [
    { segment: 'Alto Risco', count: 12, indicators: ['Baixo engagement', 'Suporte frequente', 'Downgrades'], color: 'red' },
    { segment: 'Médio Risco', count: 23, indicators: ['Uso irregular', 'Atraso pagamento'], color: 'yellow' },
    { segment: 'Baixo Risco', count: 152, indicators: ['Uso regular', 'Feedback positivo'], color: 'green' }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-green-500" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const currentChurn = 3.2;
  const targetChurn = 2.5;
  const totalLost = churnBySegment.reduce((sum, seg) => sum + seg.lost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Análise de Churn</h2>
          <p className="text-slate-600">Monitoramento e prevenção de cancelamentos</p>
        </div>
        <div className="flex gap-2">
          {['1m', '3m', '6m', '1a'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* KPIs de Churn */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Taxa de Churn</p>
                <p className="text-2xl font-bold">{currentChurn}%</p>
                <p className="text-red-200 text-xs">Meta: {targetChurn}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Clientes Perdidos</p>
                <p className="text-2xl font-bold">{totalLost}</p>
                <p className="text-orange-200 text-xs">Este mês</p>
              </div>
              <Users className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Receita Perdida</p>
                <p className="text-2xl font-bold">R$ 1.820</p>
                <p className="text-yellow-200 text-xs">MRR perdido</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Em Risco</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-blue-200 text-xs">Alto risco</p>
              </div>
              <Target className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="reasons">Motivos</TabsTrigger>
          <TabsTrigger value="cohort">Análise de Coorte</TabsTrigger>
          <TabsTrigger value="prevention">Prevenção</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evolução do Churn */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle>Evolução do Churn</CardTitle>
                <CardDescription>Taxa de churn mensal - voluntário vs involuntário</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  voluntary: { label: "Voluntário", color: "#EF4444" },
                  involuntary: { label: "Involuntário", color: "#F59E0B" },
                  churn: { label: "Total", color: "#DC2626" }
                }} className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={churnHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="voluntary" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="involuntary" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                      <Line type="monotone" dataKey="churn" stroke="#DC2626" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Churn por Segmento */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle>Churn por Plano</CardTitle>
                <CardDescription>Comparativo de cancelamentos por segmento</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  rate: { label: "Taxa (%)", color: "#EF4444" }
                }} className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={churnBySegment}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="segment" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="rate" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Análise Detalhada por Segmento */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Análise Detalhada por Segmento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {churnBySegment.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant={segment.rate > 3 ? "destructive" : segment.rate > 2 ? "secondary" : "outline"}>
                        {segment.segment}
                      </Badge>
                      <div>
                        <p className="font-medium">{segment.rate}% de churn</p>
                        <p className="text-sm text-gray-600">{segment.lost} de {segment.clients} clientes perdidos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">{segment.reason}</p>
                      <p className="text-xs text-gray-500">{segment.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reasons" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Motivos de Cancelamento</CardTitle>
              <CardDescription>Principais razões reportadas pelos clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {churnReasons.map((reason, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(reason.trend)}
                        <span className="font-medium">{reason.reason}</span>
                      </div>
                      <Badge variant="outline">{reason.count} casos</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${reason.percentage}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-red-600">{reason.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle>Ações Corretivas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800">Preço Alto (28%)</h4>
                    <p className="text-sm text-red-600">Criar planos intermediários ou descontos</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800">Falta Funcionalidades (22%)</h4>
                    <p className="text-sm text-blue-600">Priorizar desenvolvimento baseado em feedback</p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-medium text-orange-800">Concorrência (18%)</h4>
                    <p className="text-sm text-orange-600">Análise competitiva e diferenciação</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle>Impacto Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">MRR perdido este mês</span>
                    <span className="font-bold text-red-600">R$ 1.820</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">ARR potencial perdido</span>
                    <span className="font-bold text-red-600">R$ 21.840</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">LTV perdido total</span>
                    <span className="font-bold text-red-600">R$ 58.500</span>
                  </div>
                  <div className="border-t pt-2 mt-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Impacto total</span>
                      <span className="font-bold text-red-600">R$ 82.160</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohort" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Análise de Coorte</CardTitle>
              <CardDescription>Retenção de clientes por mês de aquisição</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Coorte</th>
                      <th className="text-center py-2">Mês 0</th>
                      <th className="text-center py-2">Mês 1</th>
                      <th className="text-center py-2">Mês 2</th>
                      <th className="text-center py-2">Mês 3</th>
                      <th className="text-center py-2">Mês 4</th>
                      <th className="text-center py-2">Mês 5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((cohort, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 font-medium">{cohort.cohort}</td>
                        <td className="text-center py-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {cohort.month0}%
                          </span>
                        </td>
                        <td className="text-center py-2">
                          {cohort.month1 && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              cohort.month1 >= 95 ? 'bg-green-100 text-green-800' :
                              cohort.month1 >= 90 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {cohort.month1}%
                            </span>
                          )}
                        </td>
                        <td className="text-center py-2">
                          {cohort.month2 && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              cohort.month2 >= 90 ? 'bg-green-100 text-green-800' :
                              cohort.month2 >= 85 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {cohort.month2}%
                            </span>
                          )}
                        </td>
                        <td className="text-center py-2">
                          {cohort.month3 && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              cohort.month3 >= 85 ? 'bg-green-100 text-green-800' :
                              cohort.month3 >= 80 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {cohort.month3}%
                            </span>
                          )}
                        </td>
                        <td className="text-center py-2">
                          {cohort.month4 && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              cohort.month4 >= 85 ? 'bg-green-100 text-green-800' :
                              cohort.month4 >= 80 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {cohort.month4}%
                            </span>
                          )}
                        </td>
                        <td className="text-center py-2">
                          {cohort.month5 && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              cohort.month5 >= 85 ? 'bg-green-100 text-green-800' :
                              cohort.month5 >= 80 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {cohort.month5}%
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle className="text-sm">Retenção Mês 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">94.5%</p>
                <p className="text-xs text-gray-500">Média dos últimos 6 meses</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle className="text-sm">Retenção Mês 3</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">89.2%</p>
                <p className="text-xs text-gray-500">Estabilização do cliente</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle className="text-sm">Retenção Mês 6+</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-600">85.0%</p>
                <p className="text-xs text-gray-500">Clientes fiéis</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prevention" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {riskSegments.map((risk, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      risk.color === 'red' ? 'bg-red-500' :
                      risk.color === 'yellow' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    {risk.segment}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold mb-2">{risk.count}</p>
                  <div className="space-y-1">
                    {risk.indicators.map((indicator, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Estratégias de Retenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Ações Proativas</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium text-sm">Health Score Monitoring</h5>
                      <p className="text-xs text-gray-600">Monitoramento contínuo de sinais de risco</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium text-sm">Onboarding Melhorado</h5>
                      <p className="text-xs text-gray-600">Reduzir churn nos primeiros 30 dias</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium text-sm">Customer Success</h5>
                      <p className="text-xs text-gray-600">Acompanhamento personalizado</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Ações Reativas</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium text-sm">Exit Interviews</h5>
                      <p className="text-xs text-gray-600">Entender motivos reais de cancelamento</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium text-sm">Win-back Campaigns</h5>
                      <p className="text-xs text-gray-600">Recuperar clientes cancelados</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium text-sm">Retention Offers</h5>
                      <p className="text-xs text-gray-600">Descontos e ofertas especiais</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Plano de Ação - Próximos 30 dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <h4 className="font-medium">Implementar Health Score</h4>
                    <p className="text-sm text-gray-600">Sistema de pontuação baseado em uso e engagement</p>
                  </div>
                  <Badge variant="outline">Alta Prioridade</Badge>
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <h4 className="font-medium">Survey de Cancelamento</h4>
                    <p className="text-sm text-gray-600">Automatizar pesquisa para entender motivos</p>
                  </div>
                  <Badge variant="outline">Média Prioridade</Badge>
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Target className="h-5 w-5 text-purple-500" />
                  <div className="flex-1">
                    <h4 className="font-medium">Campanha Retenção Premium</h4>
                    <p className="text-sm text-gray-600">Focar nos clientes Premium em risco</p>
                  </div>
                  <Badge variant="outline">Alta Prioridade</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
