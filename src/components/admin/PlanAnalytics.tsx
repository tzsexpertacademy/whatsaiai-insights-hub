
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Award,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from "recharts";

export function PlanAnalytics() {
  const [selectedPlan, setSelectedPlan] = useState('all');

  // Dados detalhados dos planos
  const planDetails = [
    {
      id: 'basic',
      name: 'Básico',
      price: 139.90,
      clients: 89,
      revenue: 12450,
      margin: 92,
      churn: 4.2,
      cac: 380,
      ltv: 3350,
      color: '#3B82F6',
      growth: '+8%',
      features: ['Análise Básica', 'WhatsApp', '1 Usuário'],
      conversionRate: 12.5,
      upgradeRate: 15.2
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 279.90,
      clients: 67,
      revenue: 18690,
      margin: 88,
      churn: 2.8,
      cac: 450,
      ltv: 7800,
      color: '#8B5CF6',
      growth: '+15%',
      features: ['Análise Avançada', 'WhatsApp', 'IA Premium', '3 Usuários'],
      conversionRate: 8.7,
      upgradeRate: 22.4
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 449.90,
      clients: 31,
      revenue: 13860,
      margin: 82,
      churn: 1.5,
      cac: 680,
      ltv: 15600,
      color: '#F59E0B',
      growth: '+25%',
      features: ['Análise Completa', 'Multi-WhatsApp', 'IA Personalizada', 'Usuários Ilimitados'],
      conversionRate: 4.2,
      upgradeRate: 0
    }
  ];

  // Evolução histórica por plano
  const planEvolution = [
    { month: 'Jan', basic: 72, premium: 45, enterprise: 18 },
    { month: 'Fev', basic: 78, premium: 52, enterprise: 22 },
    { month: 'Mar', basic: 82, premium: 58, enterprise: 25 },
    { month: 'Abr', basic: 85, premium: 62, enterprise: 28 },
    { month: 'Mai', basic: 87, premium: 65, enterprise: 30 },
    { month: 'Jun', basic: 89, premium: 67, enterprise: 31 }
  ];

  // Matriz de conversão entre planos
  const conversionMatrix = [
    { from: 'Trial', to: 'Básico', rate: 12.5, count: 89 },
    { from: 'Trial', to: 'Premium', rate: 8.7, count: 67 },
    { from: 'Trial', to: 'Enterprise', rate: 4.2, count: 31 },
    { from: 'Básico', to: 'Premium', rate: 15.2, count: 23 },
    { from: 'Premium', to: 'Enterprise', rate: 22.4, count: 8 }
  ];

  const totalRevenue = planDetails.reduce((sum, plan) => sum + plan.revenue, 0);
  const totalClients = planDetails.reduce((sum, plan) => sum + plan.clients, 0);
  const weightedChurn = planDetails.reduce((sum, plan) => sum + (plan.churn * plan.clients), 0) / totalClients;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Análise de Planos</h2>
          <p className="text-slate-600">Performance detalhada de cada plano de assinatura</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPlan === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPlan('all')}
          >
            Todos
          </Button>
          {planDetails.map((plan) => (
            <Button
              key={plan.id}
              variant={selectedPlan === plan.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.name}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="conversion">Conversão</TabsTrigger>
          <TabsTrigger value="optimization">Otimização</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Receita Total</p>
                    <p className="text-2xl font-bold">R$ {totalRevenue.toLocaleString()}</p>
                    <p className="text-blue-200 text-xs">Todos os planos</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Clientes Ativos</p>
                    <p className="text-2xl font-bold">{totalClients}</p>
                    <p className="text-green-200 text-xs">Crescimento: +12%</p>
                  </div>
                  <Users className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">ARPU Médio</p>
                    <p className="text-2xl font-bold">R$ {Math.round(totalRevenue / totalClients)}</p>
                    <p className="text-purple-200 text-xs">Por cliente/mês</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Churn Médio</p>
                    <p className="text-2xl font-bold">{weightedChurn.toFixed(1)}%</p>
                    <p className="text-orange-200 text-xs">Ponderado por clientes</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cards Detalhados dos Planos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {planDetails.map((plan) => (
              <Card key={plan.id} className="bg-white/70 backdrop-blur-sm border-white/50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: plan.color }}></div>
                      {plan.name}
                    </CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {plan.growth}
                    </Badge>
                  </div>
                  <CardDescription>R$ {plan.price}/mês</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Clientes</p>
                        <p className="text-xl font-bold">{plan.clients}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Receita</p>
                        <p className="text-xl font-bold">R$ {plan.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Margem</p>
                        <p className="text-lg font-semibold text-green-600">{plan.margin}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Churn</p>
                        <p className="text-lg font-semibold text-red-600">{plan.churn}%</p>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Recursos:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-gray-500">LTV</p>
                        <p className="font-semibold">R$ {plan.ltv.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">CAC</p>
                        <p className="font-semibold">R$ {plan.cac}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">LTV/CAC</p>
                        <p className="font-semibold text-green-600">{(plan.ltv / plan.cac).toFixed(1)}x</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráfico de Evolução */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Evolução dos Planos</CardTitle>
              <CardDescription>Crescimento de clientes por plano ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                basic: { label: "Básico", color: "#3B82F6" },
                premium: { label: "Premium", color: "#8B5CF6" },
                enterprise: { label: "Enterprise", color: "#F59E0B" }
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={planEvolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="basic" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="premium" stroke="#8B5CF6" strokeWidth={2} />
                    <Line type="monotone" dataKey="enterprise" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Receita por Plano */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle>Distribuição de Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={planDetails}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="revenue"
                      >
                        {planDetails.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded shadow-lg">
                                <p className="font-medium">{data.name}</p>
                                <p className="text-sm">Receita: R$ {data.revenue.toLocaleString()}</p>
                                <p className="text-sm">Participação: {((data.revenue / totalRevenue) * 100).toFixed(1)}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Margem por Plano */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle>Margem por Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  margin: { label: "Margem (%)", color: "#10B981" }
                }} className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={planDetails}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="margin" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Métricas por Plano */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Comparativo de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Plano</th>
                      <th className="text-right py-2">Preço</th>
                      <th className="text-right py-2">Clientes</th>
                      <th className="text-right py-2">Receita</th>
                      <th className="text-right py-2">Margem</th>
                      <th className="text-right py-2">Churn</th>
                      <th className="text-right py-2">LTV/CAC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planDetails.map((plan) => (
                      <tr key={plan.id} className="border-b">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }}></div>
                            {plan.name}
                          </div>
                        </td>
                        <td className="text-right py-3">R$ {plan.price}</td>
                        <td className="text-right py-3">{plan.clients}</td>
                        <td className="text-right py-3">R$ {plan.revenue.toLocaleString()}</td>
                        <td className="text-right py-3">
                          <span className="text-green-600 font-medium">{plan.margin}%</span>
                        </td>
                        <td className="text-right py-3">
                          <span className="text-red-600 font-medium">{plan.churn}%</span>
                        </td>
                        <td className="text-right py-3">
                          <span className="font-medium">{(plan.ltv / plan.cac).toFixed(1)}x</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Matriz de Conversão</CardTitle>
              <CardDescription>Fluxo de conversão entre planos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionMatrix.map((conversion, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{conversion.from}</Badge>
                      <ArrowUpRight className="h-4 w-4 text-gray-400" />
                      <Badge variant="outline">{conversion.to}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{conversion.rate}%</p>
                        <p className="text-sm text-gray-500">taxa de conversão</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{conversion.count}</p>
                        <p className="text-sm text-gray-500">conversões</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planDetails.map((plan) => (
              <Card key={plan.id} className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }}></div>
                    {plan.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Taxa de Conversão</span>
                      <span className="font-medium">{plan.conversionRate}%</span>
                    </div>
                    {plan.upgradeRate > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Taxa de Upgrade</span>
                        <span className="font-medium text-green-600">{plan.upgradeRate}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm">Retenção</span>
                      <span className="font-medium">{(100 - plan.churn).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Oportunidades de Crescimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800">Plano Premium</h4>
                    <p className="text-sm text-green-600">
                      Maior potencial de upgrade do Básico (15.2% taxa)
                    </p>
                    <Badge variant="outline" className="mt-2 bg-green-100 text-green-700">
                      Ação: Campanhas de upgrade
                    </Badge>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800">Plano Enterprise</h4>
                    <p className="text-sm text-blue-600">
                      Menor churn (1.5%) e maior LTV (R$ 15.600)
                    </p>
                    <Badge variant="outline" className="mt-2 bg-blue-100 text-blue-700">
                      Ação: Foco em vendas B2B
                    </Badge>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800">Plano Básico</h4>
                    <p className="text-sm text-yellow-600">
                      Maior volume mas churn elevado (4.2%)
                    </p>
                    <Badge variant="outline" className="mt-2 bg-yellow-100 text-yellow-700">
                      Ação: Melhorar onboarding
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle>Recomendações Estratégicas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <div>
                      <p className="font-medium">Otimizar Preços</p>
                      <p className="text-sm text-gray-600">
                        Premium tem melhor equilíbrio entre receita e retenção
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <div>
                      <p className="font-medium">Campanhas de Upgrade</p>
                      <p className="text-sm text-gray-600">
                        15.2% dos usuários Básico migram para Premium
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                    <div>
                      <p className="font-medium">Expandir Enterprise</p>
                      <p className="text-sm text-gray-600">
                        Menor churn e maior valor por cliente
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                    <div>
                      <p className="font-medium">Reduzir Churn Básico</p>
                      <p className="text-sm text-gray-600">
                        Melhorar experiência do usuário inicial
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Projeções de Otimização</CardTitle>
              <CardDescription>Impacto estimado das melhorias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Reduzir Churn Básico</h4>
                  <p className="text-sm text-gray-600 mb-2">De 4.2% para 3.0%</p>
                  <p className="text-lg font-bold text-green-600">+R$ 2.400/mês</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Aumentar Upgrades</h4>
                  <p className="text-sm text-gray-600 mb-2">+5% conversão Premium</p>
                  <p className="text-lg font-bold text-green-600">+R$ 1.800/mês</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Expandir Enterprise</h4>
                  <p className="text-sm text-gray-600 mb-2">+10 clientes</p>
                  <p className="text-lg font-bold text-green-600">+R$ 4.500/mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
