
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle, Bot, Clock, TrendingUp } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export function AreasOfLife() {
  const { data, isLoading } = useAnalysisData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Áreas da Vida</h1>
          <p className="text-slate-600">Análise detalhada baseada nos insights dos assistentes</p>
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Áreas da Vida</h1>
          <p className="text-slate-600">Análise detalhada baseada nos insights dos assistentes</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Aguardando Análise dos Assistentes</h3>
              <p className="text-gray-500 max-w-md">
                As áreas da vida serão mapeadas pelos assistentes após análise das conversas.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Execute a análise por IA no dashboard</p>
                <p>• Os assistentes mapearão cada área da vida</p>
                <p>• Dados serão atualizados automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lastUpdate = data.metrics.lastAnalysis ? 
    new Date(data.metrics.lastAnalysis).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : null;

  // Agrupar insights por área dos assistentes
  const insightsByArea = data.insightsWithAssistant.reduce((acc, insight) => {
    const area = insight.assistantArea || 'geral';
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Áreas da Vida</h1>
        <p className="text-slate-600">Mapeamento baseado na análise dos assistentes especializados</p>
      </div>

      {/* Indicadores dos assistentes */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          🔮 Análise dos Assistentes
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          📊 {data.insightsWithAssistant.length} insights analisados
        </Badge>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          🎯 {Object.keys(insightsByArea).length} áreas mapeadas
        </Badge>
        {lastUpdate && (
          <Badge variant="outline" className="bg-gray-50 text-gray-700">
            <Clock className="h-3 w-3 mr-1" />
            Última análise: {lastUpdate}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Distribuição de Insights por Área</CardTitle>
            <CardDescription>Baseado na análise dos assistentes especializados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.lifeAreasData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="A"
                    label={({ subject, A }) => A > 0 ? `${subject}: ${A}%` : ''}
                  >
                    {data.lifeAreasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Radar das Áreas de Vida</CardTitle>
            <CardDescription>Análise comparativa dos assistentes especializados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.lifeAreasData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Análise IA" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento com assistentes */}
      <div className="grid grid-cols-1 gap-6">
        {data.lifeAreas.map((area, index) => {
          const assistantInsights = data.insightsWithAssistant.filter(insight => 
            insight.assistantArea === area.name.toLowerCase() || 
            (area.name === 'Carreira' && insight.assistantArea === 'estrategia') ||
            (area.name === 'Saúde' && insight.assistantArea === 'saude') ||
            (area.name === 'Finanças' && insight.assistantArea === 'financeiro') ||
            (area.name === 'Desenvolvimento' && insight.assistantArea === 'proposito')
          );

          return (
            <Card key={index} className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {area.name}
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardTitle>
                    <CardDescription>
                      {area.score >= 80 ? 'Área de excelência' : 
                       area.score >= 65 ? 'Área bem desenvolvida' : 
                       area.score >= 50 ? 'Área em desenvolvimento' : 
                       area.score > 0 ? 'Área que precisa de atenção' : 'Sem dados disponíveis'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {assistantInsights.length} insights
                    </Badge>
                    {assistantInsights.length > 0 && (
                      <Badge className="bg-purple-100 text-purple-800">
                        🔮 {assistantInsights[0].assistantName}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span>Nível atual (por assistentes IA):</span>
                    <span className="font-bold">{area.score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{ 
                        width: `${area.score}%`, 
                        backgroundColor: COLORS[index % COLORS.length] 
                      }}
                    ></div>
                  </div>
                  
                  {assistantInsights.length > 0 && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                      <h5 className="text-sm font-medium text-purple-800 mb-2">
                        Últimos insights dos assistentes:
                      </h5>
                      {assistantInsights.slice(0, 2).map(insight => (
                        <div key={insight.id} className="text-xs text-purple-700 mb-1">
                          • {insight.title} ({insight.assistantName})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
