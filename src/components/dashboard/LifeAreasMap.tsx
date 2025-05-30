
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle } from 'lucide-react';

export function LifeAreasMap() {
  const { data, isLoading } = useAnalysisData();

  // Criar dados do radar baseados nos insights REAIS dos assistentes
  const createRadarData = () => {
    if (!data.hasRealData || !data.insightsWithAssistant || data.insightsWithAssistant.length === 0) {
      return [];
    }

    const areas = [
      { key: 'relacionamentos', name: 'Relacionamentos' },
      { key: 'carreira', name: 'Carreira' },
      { key: 'saude', name: 'Saúde' },
      { key: 'familia', name: 'Família' },
      { key: 'financas', name: 'Finanças' },
      { key: 'desenvolvimento', name: 'Desenvolvimento' }
    ];

    return areas.map(area => {
      const areaInsights = data.insightsWithAssistant.filter(insight => 
        insight.assistantArea?.toLowerCase().includes(area.key) ||
        insight.description?.toLowerCase().includes(area.key) ||
        insight.title?.toLowerCase().includes(area.key)
      );
      
      // Calcular valor baseado no número de insights e prioridades
      let value = Math.min(areaInsights.length * 20, 100);
      
      // Ajustar baseado na prioridade dos insights
      const highPriorityCount = areaInsights.filter(i => i.priority === 'high').length;
      value = Math.min(value + (highPriorityCount * 10), 100);
      
      return {
        subject: area.name,
        A: value || 10, // Valor mínimo de 10 se não houver insights
        fullMark: 100
      };
    });
  };

  const radarData = createRadarData();

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle>Mapa das Áreas da Vida</CardTitle>
        <CardDescription>
          {data.hasRealData 
            ? `Distribuição baseada em ${data.insightsWithAssistant?.length || 0} insights dos assistentes`
            : "Distribuição de atenção aos aspectos fundamentais"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : !data.hasRealData || radarData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-sm text-gray-500 text-center">
                Execute a análise por IA para mapear suas áreas da vida
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar 
                  name="Suas Áreas da Vida" 
                  dataKey="A" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6} 
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
