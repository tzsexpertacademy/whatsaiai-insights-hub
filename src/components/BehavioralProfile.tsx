
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle } from 'lucide-react';

export function BehavioralProfile() {
  const { data, isLoading } = useAnalysisData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Perfil Comportamental</h1>
          <p className="text-slate-600">Análise detalhada dos seus traços de personalidade e padrões cognitivos</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (!data.hasRealData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Perfil Comportamental</h1>
          <p className="text-slate-600">Análise detalhada dos seus traços de personalidade e padrões cognitivos</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Perfil não disponível</h3>
              <p className="text-gray-500 max-w-md">
                Para gerar seu perfil comportamental, você precisa ter conversas analisadas pelos assistentes de IA.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Crie conversas de teste ou conecte seu WhatsApp</p>
                <p>• Execute a análise por IA</p>
                <p>• Os assistentes irão identificar seus padrões comportamentais</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Perfil Comportamental</h1>
        <p className="text-slate-600">Análise detalhada dos seus traços de personalidade e padrões cognitivos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Big Five Traits</CardTitle>
            <CardDescription>Modelo dos cinco grandes traços de personalidade</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                layout="vertical"
                data={data.bigFiveData}
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Análise Comportamental</CardTitle>
            <CardDescription>Baseado na análise das suas conversas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Perfil Predominante</h4>
                <p className="text-blue-700 text-lg font-semibold">{data.psychologicalProfile}</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Estado Emocional</h4>
                <p className="text-green-700 text-lg font-semibold">{data.emotionalState}</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900">Foco Principal</h4>
                <p className="text-purple-700 text-lg font-semibold">{data.mainFocus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
