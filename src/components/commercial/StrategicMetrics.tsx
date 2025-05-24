
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function StrategicMetrics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Métricas Estratégicas</h1>
          <p className="text-slate-600">Visão executiva e projeções de crescimento</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>Dashboard executivo em breve</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta seção incluirá métricas estratégicas, forecast e análise de riscos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
