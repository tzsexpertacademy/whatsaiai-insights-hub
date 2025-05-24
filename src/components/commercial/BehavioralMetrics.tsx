import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Brain, Bot } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CommercialAIAnalysisButton } from './CommercialAIAnalysisButton';

export function BehavioralMetrics() {
  const [hasCommercialData, setHasCommercialData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [behavioralInsights, setBehavioralInsights] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const checkCommercialData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Verificando dados comportamentais para usuário:', user.id);
        
        // Verificar se existem insights comportamentais dos assistentes
        const { data: insightsData, error: insightsError } = await supabase
          .from('commercial_insights')
          .select('*')
          .eq('user_id', user.id)
          .eq('insight_type', 'behavioral')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (insightsError) {
          console.error('❌ Erro ao verificar dados comportamentais:', insightsError);
        }

        const hasData = insightsData && insightsData.length > 0;
        console.log('📊 Dados comportamentais encontrados:', hasData);
        setHasCommercialData(hasData);
        
        if (hasData) {
          setBehavioralInsights(insightsData);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar dados comportamentais:', error);
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Métricas Comportamentais</h1>
            <p className="text-slate-600">Análise qualitativa da comunicação e abordagem</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>Carregando métricas comportamentais...</p>
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Métricas Comportamentais</h1>
            <p className="text-slate-600">Análise qualitativa da comunicação e abordagem</p>
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
              Métricas Comportamentais Vazias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado comportamental encontrado</h3>
              <p className="text-gray-600 mb-6">
                Para visualizar métricas comportamentais, você precisa:
              </p>
              <div className="text-left max-w-md mx-auto space-y-2">
                <p className="text-sm text-gray-600">• Gerar conversas comerciais</p>
                <p className="text-sm text-gray-600">• Executar análise por IA</p>
                <p className="text-sm text-gray-600">• Aguardar análise de padrões</p>
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Métricas Comportamentais</h1>
          <p className="text-slate-600">Análise qualitativa da comunicação e abordagem</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800">Com Dados</Badge>
          <CommercialAIAnalysisButton />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análise de Padrões de Comunicação</CardTitle>
          <CardDescription>Insights comportamentais baseados em conversas processadas pelos Assistentes IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {behavioralInsights.slice(0, 3).map((insight, index) => (
              <div key={insight.id} className={`p-4 rounded-lg ${getInsightBackgroundColor(index)}`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`font-medium ${getInsightTextColor(index)}`}>
                    {insight.title}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    Head Comercial
                  </Badge>
                </div>
                <p className={`text-sm ${getInsightDescriptionColor(index)} mb-3`}>
                  {insight.description}
                </p>
                <div className="flex items-center gap-2">
                  <Bot className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">
                    🎼 Head Comercial (Maestro do Crescimento)
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {insight.sales_impact === 'high' ? 'Alto Impacto' : 'Médio Impacto'}
                  </Badge>
                </div>
              </div>
            ))}
            
            {behavioralInsights.length === 0 && (
              <div className="col-span-3 text-center py-8">
                <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Head Comercial Analisando</h3>
                <p className="text-gray-600">
                  O Maestro do Crescimento está processando padrões comportamentais
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {behavioralInsights.length > 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Análises Comportamentais Detalhadas</CardTitle>
            <CardDescription>Insights adicionais do Head Comercial</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {behavioralInsights.slice(3).map((insight) => (
                <div key={insight.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{insight.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <Badge variant="outline" className="mb-1">
                        Head Comercial
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Bot className="h-3 w-3" />
                        🎼
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Funções auxiliares
function getInsightBackgroundColor(index: number): string {
  const colors = ['bg-blue-50', 'bg-green-50', 'bg-purple-50'];
  return colors[index % colors.length];
}

function getInsightTextColor(index: number): string {
  const colors = ['text-blue-800', 'text-green-800', 'text-purple-800'];
  return colors[index % colors.length];
}

function getInsightDescriptionColor(index: number): string {
  const colors = ['text-blue-700', 'text-green-700', 'text-purple-700'];
  return colors[index % colors.length];
}
