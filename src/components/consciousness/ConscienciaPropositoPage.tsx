
import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssistantSelector } from '@/components/AssistantSelector';
import { ConsciousnessMetrics } from './components/ConsciousnessMetrics';
import { ShadowRadar } from './components/ShadowRadar';
import { PurposeThermometer } from './components/PurposeThermometer';
import { AlignmentHeatmap } from './components/AlignmentHeatmap';
import { ClarityTimeline } from './components/ClarityTimeline';
import { PowerVsEscapeChart } from './components/PowerVsEscapeChart';
import { ConsciousnessInsights } from './components/ConsciousnessInsights';
import { ConsciousnessAlerts } from './components/ConsciousnessAlerts';
import { Brain, Eye, Target, Heart, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';

export function ConscienciaPropositoPage() {
  const { data, isLoading } = useAnalysisData();
  const { assistants } = useAssistantsConfig();
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [consciousnessData, setConsciousnessData] = useState({
    clarityIndex: 0,
    shadowIndex: 0,
    coherenceLevel: 'Sem dados',
    meaningLevel: 'Baixo',
    searchIntensity: 'Baixo',
    alignmentMap: {},
    insights: [],
    alerts: []
  });

  console.log('🧠 ConscienciaPropositoPage - Debug:', {
    isLoading,
    hasRealData: data.hasRealData,
    assistantsCount: assistants.length,
    insightsCount: data.insightsWithAssistant?.length || 0,
    selectedAssistant
  });

  // Buscar assistente especializado em consciência/propósito
  useEffect(() => {
    console.log('🔍 Procurando assistente de consciência...');
    const consciousnessAssistant = assistants.find(a => 
      a.description?.toLowerCase().includes('consciência') ||
      a.description?.toLowerCase().includes('propósito') ||
      a.name?.toLowerCase().includes('tecelão') ||
      a.name?.toLowerCase().includes('alma') ||
      a.name?.toLowerCase().includes('oráculo')
    );
    
    if (consciousnessAssistant) {
      console.log('✅ Assistente de consciência encontrado:', consciousnessAssistant.name);
      setSelectedAssistant(consciousnessAssistant.id);
    } else if (assistants.length > 0 && !selectedAssistant) {
      console.log('📋 Usando primeiro assistente disponível:', assistants[0].name);
      setSelectedAssistant(assistants[0].id);
    }
  }, [assistants, selectedAssistant]);

  // Análise das conversas para extrair dados de consciência
  const analyzeConsciousnessData = async () => {
    console.log('🔄 Iniciando análise de consciência...');
    
    if (!selectedAssistant || !data.conversations.length) {
      console.log('⚠️ Sem assistente ou conversas para analisar');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simular análise por enquanto - depois conectar com IA real
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Filtrar insights relacionados à consciência
      const consciousnessInsights = data.insightsWithAssistant?.filter(
        insight => {
          const searchTerms = ['consciência', 'propósito', 'sentido', 'valores', 'missão', 'visão', 'significado', 'direção', 'clareza', 'alinhamento'];
          const textToSearch = `${insight.title || ''} ${insight.description || ''}`.toLowerCase();
          return searchTerms.some(term => textToSearch.includes(term));
        }
      ) || [];

      console.log('📊 Insights de consciência encontrados:', consciousnessInsights.length);

      // Calcular métricas baseadas nos dados reais
      const clarityIndex = consciousnessInsights.length > 0 ? Math.min(85, consciousnessInsights.length * 15) : 25;
      const shadowIndex = Math.max(0, 60 - (consciousnessInsights.length * 10));
      
      const newConsciousnessData = {
        clarityIndex,
        shadowIndex,
        coherenceLevel: clarityIndex > 70 ? 'Alto' : clarityIndex > 40 ? 'Médio' : 'Baixo',
        meaningLevel: consciousnessInsights.length > 3 ? 'Alto' : consciousnessInsights.length > 1 ? 'Médio' : 'Baixo',
        searchIntensity: consciousnessInsights.length > 5 ? 'Intenso' : consciousnessInsights.length > 2 ? 'Médio' : 'Baixo',
        alignmentMap: {
          trabalho: 100 - shadowIndex,
          relacionamentos: 80,
          saude: 90,
          proposito: clarityIndex,
          financas: 75,
          crescimento: 85
        },
        insights: consciousnessInsights,
        alerts: consciousnessInsights.length === 0 ? [
          {
            type: 'warning',
            title: 'Baixa conexão com propósito',
            message: 'Suas conversas mostram pouca reflexão sobre sentido e direção de vida.'
          }
        ] : []
      };

      console.log('✅ Dados de consciência calculados:', newConsciousnessData);
      setConsciousnessData(newConsciousnessData);
    } catch (error) {
      console.error('💥 Erro na análise de consciência:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (data.hasRealData && selectedAssistant && !isAnalyzing) {
      console.log('🚀 Executando análise automática...');
      analyzeConsciousnessData();
    }
  }, [data.hasRealData, selectedAssistant]);

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <AssistantSelector
        selectedAssistant={selectedAssistant}
        onAssistantChange={setSelectedAssistant}
        className="mr-4"
      />
      <Badge className="bg-purple-100 text-purple-800">
        🧠 {consciousnessData.insights.length} Insights
      </Badge>
      <Badge className="bg-blue-100 text-blue-800">
        📊 Clareza: {consciousnessData.clarityIndex}%
      </Badge>
      <Button 
        onClick={analyzeConsciousnessData}
        disabled={isAnalyzing || !selectedAssistant}
        variant="outline"
        size="sm"
      >
        {isAnalyzing ? (
          <>
            <Brain className="h-4 w-4 mr-2 animate-pulse" />
            Analisando...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2" />
            Analisar Consciência
          </>
        )}
      </Button>
    </div>
  );

  if (isLoading) {
    console.log('⏳ Página em loading...');
    return (
      <PageLayout
        title="Consciência e Propósito"
        description="Carregando dados..."
        showBackButton={true}
      >
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  console.log('🎨 Renderizando página de consciência...');

  return (
    <PageLayout
      title="Consciência e Propósito"
      description="Espelho existencial dinâmico - análise da sua clareza, coerência interna e conexão com propósito"
      headerActions={headerActions}
      showBackButton={true}
    >
      <div className="space-y-6">
        {/* Debug Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-800">Status do Sistema</h3>
                <p className="text-sm text-blue-600">
                  Dados reais: {data.hasRealData ? 'Sim' : 'Não'} | 
                  Assistentes: {assistants.length} | 
                  Insights: {data.insightsWithAssistant?.length || 0} |
                  Assistente selecionado: {selectedAssistant || 'Nenhum'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status de Dados */}
        {!data.hasRealData && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="font-medium text-yellow-800">Sistema em Configuração</h3>
                  <p className="text-sm text-yellow-600">
                    Configure conversas no WhatsApp para alimentar a análise de consciência.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alertas de Consciência */}
        {consciousnessData.alerts.length > 0 && (
          <ConsciousnessAlerts alerts={consciousnessData.alerts} />
        )}

        {/* Métricas Principais */}
        <ConsciousnessMetrics data={consciousnessData} />

        {/* Visualizações Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar de Sombras */}
          <ShadowRadar shadowIndex={consciousnessData.shadowIndex} />
          
          {/* Termômetro de Propósito */}
          <PurposeThermometer meaningLevel={consciousnessData.meaningLevel} />
        </div>

        {/* Mapa de Alinhamento e Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlignmentHeatmap alignmentMap={consciousnessData.alignmentMap} />
          <ClarityTimeline clarityIndex={consciousnessData.clarityIndex} />
        </div>

        {/* Gráfico Potência vs Fuga */}
        <PowerVsEscapeChart />

        {/* Insights da Consciência */}
        <ConsciousnessInsights insights={consciousnessData.insights} />

        {/* Status do Sistema */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-800 text-base">Status do Sistema de Consciência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Clareza Existencial</p>
                <p className="font-bold text-gray-800">{consciousnessData.clarityIndex}%</p>
              </div>
              <div>
                <p className="text-gray-600">Nível de Sombra</p>
                <p className="font-bold text-gray-800">{consciousnessData.shadowIndex}%</p>
              </div>
              <div>
                <p className="text-gray-600">Coerência Interna</p>
                <p className="font-bold text-gray-800">{consciousnessData.coherenceLevel}</p>
              </div>
              <div>
                <p className="text-gray-600">Busca de Sentido</p>
                <p className="font-bold text-gray-800">{consciousnessData.searchIntensity}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
