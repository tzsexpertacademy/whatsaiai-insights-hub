
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle, TrendingUp, Calendar, Brain, Heart, Target, Award, Sparkles, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";

export function ObservatoryTimeline() {
  const { data, isLoading } = useAnalysisData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Linha do Tempo da Evolução</h1>
          <p className="text-slate-600">Acompanhe sua jornada de autoconhecimento e crescimento pessoal</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  // Só mostra dados quando realmente alimentado pela IA
  if (!data.hasRealData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Linha do Tempo da Evolução</h1>
          <p className="text-slate-600">Acompanhe sua jornada de autoconhecimento e crescimento pessoal</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Linha do Tempo Aguarda Análise IA</h3>
              <p className="text-gray-500 max-w-md">
                Sua evolução pessoal será mapeada após análises de conversas reais pela IA.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Execute análises por IA no dashboard principal</p>
                <p>• A IA identificará padrões de crescimento</p>
                <p>• Marcos de evolução serão mapeados automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Este código só executa quando há dados reais da IA
  // Aqui virão os gráficos e dados reais processados pela IA
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Linha do Tempo da Evolução</h1>
        <p className="text-slate-600">Evolução baseada em análise real da IA</p>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <Sparkles className="h-16 w-16 text-purple-500" />
            <h3 className="text-xl font-semibold text-purple-600">Timeline Inteligente Ativa</h3>
            <p className="text-gray-600 max-w-md">
              Dados reais de evolução processados pela IA serão exibidos aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
