
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Target, Eye, Heart, Brain, TrendingUp } from 'lucide-react';

interface ConsciousnessMetricsProps {
  data: {
    clarityIndex: number;
    shadowIndex: number;
    coherenceLevel: string;
    meaningLevel: string;
    searchIntensity: string;
  };
}

export function ConsciousnessMetrics({ data }: ConsciousnessMetricsProps) {
  const getColorByLevel = (level: string) => {
    switch (level.toLowerCase()) {
      case 'alto': case 'intenso': return 'text-green-700 bg-green-50 border-green-200';
      case 'médio': case 'medio': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'baixo': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getIndexColor = (index: number, inverted = false) => {
    if (inverted) {
      if (index <= 30) return 'text-green-700';
      if (index <= 60) return 'text-yellow-700';
      return 'text-red-700';
    }
    
    if (index >= 70) return 'text-green-700';
    if (index >= 40) return 'text-yellow-700';
    return 'text-red-700';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Índice de Clareza Existencial */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Lightbulb className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Clareza Existencial</p>
              <p className={`text-xl font-bold ${getIndexColor(data.clarityIndex)}`}>
                {data.clarityIndex}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Índice de Sombra Ativa */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Brain className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sombra Ativa</p>
              <p className={`text-xl font-bold ${getIndexColor(data.shadowIndex, true)}`}>
                {data.shadowIndex}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coerência Interna */}
      <Card className={`bg-gradient-to-r border ${getColorByLevel(data.coherenceLevel)}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Coerência Interna</p>
              <p className="text-lg font-bold">{data.coherenceLevel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nível de Sentido */}
      <Card className={`bg-gradient-to-r border ${getColorByLevel(data.meaningLevel)}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Heart className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Conexão com Sentido</p>
              <p className="text-lg font-bold">{data.meaningLevel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Busca de Sentido */}
      <Card className={`bg-gradient-to-r border ${getColorByLevel(data.searchIntensity)}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Eye className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Busca de Sentido</p>
              <p className="text-lg font-bold">{data.searchIntensity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evolução Geral */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Evolução Geral</p>
              <p className={`text-lg font-bold ${getIndexColor((data.clarityIndex - data.shadowIndex + 100) / 2)}`}>
                {data.clarityIndex > data.shadowIndex ? 'Crescendo' : 'Em transição'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
