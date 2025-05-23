
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';

const weeklyEmotionalData = [
  { name: 'Seg', level: 75, primary: 'Confiante', secondary: 'Focado' },
  { name: 'Ter', level: 62, primary: 'Pensativo', secondary: 'Reflexivo' },
  { name: 'Qua', level: 48, primary: 'Ansioso', secondary: 'Preocupado' },
  { name: 'Qui', level: 70, primary: 'Motivado', secondary: 'Energético' },
  { name: 'Sex', level: 85, primary: 'Entusiasmado', secondary: 'Criativo' },
  { name: 'Sáb', level: 78, primary: 'Tranquilo', secondary: 'Relaxado' },
  { name: 'Dom', level: 65, primary: 'Contemplativo', secondary: 'Introspectivo' },
];

const monthlyEmotionalData = [
  { name: 'Semana 1', positive: 65, neutral: 25, negative: 10 },
  { name: 'Semana 2', positive: 55, neutral: 30, negative: 15 },
  { name: 'Semana 3', positive: 70, neutral: 20, negative: 10 },
  { name: 'Semana 4', positive: 75, neutral: 15, negative: 10 },
];

const emotionalPatterns = [
  { emotion: "Confiança", frequency: "Alta", context: "Discussões sobre projetos profissionais" },
  { emotion: "Ansiedade", frequency: "Moderada", context: "Conversas sobre prazos e compromissos" },
  { emotion: "Entusiasmo", frequency: "Alta", context: "Exploração de novas ideias e conceitos" },
  { emotion: "Reflexão", frequency: "Muito Alta", context: "Análise de desenvolvimento pessoal" },
  { emotion: "Frustração", frequency: "Baixa", context: "Obstáculos em objetivos financeiros" }
];

export function EmotionalThermometer() {
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
              <LineChart data={weeklyEmotionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, 'Nível de Bem-estar']}
                  labelFormatter={(day) => {
                    const data = weeklyEmotionalData.find(d => d.name === day);
                    return `${day}: ${data?.primary}, ${data?.secondary}`;
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
            <CardTitle>Balanço Emocional Mensal</CardTitle>
            <CardDescription>Proporção de estados emocionais positivos, neutros e negativos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={monthlyEmotionalData}
                stackOffset="expand"
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(tick) => `${tick * 100}%`} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Area type="monotone" dataKey="positive" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Positivo" />
                <Area type="monotone" dataKey="neutral" stackId="1" stroke="#8884d8" fill="#8884d8" name="Neutro" />
                <Area type="monotone" dataKey="negative" stackId="1" stroke="#ffc658" fill="#ffc658" name="Negativo" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Atual Estado Emocional</CardTitle>
          <CardDescription>Análise do seu humor predominante hoje</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 flex justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-blue-300 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-blue-700 mb-2">Confiante</h3>
                    <p className="text-blue-600">75% de bem-estar</p>
                  </div>
                </div>
                <div 
                  className="absolute bottom-0 h-3/4 w-4 bg-blue-600 rounded-b-full left-1/2 transform -translate-x-1/2"
                  style={{ height: '75%' }}
                ></div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-medium mb-4">Emoções Secundárias</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Focado</span>
                    <span>60%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-green-500" style={{ width: "60%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Criativo</span>
                    <span>55%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-purple-500" style={{ width: "55%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Ansioso</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-amber-500" style={{ width: "25%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Padrões Emocionais Recorrentes</CardTitle>
          <CardDescription>Estados emocionais mais frequentes e seus contextos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Emoção
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Frequência
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contexto Predominante
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {emotionalPatterns.map((pattern, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {pattern.emotion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pattern.frequency === 'Alta' || pattern.frequency === 'Muito Alta' ? 'bg-green-100 text-green-800' :
                        pattern.frequency === 'Moderada' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {pattern.frequency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {pattern.context}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
