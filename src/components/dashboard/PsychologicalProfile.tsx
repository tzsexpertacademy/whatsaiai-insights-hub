
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle } from 'lucide-react';

export function PsychologicalProfile() {
  const { data, isLoading } = useAnalysisData();

  // Criar dados do perfil psicológico baseados nos insights REAIS dos assistentes
  const createPsychologicalData = () => {
    if (!data.hasRealData || !data.insightsWithAssistant || data.insightsWithAssistant.length === 0) {
      return [];
    }

    const traits = [
      { key: 'extroversão', name: 'Extroversão' },
      { key: 'conscienciosidade', name: 'Conscienciosidade' },
      { key: 'abertura', name: 'Abertura' },
      { key: 'amabilidade', name: 'Amabilidade' },
      { key: 'neuroticismo', name: 'Neuroticismo' }
    ];

    return traits.map(trait => {
      const relatedInsights = data.insightsWithAssistant.filter(insight => 
        insight.description?.toLowerCase().includes(trait.key) ||
        insight.description?.toLowerCase().includes('personalidade') ||
        insight.insight_type === 'psychological' ||
        insight.assistantArea === 'psicologia'
      );
      
      // Calcular valor baseado nos insights relacionados
      let value = Math.min(relatedInsights.length * 15 + 40, 100);
      
      // Ajustar baseado no tipo de insight
      const emotionalInsights = relatedInsights.filter(i => i.insight_type === 'emotional').length;
      const behavioralInsights = relatedInsights.filter(i => i.insight_type === 'behavioral').length;
      
      value = Math.min(value + (emotionalInsights * 5) + (behavioralInsights * 5), 100);
      
      return {
        name: trait.name,
        value: value,
        description: `Baseado em ${relatedInsights.length} insights dos assistentes`
      };
    });
  };

  const psychData = createPsychologicalData();

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle>Perfil Psicológico (Big Five)</CardTitle>
        <CardDescription>
          {data.hasRealData 
            ? `Análise baseada em insights dos assistentes especializados`
            : "Análise de traços de personalidade predominantes"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : !data.hasRealData || psychData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-sm text-gray-500 text-center">
              Execute a análise por IA para gerar seu perfil psicológico
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={psychData}
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value}%`, 
                  props.payload.description
                ]}
              />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
