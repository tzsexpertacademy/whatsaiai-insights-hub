
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Database, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CommercialAIAnalysisButton } from './CommercialAIAnalysisButton';

export function FunnelAnalysis() {
  const [hasCommercialData, setHasCommercialData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const checkCommercialData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Verificando dados do funil para usuário:', user.id);
        
        // Verificar se existem dados do funil
        const { data: funnelDataResponse, error: funnelError } = await supabase
          .from('sales_funnel_data')
          .select('*')
          .eq('user_id', user.id)
          .order('stage_order');

        if (funnelError) {
          console.error('❌ Erro ao verificar dados do funil:', funnelError);
        }

        const hasData = funnelDataResponse && funnelDataResponse.length > 0;
        console.log('📊 Dados do funil encontrados:', hasData);
        
        setHasCommercialData(hasData);
        if (hasData) {
          setFunnelData(funnelDataResponse);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar dados do funil:', error);
        setHasCommercialData(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkCommercialData();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Análise de Funil</h1>
            <p className="text-slate-600">Métricas detalhadas do pipeline de vendas</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>Carregando dados do funil...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasCommercialData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Análise de Funil</h1>
            <p className="text-slate-600">Métricas detalhadas do pipeline de vendas</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-gray-100 text-gray-800">Sem Dados</Badge>
            <CommercialAIAnalysisButton />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Análise de Funil Vazia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado de funil encontrado</h3>
              <p className="text-gray-600 mb-6">
                Para visualizar a análise de funil, você precisa:
              </p>
              <div className="text-left max-w-md mx-auto space-y-2">
                <p className="text-sm text-gray-600">• Gerar conversas comerciais</p>
                <p className="text-sm text-gray-600">• Executar análise por IA</p>
                <p className="text-sm text-gray-600">• Aguardar geração dos dados do funil</p>
              </div>
              <div className="mt-6">
                <CommercialAIAnalysisButton />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular taxas de conversão entre etapas
  const conversionRates = funnelData.map((stage, index) => {
    if (index === 0) return 100;
    const previousStage = funnelData[index - 1];
    return previousStage.leads_count > 0 
      ? Math.round((stage.leads_count / previousStage.leads_count) * 100)
      : 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Análise de Funil</h1>
          <p className="text-slate-600">Métricas detalhadas do pipeline de vendas</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800">Com Dados</Badge>
          <CommercialAIAnalysisButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>Fluxo completo do pipeline de vendas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                leads_count: { label: "Quantidade", color: "hsl(var(--chart-1))" }
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="stage_name" type="category" width={120} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="leads_count" fill="var(--color-leads_count)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Conversão por Etapa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {funnelData.map((stage, index) => (
              <div key={stage.id} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">{stage.stage_name}</span>
                  <Badge>{conversionRates[index]}%</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${conversionRates[index]}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
