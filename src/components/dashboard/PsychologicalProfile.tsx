
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const psychProfileData = [
  { name: 'Extroversão', value: 65 },
  { name: 'Abertura', value: 85 },
  { name: 'Neuroticismo', value: 45 },
  { name: 'Amabilidade', value: 70 },
  { name: 'Conscienciosidade', value: 75 },
];

export function PsychologicalProfile() {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle>Perfil Psicológico (Big Five)</CardTitle>
        <CardDescription>Análise de traços de personalidade predominantes</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            layout="vertical"
            data={psychProfileData}
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
  );
}
