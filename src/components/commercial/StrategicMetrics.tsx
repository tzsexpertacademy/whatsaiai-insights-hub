
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Target } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CommercialAIAnalysisButton } from './CommercialAIAnalysisButton';

export function StrategicMetrics() {
  const [hasCommercialData, setHasCommercialData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkCommercialData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Verificando dados estratégicos para usuário:', user.id);
        
        // Verificar se existem insights comerciais
        const { data: insightsData, error: insightsError } = await supabase
          .from('commercial_insights')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (insightsError) {
          console.error('❌ Erro ao verificar insights estratégicos:', insightsError);
        }

        const hasData = insightsData && insightsData.length > 0;
        console.log('📊 Dados estratégicos encontrados:', hasData);
        setHasCommercialData(hasData);
      } catch (error) {
        console.error('❌ Erro ao verificar dados estratégicos:', error);
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Métricas Estratégicas</h1>
            <p className="text-slate-600">Visão executiva e projeções de crescimento</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>Carregando métricas estratégicas...</p>
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Métricas Estratégicas</h1>
            <p className="text-slate-600">Visão executiva e projeções de crescimento</p>
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
              Métricas Estratégicas Vazias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado estratégico encontrado</h3>
              <p className="text-gray-600 mb-6">
                Para visualizar métricas estratégicas, você precisa:
              </p>
              <div className="text-left max-w-md mx-auto space-y-2">
                <p className="text-sm text-gray-600">• Gerar conversas comerciais</p>
                <p className="text-sm text-gray-600">• Executar análise por IA</p>
                <p className="text-sm text-gray-600">• Aguardar insights estratégicos</p>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Métricas Estratégicas</h1>
          <p className="text-slate-600">Visão executiva e projeções de crescimento</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800">Com Dados</Badge>
          <CommercialAIAnalysisButton />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Executivo</CardTitle>
          <CardDescription>Análise estratégica baseada em dados processados por IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Crescimento Projetado</h4>
              <p className="text-sm text-blue-700">
                Baseado nos dados atuais, projeção de crescimento positivo para os próximos meses
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Saúde do Pipeline</h4>
              <p className="text-sm text-green-700">
                Pipeline demonstra consistência e fluxo saudável de conversões
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Oportunidades</h4>
              <p className="text-sm text-purple-700">
                Identificadas oportunidades de otimização em processos-chave
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
