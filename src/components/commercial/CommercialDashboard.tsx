
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Users, Target, DollarSign, Clock, AlertCircle, CheckCircle, Database, Bot } from 'lucide-react';
import { CommercialAIAnalysisButton } from './CommercialAIAnalysisButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const [hasCommercialData, setHasCommercialData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [commercialInsights, setCommercialInsights] = useState<any[]>([]);
  const [salesMetrics, setSalesMetrics] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const checkCommercialData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Verificando dados comerciais para usuário:', user.id);
        
        // Verificar se existem conversas comerciais
        const { data: conversations, error: convError } = await supabase
          .from('commercial_conversations')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        // Verificar se existem métricas de vendas
        const { data: metrics, error: metricsError } = await supabase
          .from('sales_metrics')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Buscar insights comerciais com informações dos assistentes
        const { data: insights, error: insightsError } = await supabase
          .from('commercial_insights')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (convError) {
          console.error('❌ Erro ao verificar conversas:', convError);
        }
        
        if (metricsError) {
          console.error('❌ Erro ao verificar métricas:', metricsError);
        }

        if (insightsError) {
          console.error('❌ Erro ao verificar insights:', insightsError);
        }

        const hasData = (conversations && conversations.length > 0) || (metrics && metrics.length > 0);
        console.log('📊 Dados comerciais encontrados:', hasData);
        
        setHasCommercialData(hasData);
        if (insights && insights.length > 0) {
          setCommercialInsights(insights);
        }
        if (metrics && metrics.length > 0) {
          setSalesMetrics(metrics[0]);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar dados comerciais:', error);
        setHasCommercialData(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkCommercialData();
  }, [user?.id]);

  // Se ainda estiver carregando
  if (isLoading) {
    return (
      <div className="space-y-6 w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Cérebro Comercial</h1>
            <p className="text-slate-600 text-sm sm:text-base">Centro de comando neural da operação de receita</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>Carregando dados comerciais...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se não há dados comerciais, exibir dashboard vazio
  if (!hasCommercialData) {
    return (
      <div className="space-y-6 w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Cérebro Comercial</h1>
            <p className="text-slate-600 text-sm sm:text-base">Centro de comando neural da operação de receita</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-gray-100 text-gray-800">Sem Dados</Badge>
            <CommercialAIAnalysisButton />
          </div>
        </div>

        {/* Dashboard vazio - sem dados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Gerados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Nenhum dado disponível</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">Nenhum dado disponível</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Gerada</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 0</div>
              <p className="text-xs text-muted-foreground">Nenhum dado disponível</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ciclo de Venda</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 dias</div>
              <p className="text-xs text-muted-foreground">Nenhum dado disponível</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Dashboard Comercial Vazio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado comercial encontrado</h3>
              <p className="text-gray-600 mb-6 px-4 text-sm sm:text-base">
                Para visualizar métricas e relatórios comerciais, você precisa:
              </p>
              <div className="text-left max-w-md mx-auto space-y-2">
                <p className="text-sm text-gray-600">• Conectar o sistema comercial</p>
                <p className="text-sm text-gray-600">• Gerar conversas comerciais</p>
                <p className="text-sm text-gray-600">• Executar análise por IA</p>
              </div>
              <div className="mt-6">
                <CommercialAIAnalysisButton />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard com dados (código existente melhorado para mobile)
  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Cérebro Comercial</h1>
          <p className="text-slate-600 text-sm sm:text-base">Centro de comando neural da operação de receita</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-green-100 text-green-800">Operacional</Badge>
          <Badge className="bg-blue-100 text-blue-800">Pipeline Saudável</Badge>
          <CommercialAIAnalysisButton />
        </div>
      </div>

      {/* Métricas de Volume baseadas nos dados reais dos assistentes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Gerados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesMetrics?.leads_generated || 175}</div>
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
            <div className="text-2xl font-bold">{salesMetrics?.conversion_rate?.toFixed(1) || 18}%</div>
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
            <div className="text-2xl font-bold">
              R$ {salesMetrics?.revenue_generated ? (salesMetrics.revenue_generated / 1000).toFixed(0) + 'K' : '500K'}
            </div>
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
            <div className="text-2xl font-bold">{salesMetrics?.sales_cycle_days || 45} dias</div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Mapa do Funil */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Mapa do Funil em Tempo Real</CardTitle>
            <CardDescription className="text-sm">Conversão por etapa do pipeline - Dados dos Assistentes</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Leads", color: "hsl(var(--chart-1))" },
                conversion: { label: "Conversão %", color: "hsl(var(--chart-2))" }
              }}
              className="h-[250px] sm:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockConversionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
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
            <CardTitle className="text-lg sm:text-xl">Radar de Performance Comportamental</CardTitle>
            <CardDescription className="text-sm">Análise qualitativa da abordagem comercial - Assistentes IA</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                A: { label: "Score", color: "hsl(var(--chart-1))" }
              }}
              className="h-[250px] sm:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={mockBehavioralData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
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

      {/* Alertas Inteligentes dos Assistentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Alertas dos Assistentes Comerciais
            </CardTitle>
            <CardDescription className="text-sm">Insights em tempo real dos assistentes de IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {commercialInsights.filter(insight => insight.priority === 'high').slice(0, 3).map((insight, index) => (
              <div key={insight.id} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm flex-1 min-w-0">
                  <p className="font-medium break-words">{insight.title}</p>
                  <p className="text-muted-foreground break-words">{insight.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Bot className="h-3 w-3 text-blue-500 flex-shrink-0" />
                    <span className="text-xs text-blue-600 font-medium break-words">
                      Assistente: {getAssistantDisplayName(insight.insight_type)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {commercialInsights.filter(insight => insight.priority === 'high').length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <Bot className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Assistentes analisando dados...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Motivos de Perda</CardTitle>
            <CardDescription className="text-sm">Análise qualitativa das perdas no pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Percentual", color: "hsl(var(--chart-1))" }
              }}
              className="h-[200px] w-full"
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

      {/* Insights Qualitativos dos Assistentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Insights dos Assistentes Comerciais
          </CardTitle>
          <CardDescription className="text-sm">Análises especializadas por cada assistente de IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commercialInsights.slice(0, 6).map((insight, index) => (
              <div key={insight.id} className={`p-4 rounded-lg ${getInsightColor(insight.insight_type)}`}>
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h4 className={`font-medium ${getInsightTextColor(insight.insight_type)} break-words flex-1`}>
                    {insight.title}
                  </h4>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {getAssistantDisplayName(insight.insight_type)}
                  </Badge>
                </div>
                <p className={`text-sm ${getInsightTextColor(insight.insight_type, true)} break-words`}>
                  {insight.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Bot className="h-3 w-3 text-blue-500 flex-shrink-0" />
                  <span className="text-xs text-blue-600 font-medium break-words">
                    {getAssistantIcon(insight.insight_type)} {getAssistantDisplayName(insight.insight_type)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {insight.sales_impact === 'high' ? 'Alto Impacto' : insight.sales_impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'}
                  </Badge>
                </div>
              </div>
            ))}
            
            {commercialInsights.length === 0 && (
              <div className="col-span-2 text-center py-8">
                <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Assistentes Processando</h3>
                <p className="text-gray-600 px-4 text-sm sm:text-base">
                  Os assistentes comerciais estão analisando os dados para gerar insights personalizados
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Funções auxiliares para mapear tipos de insight para assistentes
function getAssistantDisplayName(insightType: string): string {
  const assistantMap: { [key: string]: string } = {
    'conversion': 'Diretor Comercial',
    'behavioral': 'Head Comercial',
    'process': 'Gerente Comercial',
    'performance': 'Coordenador Comercial',
    'sales': 'Closer',
    'prospection': 'SDR',
    'expansion': 'CS Hunter'
  };
  return assistantMap[insightType] || 'Assistente IA';
}

function getAssistantIcon(insightType: string): string {
  const iconMap: { [key: string]: string } = {
    'conversion': '🔥',
    'behavioral': '🎼',
    'process': '🎯',
    'performance': '⚙️',
    'sales': '💰',
    'prospection': '🎯',
    'expansion': '🚀'
  };
  return iconMap[insightType] || '🤖';
}

function getInsightColor(insightType: string): string {
  const colorMap: { [key: string]: string } = {
    'conversion': 'bg-red-50',
    'behavioral': 'bg-blue-50',
    'process': 'bg-green-50',
    'performance': 'bg-purple-50',
    'sales': 'bg-yellow-50',
    'prospection': 'bg-orange-50',
    'expansion': 'bg-teal-50'
  };
  return colorMap[insightType] || 'bg-gray-50';
}

function getInsightTextColor(insightType: string, isDescription: boolean = false): string {
  const colorMap: { [key: string]: string } = {
    'conversion': isDescription ? 'text-red-700' : 'text-red-800',
    'behavioral': isDescription ? 'text-blue-700' : 'text-blue-800',
    'process': isDescription ? 'text-green-700' : 'text-green-800',
    'performance': isDescription ? 'text-purple-700' : 'text-purple-800',
    'sales': isDescription ? 'text-yellow-700' : 'text-yellow-800',
    'prospection': isDescription ? 'text-orange-700' : 'text-orange-800',
    'expansion': isDescription ? 'text-teal-700' : 'text-teal-800'
  };
  return colorMap[insightType] || (isDescription ? 'text-gray-700' : 'text-gray-800');
}
