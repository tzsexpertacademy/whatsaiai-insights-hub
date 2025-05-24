
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2, AlertCircle } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function InsightsAlerts() {
  const { data, isLoading } = useAnalysisData();

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle>Alertas e Insights</CardTitle>
        <CardDescription>Padrões e tendências detectados nas suas interações</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : !data.hasRealData || data.insights.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Nenhum insight disponível ainda.
                <br />
                Crie conversas de teste e execute a análise por IA.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {data.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-slate-50">
                <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
                <p>{insight}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
