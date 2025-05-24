
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2 } from 'lucide-react';

export function EmotionalChart() {
  const { data, isLoading } = useAnalysisData();

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle>Termômetro Emocional</CardTitle>
        <CardDescription>Evolução do seu estado emocional na semana</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.emotionalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip labelFormatter={(value) => `${value}: ${data.emotionalData.find(item => item.name === value)?.emotion}`} />
              <Line type="monotone" dataKey="level" stroke="#8884d8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
