
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle, Brain, Target, Users } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export function BehavioralProfile() {
  const { data, isLoading } = useAnalysisData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Perfil Comportamental</h1>
          <p className="text-slate-600">Análise DISC, MBTI aproximado e Big Five baseada em IA</p>
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
          <p className="text-slate-600">Análise DISC, MBTI aproximado e Big Five baseada em IA</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Aguardando Análise por IA</h3>
              <p className="text-gray-500 max-w-md">
                Os padrões comportamentais são gerados apenas pela IA após análise de conversas reais.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Execute a análise por IA no dashboard principal</p>
                <p>• A IA analisará suas conversas</p>
                <p>• Perfis DISC, MBTI e Big Five serão gerados automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Preparar dados DISC para o gráfico radar
  const discData = [
    { subject: 'Dominante (D)', A: data.discProfile.dominance, fullMark: 100 },
    { subject: 'Influente (I)', A: data.discProfile.influence, fullMark: 100 },
    { subject: 'Estável (S)', A: data.discProfile.steadiness, fullMark: 100 },
    { subject: 'Cauteloso (C)', A: data.discProfile.compliance, fullMark: 100 }
  ];

  // Preparar dados MBTI para o gráfico
  const mbtiData = [
    { name: 'Extroversão', value: data.mbtiProfile.extroversion, opposite: 'Introversão' },
    { name: 'Sensação', value: data.mbtiProfile.sensing, opposite: 'Intuição' },
    { name: 'Pensamento', value: data.mbtiProfile.thinking, opposite: 'Sentimento' },
    { name: 'Julgamento', value: data.mbtiProfile.judging, opposite: 'Percepção' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Perfil Comportamental</h1>
        <p className="text-slate-600">Análise DISC, MBTI aproximado e Big Five baseada em IA</p>
      </div>

      {/* Resumo dos Perfis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Target className="h-5 w-5" />
              Perfil DISC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-900 mb-2">{data.discProfile.primaryType}</p>
            <p className="text-blue-700 text-sm">Padrão comportamental dominante</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Brain className="h-5 w-5" />
              MBTI Aproximado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-900 mb-2">{data.mbtiProfile.approximateType}</p>
            <p className="text-purple-700 text-sm">Baseado em análise de IA</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Users className="h-5 w-5" />
              Big Five
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-900 mb-2">{data.psychologicalProfile}</p>
            <p className="text-green-700 text-sm">Perfil psicológico geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos detalhados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DISC Profile Radar */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Perfil DISC</CardTitle>
            <CardDescription>Análise comportamental segundo modelo DISC</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={discData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="DISC"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Tipo Predominante:</p>
              <p className="text-lg font-bold text-blue-900">{data.discProfile.primaryType}</p>
            </div>
          </CardContent>
        </Card>

        {/* MBTI Profile */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>MBTI Aproximado</CardTitle>
            <CardDescription>Tendências de personalidade baseadas em IA</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mbtiData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value}%`, 
                    value > 50 ? name : mbtiData.find(item => item.name === name)?.opposite
                  ]}
                />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-800">Tipo Aproximado:</p>
              <p className="text-lg font-bold text-purple-900">{data.mbtiProfile.approximateType}</p>
              <Badge className="mt-2 bg-purple-100 text-purple-800">Baseado em IA</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Big Five Traits */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Big Five - Cinco Grandes Traços</CardTitle>
          <CardDescription>Modelo psicológico dos cinco fatores principais de personalidade</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.bigFiveData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${value}/100`, 
                  props.payload.description
                ]}
              />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
            {data.bigFiveData.map((trait, index) => (
              <div key={trait.name} className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 text-sm">{trait.name}</h4>
                <p className="text-2xl font-bold text-green-800">{trait.value}</p>
                <p className="text-xs text-green-700">{trait.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informações adicionais */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Sobre os Perfis Comportamentais</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">DISC</h4>
              <p>Modelo focado no comportamento observável em diferentes situações e ambientes.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">MBTI</h4>
              <p>Aproximação baseada em preferências cognitivas e processamento de informações.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Big Five</h4>
              <p>Modelo científico dos cinco principais traços de personalidade humana.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
