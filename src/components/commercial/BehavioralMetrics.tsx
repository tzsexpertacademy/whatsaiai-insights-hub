
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BehavioralMetrics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Métricas Comportamentais</h1>
          <p className="text-slate-600">Análise qualitativa da comunicação e abordagem</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>Análise de padrões de comunicação em breve</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta seção incluirá análise de sentiment, energia, assertividade e padrões de comunicação.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
