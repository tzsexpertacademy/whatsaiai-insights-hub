
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const bigFiveData = [
  { name: 'Extroversão', value: 65 },
  { name: 'Abertura', value: 85 },
  { name: 'Neuroticismo', value: 45 },
  { name: 'Amabilidade', value: 70 },
  { name: 'Conscienciosidade', value: 75 },
];

const discData = [
  { name: 'Dominância', value: 55 },
  { name: 'Influência', value: 80 },
  { name: 'Estabilidade', value: 65 },
  { name: 'Conformidade', value: 70 },
];

const cognitivePatterns = [
  {
    pattern: "Pensamento Analítico",
    strength: "Forte",
    description: "Você demonstra excelente capacidade de análise crítica e decomposição de problemas complexos."
  },
  {
    pattern: "Criatividade",
    strength: "Muito Forte",
    description: "Sua mente apresenta alto grau de pensamento divergente, gerando ideias originais e soluções inovadoras."
  },
  {
    pattern: "Pensamento Sistemático",
    strength: "Moderado",
    description: "Você tem uma capacidade média de organizar informações em sistemas coerentes e hierarquizados."
  },
  {
    pattern: "Rigidez Cognitiva",
    strength: "Baixa",
    description: "Você demonstra boa flexibilidade mental, adaptando-se bem a novas informações e mudanças de contexto."
  },
  {
    pattern: "Auto-sabotagem",
    strength: "Baixa a Moderada",
    description: "Ocasionalmente você apresenta padrões de pensamento que limitam seu potencial ou criam obstáculos desnecessários."
  }
];

export function BehavioralProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Perfil Comportamental</h1>
        <p className="text-slate-600">Análise detalhada dos seus traços de personalidade e padrões cognitivos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Big Five Traits</CardTitle>
            <CardDescription>Modelo dos cinco grandes traços de personalidade</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                layout="vertical"
                data={bigFiveData}
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Perfil DISC</CardTitle>
            <CardDescription>Análise do comportamento observável</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                layout="vertical"
                data={discData}
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Tipo de Personalidade</CardTitle>
          <CardDescription>Aproximação ao sistema MBTI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-slate-50 p-6 rounded-xl">
              <h3 className="text-2xl font-bold text-center text-blue-700 mb-4">ENFP</h3>
              <p className="text-center mb-4">Inovador Entusiasta</p>
              <p className="text-sm text-slate-700">
                Você apresenta características predominantes de alguém criativo, idealista e sociável. 
                Suas interações revelam uma preferência por possibilidades futuras em vez de realidades concretas, 
                com decisões baseadas mais em valores pessoais do que em lógica pura, 
                e uma abordagem flexível e adaptável à vida.
              </p>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <span>Extroversão (E)</span>
                <span>Introversão (I)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-blue-600" style={{ width: "65%" }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Intuição (N)</span>
                <span>Sensação (S)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-blue-600" style={{ width: "80%" }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Sentimento (F)</span>
                <span>Pensamento (T)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-blue-600" style={{ width: "60%" }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Percepção (P)</span>
                <span>Julgamento (J)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-blue-600" style={{ width: "70%" }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Padrões Cognitivos</CardTitle>
          <CardDescription>Análise de estruturas de pensamento predominantes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cognitivePatterns.map((pattern, index) => (
              <div key={index} className="border-b border-slate-200 last:border-0 pb-4 last:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{pattern.pattern}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    pattern.strength.includes("Forte") ? "bg-green-100 text-green-800" :
                    pattern.strength.includes("Moderado") ? "bg-blue-100 text-blue-800" :
                    "bg-amber-100 text-amber-800"
                  }`}>
                    {pattern.strength}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{pattern.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
