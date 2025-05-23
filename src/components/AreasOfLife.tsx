
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const lifeAreasData = [
  { name: 'Profissional', value: 80 },
  { name: 'Financeiro', value: 65 },
  { name: 'Relacionamentos', value: 70 },
  { name: 'Saúde Física', value: 55 },
  { name: 'Saúde Mental', value: 75 },
  { name: 'Espiritualidade', value: 60 },
  { name: 'Crescimento Pessoal', value: 85 },
];

const radarData = [
  { subject: 'Profissional', A: 80, fullMark: 100 },
  { subject: 'Financeiro', A: 65, fullMark: 100 },
  { subject: 'Relacionamentos', A: 70, fullMark: 100 },
  { subject: 'Saúde Física', A: 55, fullMark: 100 },
  { subject: 'Saúde Mental', A: 75, fullMark: 100 },
  { subject: 'Espiritualidade', A: 60, fullMark: 100 },
  { subject: 'Crescimento Pessoal', A: 85, fullMark: 100 },
];

const timeSpentData = [
  { name: 'Profissional', hours: 38 },
  { name: 'Financeiro', hours: 12 },
  { name: 'Relacionamentos', hours: 22 },
  { name: 'Saúde Física', hours: 8 },
  { name: 'Saúde Mental', hours: 14 },
  { name: 'Espiritualidade', hours: 6 },
  { name: 'Crescimento Pessoal', hours: 18 },
];

export function AreasOfLife() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Áreas da Vida</h1>
        <p className="text-slate-600">Análise detalhada do seu foco em cada dimensão vital</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Distribuição de Atenção</CardTitle>
            <CardDescription>Percentual de foco em cada área da vida</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={lifeAreasData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {lifeAreasData.map((entry, index) => (
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
            <CardTitle>Equilíbrio de Vida</CardTitle>
            <CardDescription>Análise comparativa do desenvolvimento em cada área</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Seu Perfil" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento das áreas */}
      <div className="grid grid-cols-1 gap-6">
        {lifeAreasData.map((area, index) => (
          <Card key={index} className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle>{area.name}</CardTitle>
              <CardDescription>
                {area.value >= 80 ? 'Área de excelência' : 
                 area.value >= 65 ? 'Área bem desenvolvida' : 
                 area.value >= 50 ? 'Área em desenvolvimento' : 'Área que precisa de atenção'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span>Nível atual:</span>
                  <span className="font-bold">{area.value}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full" 
                    style={{ 
                      width: `${area.value}%`, 
                      backgroundColor: COLORS[index % COLORS.length] 
                    }}
                  ></div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-slate-600">
                    Tempo dedicado na última semana: {timeSpentData[index].hours} horas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
