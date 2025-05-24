import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Users, Target, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { CommercialAIAnalysisButton } from './CommercialAIAnalysisButton';

const mockVolumeData = [
  { name: 'Jan', leads: 120, qualified: 85, meetings: 65 },
  { name: 'Fev', leads: 135, qualified: 92, meetings: 78 },
  { name: 'Mar', leads: 142, qualified: 98, meetings: 82 },
  { name: 'Abr', leads: 158, qualified: 105, meetings: 89 },
  { name: 'Mai', leads: 167, qualified: 115, meetings: 95 },
  { name: 'Jun', leads: 175, qualified: 125, meetings: 102 }
];

const mockConversionData = [
  { stage: 'Lead', value: 100, conversion: 100 },
  { stage: 'Qualificado', value: 72, conversion: 72 },
  { stage: 'Reunião', value: 58, conversion: 58 },
  { stage: 'Proposta', value: 42, conversion: 42 },
  { stage: 'Negociação', value: 28, conversion: 28 },
  { stage: 'Fechado', value: 18, conversion: 18 }
];

const mockPerformanceData = [
  { name: 'João Silva', closed: 85, revenue: 125000, meetings: 45 },
  { name: 'Maria Santos', closed: 92, revenue: 145000, meetings: 52 },
  { name: 'Pedro Costa', closed: 78, revenue: 98000, meetings: 38 },
  { name: 'Ana Ferreira', closed: 88, revenue: 132000, meetings: 48 }
];

const mockBehavioralData = [
  { subject: 'Follow-up', A: 85, fullMark: 100 },
  { subject: 'Agilidade', A: 78, fullMark: 100 },
  { subject: 'Assertividade', A: 92, fullMark: 100 },
  { subject: 'Consultiva', A: 76, fullMark: 100 },
  { subject: 'Persuasão', A: 88, fullMark: 100 },
  { subject: 'Energia', A: 82, fullMark: 100 }
];

const mockLossReasons = [
  { name: 'Preço', value: 35, color: '#ef4444' },
  { name: 'Fit', value: 28, color: '#f97316' },
  { name: 'Timing', value: 20, color: '#eab308' },
  { name: 'Concorrência', value: 17, color: '#06b6d4' }
];

export function CommercialDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Cérebro Comercial</h1>
          <p className="text-slate-600">Centro de comando neural da operação de receita</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800">Operacional</Badge>
          <Badge className="bg-blue-100 text-blue-800">Pipeline Saudável</Badge>
          <CommercialAIAnalysisButton />
        </div>
      </div>

      {/* Métricas de Volume */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Gerados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">175</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% vs mês anterior
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.5% vs meta
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Gerada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 500K</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +18% vs mês anterior
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ciclo de Venda</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 dias</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5 dias vs média
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mapa do Funil */}
        <Card>
          <CardHeader>
            <CardTitle>Mapa do Funil em Tempo Real</CardTitle>
            <CardDescription>Conversão por etapa do pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Leads", color: "hsl(var(--chart-1))" },
                conversion: { label: "Conversão %", color: "hsl(var(--chart-2))" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockConversionData}>
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Análise Comportamental */}
        <Card>
          <CardHeader>
            <CardTitle>Radar de Performance Comportamental</CardTitle>
            <CardDescription>Análise qualitativa da abordagem comercial</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                A: { label: "Score", color: "hsl(var(--chart-1))" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={mockBehavioralData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Performance"
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

      {/* Alertas Inteligentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Alertas Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Pipeline Inflado Detectado</p>
                <p className="text-muted-foreground">34% das oportunidades sem avanço há mais de 14 dias</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Performance Abaixo da Média</p>
                <p className="text-muted-foreground">SDR João converte 23% abaixo da média no setor X</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Ciclo de Venda Aumentou</p>
                <p className="text-muted-foreground">Tempo de ciclo aumentou 12% este mês. Verificar objeções</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Motivos de Perda</CardTitle>
            <CardDescription>Análise qualitativa das perdas no pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Percentual", color: "hsl(var(--chart-1))" }
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockLossReasons}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockLossReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Qualitativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Insights Qualitativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Abordagem Consultiva</h4>
              <p className="text-sm text-green-700">
                Seus closers têm 34% maior taxa de conversão quando utilizam abordagem consultiva versus agressiva
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Follow-up Eficiente</h4>
              <p className="text-sm text-blue-700">
                Oportunidades com follow-up em até 2h têm 67% mais chances de fechamento
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Horário Ideal</h4>
              <p className="text-sm text-purple-700">
                Calls entre 14h-16h têm 42% maior taxa de conversão para seu perfil de cliente
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">Objeção Recorrente</h4>
              <p className="text-sm text-orange-700">
                "Preço muito alto" representa 35% das perdas - considere criar argumentação específica
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
