import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  AlertTriangle,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Clock,
  Award,
  Zap
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from "recharts";
import { ClientManagement } from './ClientManagement';
import { FinancialMetrics } from './FinancialMetrics';
import { PlanAnalytics } from './PlanAnalytics';
import { ChurnAnalysis } from './ChurnAnalysis';
import { AdminHeader } from './AdminHeader';
import { PlanManagement } from './PlanManagement';

export function AdminMasterDashboard() {
  const [timeRange, setTimeRange] = useState('30d');
  
  // Métricas principais de negócio
  const businessMetrics = {
    mrr: 45000, // Monthly Recurring Revenue
    arr: 540000, // Annual Recurring Revenue
    totalClients: 187,
    activeClients: 162,
    churnRate: 3.2,
    avgRevenuePerUser: 278,
    customerLifetimeValue: 8900,
    customerAcquisitionCost: 450,
    grossMargin: 87.5,
    netRevenueRetention: 112
  };

  // Dados de crescimento por mês
  const growthData = [
    { month: 'Jan', mrr: 28000, clients: 98, churn: 2.1 },
    { month: 'Fev', mrr: 32000, clients: 118, churn: 1.8 },
    { month: 'Mar', mrr: 35000, clients: 134, churn: 2.4 },
    { month: 'Abr', mrr: 38000, clients: 145, churn: 3.1 },
    { month: 'Mai', mrr: 42000, clients: 167, churn: 2.9 },
    { month: 'Jun', mrr: 45000, clients: 187, churn: 3.2 }
  ];

  // Análise por planos
  const planMetrics = [
    { 
      name: 'Básico', 
      value: 89, 
      revenue: 12450, 
      margin: 92,
      color: '#3B82F6',
      price: 139.90,
      churn: 4.2
    },
    { 
      name: 'Premium', 
      value: 67, 
      revenue: 18690, 
      margin: 88,
      color: '#8B5CF6',
      price: 279.90,
      churn: 2.8
    },
    { 
      name: 'Enterprise', 
      value: 31, 
      revenue: 13860, 
      margin: 82,
      color: '#F59E0B',
      price: 449.90,
      churn: 1.5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader />

        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Sistema Operacional
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {businessMetrics.totalClients} Clientes Ativos
          </Badge>
        </div>

        {/* Métricas Principais de Negócio */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">MRR (Receita Mensal)</p>
                  <p className="text-2xl font-bold">R$ {businessMetrics.mrr.toLocaleString()}</p>
                  <p className="text-green-200 text-xs">+12% vs mês anterior</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">ARR (Receita Anual)</p>
                  <p className="text-2xl font-bold">R$ {businessMetrics.arr.toLocaleString()}</p>
                  <p className="text-blue-200 text-xs">Projeção baseada no MRR</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">ARPU (Receita/Cliente)</p>
                  <p className="text-2xl font-bold">R$ {businessMetrics.avgRevenuePerUser}</p>
                  <p className="text-purple-200 text-xs">Crescimento sustentável</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Taxa de Churn</p>
                  <p className="text-2xl font-bold">{businessMetrics.churnRate}%</p>
                  <p className="text-orange-200 text-xs">Meta: &lt; 5%</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas Avançadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Customer Lifetime Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-800">R$ {businessMetrics.customerLifetimeValue.toLocaleString()}</span>
                <Award className="h-6 w-6 text-yellow-500" />
              </div>
              <p className="text-xs text-slate-500 mt-1">CAC: R$ {businessMetrics.customerAcquisitionCost} | Payback: 1.6 meses</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Margem Bruta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-800">{businessMetrics.grossMargin}%</span>
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-xs text-slate-500 mt-1">Excelente para SaaS (meta: &gt;80%)</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Net Revenue Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-800">{businessMetrics.netRevenueRetention}%</span>
                <Zap className="h-6 w-6 text-purple-500" />
              </div>
              <p className="text-xs text-slate-500 mt-1">Crescimento orgânico positivo</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="plans-mgmt">Planos</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="plans">Análise de Planos</TabsTrigger>
            <TabsTrigger value="churn">Análise de Churn</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Crescimento MRR */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Crescimento MRR
                  </CardTitle>
                  <CardDescription>Evolução da receita mensal recorrente</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{ mrr: { label: "MRR", color: "#3B82F6" } }} className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="mrr" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Distribuição por Planos */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Receita por Plano
                  </CardTitle>
                  <CardDescription>Distribuição da receita entre os planos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={planMetrics}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="revenue"
                        >
                          {planMetrics.map((entry, index) => (
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
                                  <p className="text-sm">Clientes: {data.value}</p>
                                  <p className="text-sm">Margem: {data.margin}%</p>
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
            </div>

            {/* Métricas de Planos */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle>Performance dos Planos</CardTitle>
                <CardDescription>Análise detalhada de cada plano de assinatura</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {planMetrics.map((plan) => (
                    <div key={plan.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: plan.color }}></div>
                        <div>
                          <h4 className="font-medium">{plan.name}</h4>
                          <p className="text-sm text-gray-600">R$ {plan.price}/mês</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{plan.value}</p>
                          <p className="text-gray-500">Clientes</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">R$ {plan.revenue.toLocaleString()}</p>
                          <p className="text-gray-500">Receita</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{plan.margin}%</p>
                          <p className="text-gray-500">Margem</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-red-600">{plan.churn}%</p>
                          <p className="text-gray-500">Churn</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans-mgmt">
            <PlanManagement />
          </TabsContent>

          <TabsContent value="clients">
            <ClientManagement />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialMetrics />
          </TabsContent>

          <TabsContent value="plans">
            <PlanAnalytics />
          </TabsContent>

          <TabsContent value="churn">
            <ChurnAnalysis />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
