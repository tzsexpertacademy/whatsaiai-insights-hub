
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle, AlertTriangle, TrendingUp, TrendingDown, Clock, Target, Brain, Heart } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface PainPoint {
  id: string;
  title: string;
  description: string;
  severity: 'baixa' | 'média' | 'alta' | 'crítica';
  category: string;
  firstDetected: string;
  lastDetected: string;
  frequency: number;
  trend: 'crescente' | 'estável' | 'decrescente';
  affectedAreas: string[];
}

export function PainPointsAnalysis() {
  const { data, isLoading } = useAnalysisData();

  // Dados mockados para demonstração - serão substituídos pela IA
  const mockPainPoints: PainPoint[] = [
    {
      id: '1',
      title: 'Ansiedade em Relacionamentos',
      description: 'Padrão recorrente de ansiedade em situações sociais e relacionamentos íntimos',
      severity: 'alta',
      category: 'Emocional',
      firstDetected: '2024-01-15',
      lastDetected: '2024-01-20',
      frequency: 8,
      trend: 'crescente',
      affectedAreas: ['Relacionamentos', 'Autoestima', 'Social']
    },
    {
      id: '2',
      title: 'Procrastinação Profissional',
      description: 'Dificuldade em iniciar e concluir tarefas importantes no trabalho',
      severity: 'média',
      category: 'Comportamental',
      firstDetected: '2024-01-10',
      lastDetected: '2024-01-18',
      frequency: 12,
      trend: 'estável',
      affectedAreas: ['Carreira', 'Produtividade', 'Autoestima']
    },
    {
      id: '3',
      title: 'Insegurança Financeira',
      description: 'Preocupações constantes sobre estabilidade financeira e futuro',
      severity: 'alta',
      category: 'Financeiro',
      firstDetected: '2024-01-05',
      lastDetected: '2024-01-19',
      frequency: 15,
      trend: 'crescente',
      affectedAreas: ['Financeiro', 'Sono', 'Ansiedade']
    }
  ];

  const severityColors = {
    'baixa': '#10B981',
    'média': '#F59E0B',
    'alta': '#EF4444',
    'crítica': '#7C2D12'
  };

  const severityData = [
    { name: 'Baixa', value: 2, color: '#10B981' },
    { name: 'Média', value: 5, color: '#F59E0B' },
    { name: 'Alta', value: 8, color: '#EF4444' },
    { name: 'Crítica', value: 1, color: '#7C2D12' }
  ];

  const categoryData = [
    { category: 'Emocional', count: 6, trend: 2 },
    { category: 'Comportamental', count: 4, trend: -1 },
    { category: 'Financeiro', count: 3, trend: 1 },
    { category: 'Relacionamentos', count: 5, trend: 3 },
    { category: 'Carreira', count: 2, trend: 0 }
  ];

  const timelineData = [
    { date: '15/01', total: 8, novas: 2, resolvidas: 1 },
    { date: '16/01', total: 9, novas: 2, resolvidas: 1 },
    { date: '17/01', total: 11, novas: 3, resolvidas: 1 },
    { date: '18/01', total: 13, novas: 4, resolvidas: 2 },
    { date: '19/01', total: 16, novas: 5, resolvidas: 2 },
    { date: '20/01', total: 18, novas: 3, resolvidas: 1 }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dores do Cliente</h1>
          <p className="text-slate-600">Identificação e análise das principais dores detectadas pela IA</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (!data.hasRealData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dores do Cliente</h1>
          <p className="text-slate-600">Identificação e análise das principais dores detectadas pela IA</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertTriangle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Análise de Dores Aguarda IA</h3>
              <p className="text-gray-500 max-w-md">
                As dores e pontos críticos serão identificados automaticamente após análises de conversas pela IA.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Execute análises por IA no dashboard</p>
                <p>• A IA identificará padrões problemáticos</p>
                <p>• Histórico de evolução será mapeado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview com dados mockados */}
        <div className="space-y-6 opacity-60">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Preview - Dados de Demonstração
            </Badge>
          </div>
          
          {/* Métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Dores</p>
                    <p className="text-2xl font-bold text-gray-800">16</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Dores Críticas</p>
                    <p className="text-2xl font-bold text-red-600">3</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tendência</p>
                    <p className="text-2xl font-bold text-red-600">+5</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Resolvidas</p>
                    <p className="text-2xl font-bold text-green-600">7</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle>Evolução Temporal</CardTitle>
                <CardDescription>Histórico de dores identificadas ao longo do tempo</CardDescription>
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
                <CardTitle>Severidade das Dores</CardTitle>
                <CardDescription>Distribuição por nível de criticidade</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {severityData.map((entry, index) => (
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

          {/* Lista de dores */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>Principais Dores Identificadas</CardTitle>
              <CardDescription>Dores detectadas pela análise de IA das conversas</CardDescription>
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
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Categoria: {pain.category}</span>
                      <span>Frequência: {pain.frequency}x</span>
                      <span>Última detecção: {new Date(pain.lastDetected).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {pain.affectedAreas.map((area, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Dados reais da IA serão exibidos aqui quando disponíveis
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dores do Cliente</h1>
        <p className="text-slate-600">Análise em tempo real das dores identificadas pela IA</p>
      </div>
      
      {/* Implementação futura com dados reais da IA */}
    </div>
  );
}
