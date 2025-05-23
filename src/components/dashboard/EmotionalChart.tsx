
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const emotionalData = [
  { name: 'Seg', level: 75, emotion: 'Confiante' },
  { name: 'Ter', level: 62, emotion: 'Reflexivo' },
  { name: 'Qua', level: 48, emotion: 'Ansioso' },
  { name: 'Qui', level: 70, emotion: 'Motivado' },
  { name: 'Sex', level: 85, emotion: 'Entusiasmado' },
  { name: 'Sáb', level: 78, emotion: 'Tranquilo' },
  { name: 'Dom', level: 65, emotion: 'Contemplativo' },
];

export function EmotionalChart() {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle>Termômetro Emocional</CardTitle>
        <CardDescription>Evolução do seu estado emocional na semana</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={emotionalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip labelFormatter={(value) => `${value}: ${emotionalData.find(item => item.name === value)?.emotion}`} />
            <Line type="monotone" dataKey="level" stroke="#8884d8" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
