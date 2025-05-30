
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

export function EmotionalChart() {
  const { data, isLoading } = useAnalysisData();

  // Gerar dados do gráfico baseado nos insights emocionais REAIS
  const emotionalInsights = data.insightsWithAssistant?.filter(insight => 
    insight.insight_type === 'emotional' || 
    insight.assistantArea === 'psicologia' ||
    insight.description.toLowerCase().includes('emocional') ||
    insight.description.toLowerCase().includes('sentimento')
  ) || [];

  // Criar dados do gráfico temporal baseado em insights reais
  const chartData = emotionalInsights
    .slice(0, 7) // Últimos 7 insights
    .reverse()
    .map((insight, index) => {
      const date = new Date(insight.createdAt);
      
      // Calcular nível emocional baseado no tipo de insight e conteúdo
      let emotionalLevel = 50; // Base neutra
      
      const description = insight.description.toLowerCase();
      
      // Palavras positivas aumentam o nível
      if (description.includes('feliz') || description.includes('alegria') || 
          description.includes('otimist') || description.includes('esperanç')) {
        emotionalLevel += 30;
      }
      
      // Palavras neutras mantêm o nível
      if (description.includes('equilibr') || description.includes('estável') ||
          description.includes('calm') || description.includes('sereno')) {
        emotionalLevel += 10;
      }
      
      // Palavras negativas diminuem o nível
      if (description.includes('triste') || description.includes('ansied') ||
          description.includes('estress') || description.includes('preocup')) {
        emotionalLevel -= 20;
      }
      
      // Garantir que fique entre 0 e 100
      emotionalLevel = Math.max(0, Math.min(100, emotionalLevel));

      return {
        name: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        level: emotionalLevel,
        assistant: insight.assistantName,
        insight: insight.title,
        time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
    });

  // Se não há dados suficientes, mostrar estado vazio
  if (chartData.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Termômetro Emocional</CardTitle>
          <CardDescription>Evolução do seu estado emocional baseado em análises da IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aguardando análises emocionais dos assistentes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle>Termômetro Emocional</CardTitle>
        <CardDescription>
          Evolução baseada em {chartData.length} análises reais dos assistentes especializados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="emotionalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis 
                dataKey="name" 
                stroke="#6366f1"
                fontSize={12}
              />
              <YAxis 
                domain={[0, 100]} 
                stroke="#6366f1"
                fontSize={12}
              />
              <Tooltip 
                labelFormatter={(label) => `Data: ${label}`}
                formatter={(value, name, props) => [
                  `${value}%`,
                  'Nível Emocional',
                  <div key="details" className="text-xs mt-1">
                    <p><strong>Assistente:</strong> {props.payload.assistant}</p>
                    <p><strong>Insight:</strong> {props.payload.insight}</p>
                    <p><strong>Horário:</strong> {props.payload.time}</p>
                  </div>
                ]}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e0e7ff',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="level" 
                stroke="#8884d8" 
                strokeWidth={3}
                fill="url(#emotionalGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
        
        {/* Resumo dos dados */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Resumo da Análise Emocional</h4>
          <div className="grid grid-cols-2 gap-4 text-xs text-blue-600">
            <div>
              <p><strong>Análises processadas:</strong> {chartData.length}</p>
              <p><strong>Período:</strong> Últimas análises</p>
            </div>
            <div>
              <p><strong>Nível atual:</strong> {chartData[chartData.length - 1]?.level || 0}%</p>
              <p><strong>Último assistente:</strong> {chartData[chartData.length - 1]?.assistant || 'N/A'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
