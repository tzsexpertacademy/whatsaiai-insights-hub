
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TeamCulture() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Cultura do Time</h1>
          <p className="text-slate-600">Engajamento, motivação e bem-estar da equipe</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>Termômetro de cultura e engajamento em breve</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta seção incluirá análise de clima, burnout e desenvolvimento individual.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
