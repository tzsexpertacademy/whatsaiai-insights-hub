
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ArrowRight } from 'lucide-react';

export function PowerVsEscapeChart() {
  // Dados simulados - depois conectar com análise real das conversas
  const powerExpressions = 65;
  const escapeExpressions = 35;
  
  const total = powerExpressions + escapeExpressions;

  return (
    <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-600" />
          Potência vs. Fuga
        </CardTitle>
        <p className="text-sm text-gray-600">
          Análise linguística: expressões de empoderamento versus evasão
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Gráfico de barras comparativo */}
          <div className="space-y-4">
            {/* Potência */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-green-700">Expressões de Potência</span>
                <span className="text-green-700 font-bold">{powerExpressions}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-green-500 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${powerExpressions}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">
                "Eu consigo", "Eu vou", "Faz sentido pra mim", "Estou pronto"
              </div>
            </div>
            
            {/* Fuga */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-red-700">Expressões de Fuga</span>
                <span className="text-red-700 font-bold">{escapeExpressions}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-red-500 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${escapeExpressions}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">
                "Não sei", "Talvez", "Depois eu vejo", "Tô perdido"
              </div>
            </div>
          </div>
          
          {/* Gráfico pizza visual */}
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                {/* Círculo de fundo */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#fee2e2"
                  strokeWidth="12"
                />
                {/* Arco de potência */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray={`${(powerExpressions / 100) * 351.86} 351.86`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{powerExpressions}%</div>
                  <div className="text-xs text-gray-600">Potência</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Análise interpretativa */}
          <div className={`p-4 rounded-lg border ${
            powerExpressions > 60 
              ? 'bg-green-50 border-green-200' 
              : powerExpressions > 40 
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
          }`}>
            <h4 className="font-medium mb-2">
              {powerExpressions > 60 && '🚀 Linguagem Empoderada'}
              {powerExpressions > 40 && powerExpressions <= 60 && '⚖️ Linguagem Equilibrada'}
              {powerExpressions <= 40 && '⚠️ Linguagem de Fuga Predominante'}
            </h4>
            <p className="text-sm text-gray-600">
              {powerExpressions > 60 && 
                'Sua linguagem demonstra confiança e direcionamento. Você se posiciona como protagonista da sua vida.'
              }
              {powerExpressions > 40 && powerExpressions <= 60 && 
                'Você alterna entre momentos de clareza e incerteza. Natural em processos de crescimento.'
              }
              {powerExpressions <= 40 && 
                'Sua linguagem revela evasão e insegurança. Momento importante para trabalhar autoconfiança e clareza.'
              }
            </p>
          </div>
          
          {/* Exemplos específicos */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h5 className="font-medium text-green-800 mb-2">Potência Detectada</h5>
              <ul className="space-y-1 text-green-700">
                <li>• "Eu vou fazer isso acontecer"</li>
                <li>• "Isso faz total sentido"</li>
                <li>• "Estou pronto para o próximo passo"</li>
              </ul>
            </div>
            
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <h5 className="font-medium text-red-800 mb-2">Fuga Detectada</h5>
              <ul className="space-y-1 text-red-700">
                <li>• "Não sei se vale a pena"</li>
                <li>• "Talvez depois eu pense nisso"</li>
                <li>• "Tô meio perdido mesmo"</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
