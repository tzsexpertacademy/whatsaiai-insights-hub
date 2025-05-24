
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Heart, Timer, BarChart3, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Badge } from "@/components/ui/badge";

export function MetricCards() {
  const { data, isLoading } = useAnalysisData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-gradient-to-br from-gray-200 to-gray-300 border-0">
            <CardContent className="p-6 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data.hasRealData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-gray-300 to-gray-400 text-white border-0 opacity-60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm">Perfil Psicológico</p>
                <p className="text-3xl font-bold">--</p>
                <p className="text-gray-100 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  Sem dados
                </p>
              </div>
              <Brain className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-300 to-gray-400 text-white border-0 opacity-60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm">Estado Emocional</p>
                <p className="text-3xl font-bold">--</p>
                <p className="text-gray-100 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  Sem dados
                </p>
              </div>
              <Heart className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-300 to-gray-400 text-white border-0 opacity-60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm">Foco Principal</p>
                <p className="text-3xl font-bold">--</p>
                <p className="text-gray-100 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  Sem dados
                </p>
              </div>
              <Timer className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-300 to-gray-400 text-white border-0 opacity-60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm">Consciência Relacional</p>
                <p className="text-3xl font-bold">0%</p>
                <p className="text-gray-100 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  Sem dados
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Perfil Psicológico</p>
              <p className="text-3xl font-bold">{data.psychologicalProfile}</p>
              <p className="text-blue-100 text-sm flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                Evolução positiva
              </p>
            </div>
            <Brain className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Estado Emocional</p>
              <p className="text-3xl font-bold">{data.emotionalState}</p>
              <p className="text-green-100 text-sm flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                Mais estável que ontem
              </p>
            </div>
            <Heart className="h-8 w-8 text-green-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Foco Principal</p>
              <p className="text-3xl font-bold">{data.mainFocus}</p>
              <p className="text-purple-100 text-sm flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +18% este mês
              </p>
            </div>
            <Timer className="h-8 w-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Consciência Relacional</p>
              <p className="text-3xl font-bold">{data.relationalAwareness}%</p>
              <p className="text-orange-100 text-sm flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +8% este mês
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
