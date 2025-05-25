
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  AlertCircle,
  Calendar,
  BarChart3,
  Calculator,
  Target,
  Clock
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";

export function FinancialMetrics() {
  const [timeRange, setTimeRange] = useState('6m');

  // Dados financeiros históricos
  const financialData = [
    { month: 'Jan', receita: 28000, custo: 8400, lucro: 19600, inadimplencia: 2.1 },
    { month: 'Fev', receita: 32000, custo: 9600, lucro: 22400, inadimplencia: 1.8 },
    { month: 'Mar', receita: 35000, custo: 10500, lucro: 24500, inadimplencia: 2.4 },
    { month: 'Abr', receita: 38000, custo: 11400, lucro: 26600, inadimplencia: 3.1 },
    { month: 'Mai', receita: 42000, custo: 12600, lucro: 29400, inadimplencia: 2.9 },
    { month: 'Jun', receita: 45000, custo: 13500, lucro: 31500, inadimplencia: 3.2 }
  ];

  // Análise de fluxo de caixa
  const cashFlowData = [
    { periodo: 'Sem 1', entrada: 11250, saida: 3375, liquido: 7875 },
    { periodo: 'Sem 2', entrada: 11250, saida: 3375, liquido: 7875 },
    { periodo: 'Sem 3', entrada: 11250, saida: 3375, liquido: 7875 },
    { periodo: 'Sem 4', entrada: 11250, saida: 3375, liquido: 7875 }
  ];

  // Métricas de inadimplência por plano
  const defaultMetrics = [
    { plano: 'Básico', taxa: 4.2, valor: 586, clientes: 4 },
    { plano: 'Premium', taxa: 2.8, valor: 784, clientes: 2 },
    { plano: 'Enterprise', taxa: 1.5, valor: 450, clientes: 1 }
  ];

  // Análise de custos
  const costBreakdown = [
    { categoria: 'Infraestrutura', valor: 4500, percentual: 33.3 },
    { categoria: 'Marketing', valor: 3600, percentual: 26.7 },
    { categoria: 'Pessoal', valor: 2700, percentual: 20.0 },
    { categoria: 'Operacional', valor: 1800, percentual: 13.3 },
    { categoria: 'Outros', valor: 900, percentual: 6.7 }
  ];

  const totalCosts = costBreakdown.reduce((sum, item) => sum + item.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Métricas Financeiras</h2>
          <p className="text-slate-600">Análise completa da saúde financeira do negócio</p>
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

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Receita & Lucro</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="costs">Análise de Custos</TabsTrigger>
          <TabsTrigger value="defaults">Inadimplência</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Receita Bruta</p>
                    <p className="text-2xl font-bold">R$ 45.000</p>
                    <p className="text-green-200 text-xs">+18% vs mês anterior</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Lucro Líquido</p>
                    <p className="text-2xl font-bold">R$ 31.500</p>
                    <p className="text-blue-200 text-xs">Margem: 70%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Custos Totais</p>
                    <p className="text-2xl font-bold">R$ 13.500</p>
                    <p className="text-purple-200 text-xs">30% da receita</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">EBITDA</p>
                    <p className="text-2xl font-bold">R$ 33.750</p>
                    <p className="text-orange-200 text-xs">Margem: 75%</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Receita vs Lucro */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Evolução Financeira</CardTitle>
              <CardDescription>Receita, custos e lucro ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                receita: { label: "Receita", color: "#10B981" },
                custo: { label: "Custos", color: "#EF4444" },
                lucro: { label: "Lucro", color: "#3B82F6" }
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="receita" stroke="#10B981" strokeWidth={3} />
                    <Line type="monotone" dataKey="custo" stroke="#EF4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="lucro" stroke="#3B82F6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Fluxo de Caixa Semanal
              </CardTitle>
              <CardDescription>Entradas e saídas de caixa por semana</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                entrada: { label: "Entrada", color: "#10B981" },
                saida: { label: "Saída", color: "#EF4444" },
                liquido: { label: "Líquido", color: "#3B82F6" }
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="entrada" fill="#10B981" />
                    <Bar dataKey="saida" fill="#EF4444" />
                    <Bar dataKey="liquido" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Saldo Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">R$ 127.350</p>
                <p className="text-xs text-slate-500">Disponível em conta</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Projeção 30 dias</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">R$ 158.850</p>
                <p className="text-xs text-slate-500">Baseado no crescimento atual</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Runway</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-600">∞</p>
                <p className="text-xs text-slate-500">Fluxo de caixa positivo</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Breakdown de Custos</CardTitle>
              <CardDescription>Distribuição dos custos operacionais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costBreakdown.map((cost, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="font-medium">{cost.categoria}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">{cost.percentual}%</span>
                      <span className="font-bold">R$ {cost.valor.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total de Custos</span>
                  <span className="text-xl font-bold">R$ {totalCosts.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle className="text-sm">Eficiência de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Custo por Cliente</span>
                    <span className="font-medium">R$ 72</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Custo de Aquisição</span>
                    <span className="font-medium">R$ 450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Payback Period</span>
                    <span className="font-medium">1.6 meses</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle className="text-sm">Otimizações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Infraestrutura otimizada
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    Marketing pode melhorar
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Equipe eficiente
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="defaults" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Taxa Geral</p>
                    <p className="text-2xl font-bold">3.2%</p>
                    <p className="text-red-200 text-xs">Meta: &lt; 5%</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Valor em Atraso</p>
                    <p className="text-2xl font-bold">R$ 1.820</p>
                    <p className="text-orange-200 text-xs">7 clientes</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Tempo Médio</p>
                    <p className="text-2xl font-bold">12 dias</p>
                    <p className="text-yellow-200 text-xs">Para recuperação</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Inadimplência por Plano</CardTitle>
              <CardDescription>Análise detalhada da inadimplência por tipo de plano</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {defaultMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant={metric.taxa > 3 ? "destructive" : "outline"}>
                        {metric.plano}
                      </Badge>
                      <div>
                        <p className="font-medium">{metric.taxa}% de inadimplência</p>
                        <p className="text-sm text-gray-600">{metric.clientes} clientes em atraso</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">R$ {metric.valor}</p>
                      <p className="text-sm text-gray-500">valor total</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Histórico de Inadimplência</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                inadimplencia: { label: "Taxa (%)", color: "#EF4444" }
              }} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="inadimplencia" stroke="#EF4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
