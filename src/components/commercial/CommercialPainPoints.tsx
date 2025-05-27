
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCommercialAnalysisData } from '@/contexts/CommercialAnalysisDataContext';
import { Loader2, AlertTriangle, TrendingUp, Target, Brain, AlertCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface CommercialPainPoint {
  id: string;
  title: string;
  description: string;
  severity: 'baixa' | 'média' | 'alta';
  category: string;
  firstDetected: string;
  assistantName: string;
  salesImpact: string;
}

export function CommercialPainPoints() {
  const { data, isLoading } = useCommercialAnalysisData();

  // Processar insights comerciais para extrair dores/objeções
  const extractPainPointsFromInsights = () => {
    if (!data.insights || data.insights.length === 0) return [];

    return data.insights
      .filter(insight => 
        insight.description?.toLowerCase().includes('objeção') ||
        insight.description?.toLowerCase().includes('problema') ||
        insight.description?.toLowerCase().includes('dificuldade') ||
        insight.description?.toLowerCase().includes('resistência') ||
        insight.description?.toLowerCase().includes('preço') ||
        insight.description?.toLowerCase().includes('concorrência') ||
        insight.insight_type === 'objection' ||
        insight.insight_type === 'resistance'
      )
      .map((insight) => ({
        id: insight.id,
        title: insight.title || 'Objeção Identificada',
        description: insight.description,
        severity: insight.priority === 'high' ? 'alta' as const : 
                 insight.priority === 'low' ? 'baixa' as const : 'média' as const,
        category: getInsightCategory(insight.insight_type),
        firstDetected: insight.created_at,
        assistantName: getAssistantName(insight.insight_type),
        salesImpact: insight.sales_impact || 'medium'
      }));
  };

  const getInsightCategory = (type: string): string => {
    const categoryMap: { [key: string]: string } = {
      'conversion': 'Conversão',
      'behavioral': 'Comportamental',
      'objection': 'Objeções',
      'process': 'Processo',
      'performance': 'Performance',
      'sales': 'Vendas',
      'resistance': 'Resistência'
    };
    return categoryMap[type] || 'Comercial';
  };

  const getAssistantName = (type: string): string => {
    const assistantMap: { [key: string]: string } = {
      'conversion': 'Diretor Comercial',
      'behavioral': 'Head Comercial',
      'objection': 'Closer',
      'process': 'Gerente Comercial',
      'performance': 'Coordenador Comercial',
      'sales': 'Especialista em Vendas',
      'resistance': 'Consultor de Vendas'
    };
    return assistantMap[type] || 'Assistente Comercial';
  };

  const painPoints = extractPainPointsFromInsights();

  const severityColors = {
    'baixa': '#10B981',
    'média': '#F59E0B',
    'alta': '#EF4444'
  };

  const severityData = [
    { 
      name: 'Baixa', 
      value: painPoints.filter(p => p.severity === 'baixa').length, 
      color: '#10B981' 
    },
    { 
      name: 'Média', 
      value: painPoints.filter(p => p.severity === 'média').length, 
      color: '#F59E0B' 
    },
    { 
      name: 'Alta', 
      value: painPoints.filter(p => p.severity === 'alta').length, 
      color: '#EF4444' 
    }
  ];

  const categoryData = painPoints.reduce((acc, pain) => {
    const existing = acc.find(item => item.category === pain.category);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ category: pain.category, count: 1 });
    }
    return acc;
  }, [] as Array<{ category: string; count: number }>);

  const timelineData = painPoints.slice(0, 6).map((pain, index) => ({
    date: new Date(pain.firstDetected).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    total: index + 1,
    novas: 1,
    resolvidas: Math.floor(Math.random() * 2)
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Objeções e Resistências</h1>
          <p className="text-slate-600">Análise de objeções e pontos de resistência comercial</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (!data.hasRealData || painPoints.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Objeções e Resistências</h1>
          <p className="text-slate-600">Análise de objeções e pontos de resistência comercial</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertTriangle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Análise de Objeções Aguarda IA</h3>
              <p className="text-gray-500 max-w-md">
                As objeções e resistências serão identificadas após análises de conversas comerciais pela IA.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Execute análises IA de conversas comerciais</p>
                <p>• Os assistentes identificarão padrões de objeção</p>
                <p>• Estratégias de contorno serão sugeridas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Objeções e Resistências</h1>
        <p className="text-slate-600">Objeções identificadas pelos assistentes comerciais</p>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-red-50 text-red-700">
          🎯 Análise dos Assistentes Comerciais
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {painPoints.length} objeções identificadas
        </Badge>
      </div>
      
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Objeções</p>
                <p className="text-2xl font-bold text-gray-800">{painPoints.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Críticas</p>
                <p className="text-2xl font-bold text-red-600">
                  {painPoints.filter(p => p.severity === 'alta').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mais Frequente</p>
                <p className="text-lg font-bold text-gray-800">
                  {categoryData[0]?.category || 'N/A'}
                </p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categorias</p>
                <p className="text-2xl font-bold text-gray-800">{categoryData.length}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      {severityData.some(d => d.value > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Evolução Temporal</CardTitle>
              <CardDescription>Histórico de objeções identificadas</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="total" stroke="#EF4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="novas" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Severidade das Objeções</CardTitle>
              <CardDescription>Distribuição por criticidade</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {severityData.filter(d => d.value > 0).map((entry, index) => (
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
      )}

      {/* Lista de objeções */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Objeções Identificadas</CardTitle>
          <CardDescription>Análise detalhada das resistências encontradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {painPoints.map((pain) => (
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
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Categoria: {pain.category}</span>
                  <span>Identificado em: {new Date(pain.firstDetected).toLocaleDateString('pt-BR')}</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    🤖 {pain.assistantName}
                  </Badge>
                  <Badge variant="outline" className={
                    pain.salesImpact === 'high' ? 'bg-red-50 text-red-700' :
                    pain.salesImpact === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-green-50 text-green-700'
                  }>
                    Impacto: {pain.salesImpact === 'high' ? 'Alto' : pain.salesImpact === 'medium' ? 'Médio' : 'Baixo'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
