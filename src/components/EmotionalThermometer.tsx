
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle, Bot, Clock } from 'lucide-react';

export function EmotionalThermometer() {
  const { data, isLoading } = useAnalysisData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Termômetro Emocional</h1>
          <p className="text-slate-600">Análise detalhada dos seus estados emocionais gerada pelos assistentes</p>
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Termômetro Emocional</h1>
          <p className="text-slate-600">Análise detalhada dos seus estados emocionais gerada pelos assistentes</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Termômetro não calibrado</h3>
              <p className="text-gray-500 max-w-md">
                Para medir seu estado emocional, os assistentes precisam analisar suas conversas.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Execute a análise por IA no dashboard</p>
                <p>• Os assistentes irão mapear seus padrões emocionais</p>
                <p>• Dados serão atualizados automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrar insights emocionais dos assistentes
  const emotionalInsights = data.insightsWithAssistant.filter(insight => 
    insight.insight_type === 'emotional' || insight.assistantArea === 'psicologia'
  );

  const lastUpdate = data.metrics.lastAnalysis ? 
    new Date(data.metrics.lastAnalysis).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Termômetro Emocional</h1>
        <p className="text-slate-600">Estados emocionais identificados pelos assistentes especializados</p>
      </div>

      {/* Indicadores dos assistentes */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          🔮 Análise dos Assistentes
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          📊 {emotionalInsights.length} padrões emocionais detectados
        </Badge>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          🤖 {data.metrics.assistantsActive} assistentes ativos
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
            <CardTitle>Estado Emocional Semanal</CardTitle>
            <CardDescription>Evolução baseada na análise dos assistentes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.emotionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, 'Nível de Bem-estar']}
                  labelFormatter={(day) => {
                    const dayData = data.emotionalData.find(d => d.name === day);
                    return `${day}: ${dayData?.emotion}`;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={3}
                  dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Estado Emocional Atual</CardTitle>
            <CardDescription>Análise dos assistentes especializados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-[300px]">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-blue-300 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-blue-700 mb-2">{data.emotionalState}</h3>
                    <p className="text-blue-600">{data.relationalAwareness}% estável</p>
                    <div className="mt-3 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-xs text-blue-500">Por assistentes IA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights emocionais dos assistentes */}
      {emotionalInsights.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Insights Emocionais dos Assistentes</CardTitle>
            <CardDescription>Padrões identificados pelos assistentes especializados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emotionalInsights.slice(0, 3).map((insight, index) => (
                <div key={insight.id} className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-800">{insight.title}</h4>
                    <Badge className="bg-purple-100 text-purple-800">
                      🔮 {insight.assistantName}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Área: {insight.assistantArea}</span>
                    <span>{new Date(insight.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
