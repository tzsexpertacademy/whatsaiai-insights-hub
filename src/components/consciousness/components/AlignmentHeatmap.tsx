
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map } from 'lucide-react';

interface AlignmentHeatmapProps {
  alignmentMap: Record<string, number>;
}

export function AlignmentHeatmap({ alignmentMap }: AlignmentHeatmapProps) {
  const areas = [
    { key: 'trabalho', label: 'Trabalho', value: alignmentMap.trabalho || 0 },
    { key: 'relacionamentos', label: 'Relacionamentos', value: alignmentMap.relacionamentos || 0 },
    { key: 'saude', label: 'Saúde', value: alignmentMap.saude || 0 },
    { key: 'proposito', label: 'Propósito', value: alignmentMap.proposito || 0 },
    { key: 'financas', label: 'Finanças', value: alignmentMap.financas || 0 },
    { key: 'crescimento', label: 'Crescimento', value: alignmentMap.crescimento || 0 }
  ];

  const getAlignmentColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    if (value >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getAlignmentText = (value: number) => {
    if (value >= 80) return 'Alinhado';
    if (value >= 60) return 'Parcial';
    if (value >= 40) return 'Tenso';
    return 'Desalinhado';
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5 text-purple-600" />
          Mapa de Alinhamento
        </CardTitle>
        <p className="text-sm text-gray-600">
          Coerência entre propósito e áreas da vida
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {areas.map((area) => (
            <div key={area.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{area.label}</span>
                <span className="text-xs text-gray-500">{area.value}%</span>
              </div>
              
              {/* Barra de alinhamento */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${getAlignmentColor(area.value)} transition-all duration-1000`}
                  style={{ width: `${area.value}%` }}
                />
              </div>
              
              {/* Status textual */}
              <div className="text-xs text-center font-medium">
                {getAlignmentText(area.value)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Resumo geral */}
        <div className="mt-6 p-4 bg-white rounded-lg border">
          <h4 className="font-medium mb-2">Diagnóstico Geral</h4>
          <div className="text-sm text-gray-600 space-y-1">
            {areas.filter(a => a.value < 40).length > 0 && (
              <p className="text-red-600">
                🚨 {areas.filter(a => a.value < 40).length} área(s) com desalinhamento significativo
              </p>
            )}
            {areas.filter(a => a.value >= 80).length > 0 && (
              <p className="text-green-600">
                ✅ {areas.filter(a => a.value >= 80).length} área(s) bem alinhada(s) com propósito
              </p>
            )}
            <p className="text-gray-600">
              Alinhamento médio: {Math.round(areas.reduce((sum, a) => sum + a.value, 0) / areas.length)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
