
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle } from 'lucide-react';

export function EmotionalThermometer() {
  const { data, isLoading } = useAnalysisData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Termômetro Emocional</h1>
          <p className="text-slate-600">Análise detalhada dos seus estados emocionais ao longo do tempo</p>
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
          <p className="text-slate-600">Análise detalhada dos seus estados emocionais ao longo do tempo</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Termômetro não calibrado</h3>
              <p className="text-gray-500 max-w-md">
                Para medir seu estado emocional, precisamos de dados das suas conversas analisadas pelos assistentes.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Crie conversas de teste ou conecte seu WhatsApp</p>
                <p>• Execute a análise por IA</p>
                <p>• Os assistentes irão mapear seus padrões emocionais</p>
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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Termômetro Emocional</h1>
        <p className="text-slate-600">Análise detalhada dos seus estados emocionais ao longo do tempo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Estado Emocional Semanal</CardTitle>
            <CardDescription>Evolução do seu humor diário esta semana</CardDescription>
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
                  dataKey="level" 
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
            <CardDescription>Análise do seu humor predominante</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-[300px]">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-blue-300 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-blue-700 mb-2">{data.emotionalState}</h3>
                    <p className="text-blue-600">{data.relationalAwareness}% estável</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
