
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer } from 'lucide-react';

interface PurposeThermometerProps {
  meaningLevel: string;
}

export function PurposeThermometer({ meaningLevel }: PurposeThermometerProps) {
  const getMeaningValue = (level: string) => {
    switch (level.toLowerCase()) {
      case 'alto': return 85;
      case 'médio': case 'medio': return 55;
      case 'baixo': return 25;
      default: return 0;
    }
  };

  const value = getMeaningValue(meaningLevel);
  
  const getColor = (val: number) => {
    if (val >= 70) return { bg: 'bg-green-500', text: 'text-green-700' };
    if (val >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-700' };
    return { bg: 'bg-red-500', text: 'text-red-700' };
  };

  const colors = getColor(value);

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-blue-600" />
          Termômetro de Sentido
        </CardTitle>
        <p className="text-sm text-gray-600">
          Conexão atual com propósito e significado
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Termômetro Background */}
            <div className="w-16 h-64 bg-gray-200 rounded-full relative overflow-hidden">
              {/* Preenchimento */}
              <div 
                className={`absolute bottom-0 w-full ${colors.bg} transition-all duration-1000 rounded-full`}
                style={{ height: `${value}%` }}
              />
              
              {/* Marcações */}
              {[0, 25, 50, 75, 100].map(mark => (
                <div
                  key={mark}
                  className="absolute right-[-20px] w-4 h-0.5 bg-gray-400"
                  style={{ bottom: `${mark}%` }}
                />
              ))}
            </div>
            
            {/* Bulbo do termômetro */}
            <div className={`absolute bottom-[-8px] left-2 w-12 h-12 ${colors.bg} rounded-full border-4 border-white shadow-lg`} />
            
            {/* Labels das marcações */}
            <div className="absolute right-[-40px] top-0 h-full flex flex-col justify-between text-xs text-gray-600">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
          </div>
          
          <div className="ml-16 space-y-4">
            <div className={`text-3xl font-bold ${colors.text}`}>
              {value}%
            </div>
            <div className="space-y-2 text-sm">
              <div className={`font-medium ${colors.text}`}>
                {meaningLevel}
              </div>
              <div className="text-gray-600">
                {value >= 70 && "Forte conexão com propósito e direção clara"}
                {value >= 40 && value < 70 && "Conexão moderada, momentos de clareza alternados"}
                {value < 40 && "Busca de sentido em andamento, necessita reflexão"}
              </div>
            </div>
            
            {/* Indicadores de estado */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${value >= 70 ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Realização (70%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${value >= 40 && value < 70 ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                <span>Busca (40-69%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${value < 40 ? 'bg-red-500' : 'bg-gray-300'}`} />
                <span>Desconexão (0-39%)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
