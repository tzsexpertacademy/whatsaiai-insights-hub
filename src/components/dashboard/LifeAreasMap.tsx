
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

const lifeAreasData = [
  { subject: 'Profissional', A: 80, fullMark: 100 },
  { subject: 'Financeiro', A: 65, fullMark: 100 },
  { subject: 'Relacionamentos', A: 70, fullMark: 100 },
  { subject: 'Saúde Física', A: 55, fullMark: 100 },
  { subject: 'Saúde Mental', A: 75, fullMark: 100 },
  { subject: 'Espiritualidade', A: 60, fullMark: 100 },
  { subject: 'Crescimento Pessoal', A: 85, fullMark: 100 },
];

export function LifeAreasMap() {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle>Mapa das Áreas da Vida</CardTitle>
        <CardDescription>Distribuição de atenção aos aspectos fundamentais</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={lifeAreasData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Você" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
