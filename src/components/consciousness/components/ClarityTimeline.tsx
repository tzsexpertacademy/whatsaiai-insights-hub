
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ClarityTimelineProps {
  clarityIndex: number;
}

export function ClarityTimeline({ clarityIndex }: ClarityTimelineProps) {
  // Simular dados de timeline baseados no índice atual
  const timelineData = [
    { period: 'Há 30 dias', clarity: Math.max(0, clarityIndex - 25) },
    { period: 'Há 21 dias', clarity: Math.max(0, clarityIndex - 15) },
    { period: 'Há 14 dias', clarity: Math.max(0, clarityIndex - 10) },
    { period: 'Há 7 dias', clarity: Math.max(0, clarityIndex - 5) },
    { period: 'Hoje', clarity: clarityIndex }
  ];

  const trend = timelineData[timelineData.length - 1].clarity - timelineData[0].clarity;
  const isPositiveTrend = trend >= 0;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPositiveTrend ? (
            <TrendingUp className="h-5 w-5 text-green-600" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-600" />
          )}
          Linha do Tempo da Clareza
        </CardTitle>
        <p className="text-sm text-gray-600">
          Evolução da clareza existencial ao longo do tempo
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Gráfico de linha simplificado */}
          <div className="relative h-32 bg-white rounded-lg p-4 border">
            <svg className="w-full h-full">
              {/* Linha de base */}
              <line
                x1="10%"
                y1="90%"
                x2="90%"
                y2="90%"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              
              {/* Linha de clareza */}
              {timelineData.map((point, index) => {
                if (index === 0) return null;
                const prevPoint = timelineData[index - 1];
                const x1 = 10 + (index - 1) * 20;
                const y1 = 90 - (prevPoint.clarity * 0.7);
                const x2 = 10 + index * 20;
                const y2 = 90 - (point.clarity * 0.7);
                
                return (
                  <line
                    key={index}
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    stroke={isPositiveTrend ? "#10b981" : "#ef4444"}
                    strokeWidth="3"
                  />
                );
              })}
              
              {/* Pontos */}
              {timelineData.map((point, index) => (
                <circle
                  key={index}
                  cx={`${10 + index * 20}%`}
                  cy={`${90 - (point.clarity * 0.7)}%`}
                  r="4"
                  fill={isPositiveTrend ? "#10b981" : "#ef4444"}
                />
              ))}
            </svg>
          </div>
          
          {/* Detalhes dos pontos */}
          <div className="grid grid-cols-5 gap-2 text-xs">
            {timelineData.map((point, index) => (
              <div key={index} className="text-center">
                <div className="font-medium">{point.clarity}%</div>
                <div className="text-gray-500">{point.period}</div>
              </div>
            ))}
          </div>
          
          {/* Análise da tendência */}
          <div className={`p-3 rounded-lg ${isPositiveTrend ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
            <div className={`font-medium ${isPositiveTrend ? 'text-green-800' : 'text-red-800'}`}>
              {isPositiveTrend ? '📈 Tendência Positiva' : '📉 Tendência de Declínio'}
            </div>
            <div className={`text-sm ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveTrend 
                ? `Sua clareza aumentou ${Math.abs(trend)}% no último mês. Continue focado no que está funcionando.`
                : `Sua clareza diminuiu ${Math.abs(trend)}% no último mês. Momento de parar e refletir sobre possíveis causas.`
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
