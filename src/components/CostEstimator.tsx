
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCacheManager } from '@/hooks/useCacheManager';
import { TrendingUp, TrendingDown, DollarSign, Database, Clock, Zap, BarChart3, Activity } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export function CostEstimator() {
  const { getCostStats, getAnalysisHistory } = useCacheManager();
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, historyData] = await Promise.all([
        getCostStats(selectedPeriod),
        getAnalysisHistory(20)
      ]);
      
      setStats(statsData);
      setHistory(historyData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Controle de Custos e Performance
          </CardTitle>
          <CardDescription>
            Monitoramento de uso e otimização de análises por IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma análise realizada ainda</h3>
            <p className="text-gray-600">
              Execute sua primeira análise por IA para ver as estatísticas de custo e performance
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados do gráfico de evolução diária
  const dailyChartData = (stats.dailyData || [])
    .slice(-14) // Últimos 14 dias
    .reverse()
    .map(day => ({
      data: new Date(day.analysis_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      analises: day.total_analyses || 0,
      custo: parseFloat(day.total_cost_estimate || '0'),
      cacheHits: day.cache_hits || 0,
      cacheMiss: day.cache_miss || 0,
      insights: day.insights_generated || 0
    }));

  // Dados do gráfico de eficiência do cache
  const cacheData = [
    { name: 'Cache Hit', value: stats.cacheHits, color: '#10B981' },
    { name: 'Cache Miss', value: stats.cacheMiss, color: '#EF4444' }
  ];

  // Estatísticas dos últimos 7 dias vs período anterior
  const last7Days = (stats.dailyData || []).slice(0, 7);
  const previous7Days = (stats.dailyData || []).slice(7, 14);
  
  const last7DaysTotal = last7Days.reduce((sum, day) => sum + (day.total_analyses || 0), 0);
  const previous7DaysTotal = previous7Days.reduce((sum, day) => sum + (day.total_analyses || 0), 0);
  const weeklyTrend = previous7DaysTotal > 0 ? ((last7DaysTotal - previous7DaysTotal) / previous7DaysTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header com filtros de período */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Controle de Custos e Performance
              </CardTitle>
              <CardDescription>
                Monitoramento inteligente de uso e otimização de análises por IA
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {[7, 15, 30, 60].map(days => (
                <button
                  key={days}
                  onClick={() => setSelectedPeriod(days)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === days
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-green-600 hover:bg-green-50'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Análises */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total de Análises</p>
                <p className="text-2xl font-bold text-blue-800">{stats.totalAnalyses}</p>
                <div className="flex items-center gap-1 mt-1">
                  {weeklyTrend >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${weeklyTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(weeklyTrend).toFixed(1)}% vs semana anterior
                  </span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Custo Total */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Custo Estimado</p>
                <p className="text-2xl font-bold text-green-800">
                  ${stats.totalCost.toFixed(4)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ~${(stats.totalCost / Math.max(stats.totalAnalyses, 1)).toFixed(4)} por análise
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Eficiência do Cache */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Eficiência do Cache</p>
                <p className="text-2xl font-bold text-purple-800">{stats.cacheEfficiency}%</p>
                <p className="text-xs text-purple-600 mt-1">
                  {stats.cacheHits} hits / {stats.cacheMiss} miss
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        {/* Insights Gerados */}
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Insights Gerados</p>
                <p className="text-2xl font-bold text-orange-800">{stats.totalInsights}</p>
                <p className="text-xs text-orange-600 mt-1">
                  {(stats.totalInsights / Math.max(stats.totalAnalyses, 1)).toFixed(1)} por análise
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Diária */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700">
              Evolução Diária (Últimos 14 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="data" fontSize={10} />
                  <YAxis fontSize={10} />
                  <ChartTooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-medium">{label}</p>
                            <p className="text-sm">Análises: {data.analises}</p>
                            <p className="text-sm">Custo: ${data.custo.toFixed(4)}</p>
                            <p className="text-sm">Cache Hits: {data.cacheHits}</p>
                            <p className="text-sm">Insights: {data.insights}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="analises" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    dot={{ fill: '#3B82F6', r: 3 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="insights" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    dot={{ fill: '#10B981', r: 3 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Eficiência do Cache */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700">
              Distribuição Cache vs Nova Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cacheData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    fontSize={12}
                  >
                    {cacheData.map((entry, index) => (
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

      {/* Histórico de Análises */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Histórico Recente de Análises
          </CardTitle>
          <CardDescription>
            Últimas {history.length} análises realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.length > 0 ? (
              history.map((analysis, index) => {
                const date = new Date(analysis.created_at);
                const timeAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
                
                return (
                  <div key={analysis.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">{analysis.analysis_type}</span>
                        <Badge variant="outline" className="text-xs">
                          {analysis.insights_generated} insights
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {analysis.summary_content}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500 ml-4">
                      <p>{date.toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs">
                        {timeAgo < 1 ? 'Agora' : `${timeAgo}h atrás`}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">Nenhum histórico de análise encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Economia */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Resumo de Otimização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-green-700">💰 Economia com Cache</p>
              <p className="text-green-600">
                ~${((stats.cacheHits * 0.01) || 0).toFixed(4)} economizados
              </p>
              <p className="text-xs text-green-500 mt-1">
                {stats.cacheHits} análises reutilizadas
              </p>
            </div>
            <div>
              <p className="font-medium text-green-700">⚡ Eficiência Operacional</p>
              <p className="text-green-600">
                {stats.cacheEfficiency}% de reutilização
              </p>
              <p className="text-xs text-green-500 mt-1">
                Redução significativa de custos OpenAI
              </p>
            </div>
            <div>
              <p className="font-medium text-green-700">📊 Produtividade</p>
              <p className="text-green-600">
                {(stats.totalInsights / Math.max(stats.totalAnalyses, 1)).toFixed(1)} insights/análise
              </p>
              <p className="text-xs text-green-500 mt-1">
                Alto aproveitamento dos dados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
