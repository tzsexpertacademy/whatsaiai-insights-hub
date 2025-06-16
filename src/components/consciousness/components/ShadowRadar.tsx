
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from 'lucide-react';

interface ShadowRadarProps {
  shadowIndex: number;
}

export function ShadowRadar({ shadowIndex }: ShadowRadarProps) {
  // Simular dados de sombras específicas baseados no índice geral
  const shadowData = {
    medo: Math.max(0, shadowIndex - 10),
    procrastinacao: shadowIndex,
    autosabotagem: Math.max(0, shadowIndex - 15),
    desalinhamento: Math.max(0, shadowIndex - 5),
    contradicao: Math.max(0, shadowIndex - 20),
    fuga: shadowIndex + 5
  };

  const maxValue = 100;
  const centerX = 120;
  const centerY = 120;
  const radius = 80;

  const points = Object.entries(shadowData).map(([key, value], index) => {
    const angle = (index * 60 - 90) * (Math.PI / 180); // 6 pontos, 60° cada
    const normalizedValue = Math.min(value, maxValue) / maxValue;
    const x = centerX + radius * normalizedValue * Math.cos(angle);
    const y = centerY + radius * normalizedValue * Math.sin(angle);
    return { x, y, value, label: key };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';

  return (
    <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-red-600" />
          Radar de Sombras Ativas
        </CardTitle>
        <p className="text-sm text-gray-600">
          Padrões de fuga, contradição e desalinhamento detectados
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <svg width="240" height="240" className="mb-4">
            {/* Círculos de referência */}
            {[20, 40, 60, 80].map(r => (
              <circle
                key={r}
                cx={centerX}
                cy={centerY}
                r={r}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
                opacity="0.5"
              />
            ))}
            
            {/* Linhas dos eixos */}
            {Object.keys(shadowData).map((_, index) => {
              const angle = (index * 60 - 90) * (Math.PI / 180);
              const endX = centerX + radius * Math.cos(angle);
              const endY = centerY + radius * Math.sin(angle);
              return (
                <line
                  key={index}
                  x1={centerX}
                  y1={centerY}
                  x2={endX}
                  y2={endY}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  opacity="0.5"
                />
              );
            })}
            
            {/* Área preenchida */}
            <path
              d={pathData}
              fill="rgba(239, 68, 68, 0.2)"
              stroke="rgb(239, 68, 68)"
              strokeWidth="2"
            />
            
            {/* Pontos */}
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="rgb(239, 68, 68)"
              />
            ))}
            
            {/* Labels */}
            {Object.keys(shadowData).map((label, index) => {
              const angle = (index * 60 - 90) * (Math.PI / 180);
              const labelX = centerX + (radius + 25) * Math.cos(angle);
              const labelY = centerY + (radius + 25) * Math.sin(angle);
              return (
                <text
                  key={label}
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium fill-gray-700"
                >
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </text>
              );
            })}
          </svg>
          
          {/* Legenda */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(shadowData).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="capitalize">{key}: {value}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
