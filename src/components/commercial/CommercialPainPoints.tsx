
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, AlertTriangle, TrendingUp, TrendingDown, Clock, Target, DollarSign, Users } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface CommercialPainPoint {
  id: string;
  title: string;
  description: string;
  severity: 'baixa' | 'média' | 'alta' | 'crítica';
  category: string;
  impactOnSales: 'baixo' | 'médio' | 'alto' | 'crítico';
  firstDetected: string;
  lastDetected: string;
  frequency: number;
  trend: 'crescente' | 'estável' | 'decrescente';
  affectedLeads: number;
  lostDeals: number;
  estimatedRevenueLoss: number;
}

export function CommercialPainPoints() {
  const isLoading = false; // Será integrado com o contexto comercial

  // Dados mockados para demonstração - serão substituídos pela IA comercial
  const mockPainPoints: CommercialPainPoint[] = [
    {
      id: '1',
      title: 'Objeção de Preço Recorrente',
      description: 'Clientes frequentemente questionam o valor do produto comparado à concorrência',
      severity: 'alta',
      category: 'Pricing',
      impactOnSales: 'alto',
      firstDetected: '2024-01-10',
      lastDetected: '2024-01-20',
      frequency: 23,
      trend: 'crescente',
      affectedLeads: 67,
      lostDeals: 12,
      estimatedRevenueLoss: 48000
    },
    {
      id: '2',
      title: 'Tempo de Resposta Lento',
      description: 'Leads reclamam de demora no atendimento e follow-up',
      severity: 'crítica',
      category: 'Atendimento',
      impactOnSales: 'crítico',
      firstDetected: '2024-01-05',
      lastDetected: '2024-01-19',
      frequency: 31,
      trend: 'crescente',
      affectedLeads: 89,
      lostDeals: 18,
      estimatedRevenueLoss: 72000
    },
    {
      id: '3',
      title: 'Falta de Clareza no Produto',
      description: 'Prospects não compreendem totalmente os benefícios e funcionalidades',
      severity: 'média',
      category: 'Produto',
      impactOnSales: 'médio',
      firstDetected: '2024-01-08',
      lastDetected: '2024-01-18',
      frequency: 15,
      trend: 'estável',
      affectedLeads: 45,
      lostDeals: 8,
      estimatedRevenueLoss: 28000
    }
  ];

  const severityColors = {
    'baixa': '#10B981',
    'média': '#F59E0B',
    'alta': '#EF4444',
    'crítica': '#7C2D12'
  };

  const impactData = [
    { name: 'Baixo', value: 3, color: '#10B981' },
    { name: 'Médio', value: 8, color: '#F59E0B' },
    { name: 'Alto', value: 12, color: '#EF4444' },
    { name: 'Crítico', value: 5, color: '#7C2D12' }
  ];

  const categoryData = [
    { category: 'Pricing', count: 8, revenue_loss: 48000 },
    { category: 'Atendimento', count: 12, revenue_loss: 72000 },
    { category: 'Produto', count: 6, revenue_loss: 28000 },
    { category: 'Processo', count: 4, revenue_loss: 15000 },
    { category: 'Competição', count: 3, revenue_loss: 12000 }
  ];

  const timelineData = [
    { date: '15/01', total: 18, novas: 3, resolvidas: 2, revenue_loss: 25000 },
    { date: '16/01', total: 21, novas: 5, resolvidas: 2, revenue_loss: 31000 },
    { date: '17/01', total: 25, novas: 6, resolvidas: 2, revenue_loss: 38000 },
    { date: '18/01', total: 28, novas: 4, resolvidas: 1, revenue_loss: 42000 },
    { date: '19/01', total: 32, novas: 5, resolvidas: 1, revenue_loss: 48000 },
    { date: '20/01', total: 35, novas: 4, resolvidas: 1, revenue_loss: 52000 }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dores do Cliente - Visão Comercial</h1>
          <p className="text-slate-600">Identificação de obstáculos que impactam vendas e conversões</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dores do Cliente - Visão Comercial</h1>
          <p className="text-slate-600">Obstáculos identificados pela IA que impactam vendas e conversões</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
            28 Dores Ativas
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700">
            R$ 148k Perda Estimada
          </Badge>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Dores Críticas</p>
                <p className="text-2xl font-bold">5</p>
                <p className="text-red-200 text-xs">Ação urgente necessária</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Leads Afetados</p>
                <p className="text-2xl font-bold">201</p>
                <p className="text-orange-200 text-xs">Últimos 30 dias</p>
              </div>
              <Users className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Deals Perdidos</p>
                <p className="text-2xl font-bold">38</p>
                <p className="text-purple-200 text-xs">Por dores identificadas</p>
              </div>
              <TrendingDown className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Perda de Receita</p>
                <p className="text-2xl font-bold">R$ 148k</p>
                <p className="text-red-200 text-xs">Estimativa mensal</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Evolução de Dores e Impacto Financeiro</CardTitle>
            <CardDescription>Crescimento das dores e perda de receita ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line yAxisId="left" type="monotone" dataKey="total" stroke="#EF4444" strokeWidth={2} name="Total de Dores" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue_loss" stroke="#7C2D12" strokeWidth={2} name="Perda de Receita (R$)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Impacto por Categoria</CardTitle>
            <CardDescription>Dores agrupadas por área de negócio</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista de dores comerciais */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Principais Dores Comerciais</CardTitle>
          <CardDescription>Obstáculos que mais impactam o processo de vendas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPainPoints.map((pain) => (
              <div key={pain.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{pain.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{pain.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      style={{ 
                        backgroundColor: severityColors[pain.severity],
                        color: 'white'
                      }}
                    >
                      {pain.severity}
                    </Badge>
                    {pain.trend === 'crescente' && <TrendingUp className="h-4 w-4 text-red-500" />}
                    {pain.trend === 'decrescente' && <TrendingDown className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-slate-50 rounded p-2 text-center">
                    <p className="text-slate-500">Leads Afetados</p>
                    <p className="font-bold text-slate-800">{pain.affectedLeads}</p>
                  </div>
                  <div className="bg-slate-50 rounded p-2 text-center">
                    <p className="text-slate-500">Deals Perdidos</p>
                    <p className="font-bold text-red-600">{pain.lostDeals}</p>
                  </div>
                  <div className="bg-slate-50 rounded p-2 text-center">
                    <p className="text-slate-500">Perda Estimada</p>
                    <p className="font-bold text-red-600">R$ {pain.estimatedRevenueLoss.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 rounded p-2 text-center">
                    <p className="text-slate-500">Frequência</p>
                    <p className="font-bold text-slate-800">{pain.frequency}x</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Categoria: {pain.category}</span>
                  <span>Última detecção: {new Date(pain.lastDetected).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações recomendadas */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Ações Recomendadas pela IA</CardTitle>
          <CardDescription>Estratégias para resolver as principais dores identificadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-800">Implementar Chat de Atendimento Rápido</h5>
                <p className="text-sm text-blue-600">Reduzir tempo de resposta de 4h para 30min pode recuperar 60% dos leads perdidos</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-green-800">Criar Material de Comparação de Preços</h5>
                <p className="text-sm text-green-600">Demonstrar ROI e valor pode reduzir objeções de preço em 45%</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-purple-800">Melhorar Onboarding do Produto</h5>
                <p className="text-sm text-purple-600">Demo interativa pode aumentar conversão em 35%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
