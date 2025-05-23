
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from 'lucide-react';

const insights = [
  "Aumento na reflexão sobre propósito nas últimas 2 semanas",
  "Padrão de procrastinação detectado na área financeira",
  "Maior ansiedade em conversas sobre relacionamentos recentemente",
  "Queda na atenção à saúde física nos últimos 30 dias"
];

export function InsightsAlerts() {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle>Alertas e Insights</CardTitle>
        <CardDescription>Padrões e tendências detectados nas suas interações</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-slate-50">
              <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
              <p>{insight}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
