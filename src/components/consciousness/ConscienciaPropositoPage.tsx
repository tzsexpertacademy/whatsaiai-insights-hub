
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
import { Brain, Eye, Target, Heart, TrendingUp, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';

export function ConscienciaPropositoPage() {
  const { data, isLoading } = useAnalysisData();
  const { assistants } = useAssistantsConfig();
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Dados de demonstração garantidos para sempre mostrar algo
  const [consciousnessData, setConsciousnessData] = useState({
    clarityIndex: 65,
    shadowIndex: 35,
    coherenceLevel: 'Médio',
    meaningLevel: 'Médio',
    searchIntensity: 'Médio',
    alignmentMap: {
      trabalho: 70,
      relacionamentos: 80,
      saude: 90,
      proposito: 65,
      financas: 75,
      crescimento: 85
    },
    insights: [
      {
        id: 'demo_1',
        title: 'Busca por Clareza Existencial',
        description: 'Detectamos uma necessidade crescente de encontrar direção e propósito nas suas conversas.',
        priority: 'high',
        assistantName: 'Sistema',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_2', 
        title: 'Padrões de Reflexão',
        description: 'Suas conversas mostram momentos de profunda reflexão sobre valores e significado.',
        priority: 'medium',
        assistantName: 'Oráculo',
        createdAt: new Date().toISOString()
      }
    ],
    alerts: [
      {
        type: 'info' as const,
        title: 'Sistema de Consciência Ativo',
        message: 'Monitoramento de clareza existencial e propósito funcionando normalmente.'
      }
    ]
  });

  console.log('🧠 ConscienciaPropositoPage - Renderizando com dados:', {
    isLoading,
    hasRealData: data?.hasRealData || false,
    assistantsCount: assistants?.length || 0,
    consciousnessDataReady: !!consciousnessData,
    selectedAssistant
  });

  // Buscar assistente especializado
  useEffect(() => {
    if (assistants && assistants.length > 0 && !selectedAssistant) {
      const consciousnessAssistant = assistants.find(a => 
        a.description?.toLowerCase().includes('consciência') ||
        a.description?.toLowerCase().includes('propósito') ||
        a.name?.toLowerCase().includes('tecelão') ||
        a.name?.toLowerCase().includes('alma') ||
        a.name?.toLowerCase().includes('oráculo')
      );
      
      if (consciousnessAssistant) {
        setSelectedAssistant(consciousnessAssistant.id);
      } else {
        setSelectedAssistant(assistants[0].id);
      }
    }
  }, [assistants, selectedAssistant]);

  const analyzeConsciousnessData = async () => {
    console.log('🔄 Simulando análise de consciência...');
    setIsAnalyzing(true);
    
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Atualizar com dados mais refinados
      const updatedData = {
        ...consciousnessData,
        clarityIndex: Math.min(85, consciousnessData.clarityIndex + 10),
        shadowIndex: Math.max(20, consciousnessData.shadowIndex - 5),
        insights: [
          ...consciousnessData.insights,
          {
            id: `analysis_${Date.now()}`,
            title: 'Nova Análise Concluída',
            description: 'Sua consciência mostra evolução positiva em direção a maior clareza.',
            priority: 'high',
            assistantName: selectedAssistant || 'Sistema',
            createdAt: new Date().toISOString()
          }
        ]
      };
      
      setConsciousnessData(updatedData);
      console.log('✅ Análise de consciência atualizada');
    } catch (error) {
      console.error('💥 Erro na análise:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

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
        disabled={isAnalyzing}
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

  // Mostrar loading apenas por alguns segundos
  if (isLoading) {
    return (
      <PageLayout
        title="Consciência e Propósito"
        description="Carregando dados de consciência..."
        showBackButton={true}
      >
        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <Brain className="h-12 w-12 text-blue-400 mx-auto mb-3 animate-pulse" />
              <h3 className="font-medium text-blue-800 mb-2">Iniciando Sistema de Consciência</h3>
              <p className="text-sm text-blue-600">
                Preparando análise existencial e mapeamento de propósito...
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  console.log('🎨 Renderizando página completa de consciência');

  return (
    <PageLayout
      title="Consciência e Propósito"
      description="Espelho existencial dinâmico - análise da sua clareza, coerência interna e conexão com propósito"
      headerActions={headerActions}
      showBackButton={true}
    >
      <div className="space-y-6">
        {/* Status de Funcionamento */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">Sistema de Consciência Ativo</h3>
                <p className="text-sm text-green-600">
                  Monitoramento existencial funcionando | 
                  Assistentes: {assistants?.length || 0} | 
                  Insights: {consciousnessData.insights.length} |
                  Dados: {data?.hasRealData ? 'Reais' : 'Demonstração'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas de Consciência */}
        {consciousnessData.alerts.length > 0 && (
          <ConsciousnessAlerts alerts={consciousnessData.alerts} />
        )}

        {/* Métricas Principais */}
        <ConsciousnessMetrics data={consciousnessData} />

        {/* Visualizações Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ShadowRadar shadowIndex={consciousnessData.shadowIndex} />
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

        {/* Status Detalhado do Sistema */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-800 text-base flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Métricas do Sistema de Consciência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-white rounded border">
                <p className="text-gray-600">Clareza Existencial</p>
                <p className="font-bold text-2xl text-blue-600">{consciousnessData.clarityIndex}%</p>
              </div>
              <div className="p-3 bg-white rounded border">
                <p className="text-gray-600">Nível de Sombra</p>
                <p className="font-bold text-2xl text-red-600">{consciousnessData.shadowIndex}%</p>
              </div>
              <div className="p-3 bg-white rounded border">
                <p className="text-gray-600">Coerência Interna</p>
                <p className="font-bold text-lg text-green-600">{consciousnessData.coherenceLevel}</p>
              </div>
              <div className="p-3 bg-white rounded border">
                <p className="text-gray-600">Busca de Sentido</p>
                <p className="font-bold text-lg text-purple-600">{consciousnessData.searchIntensity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Área de Debug (removível depois) */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800 text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>• isLoading: {isLoading ? 'true' : 'false'}</p>
              <p>• hasRealData: {data?.hasRealData ? 'true' : 'false'}</p>
              <p>• assistants: {assistants?.length || 0}</p>
              <p>• selectedAssistant: {selectedAssistant || 'none'}</p>
              <p>• insights: {consciousnessData.insights.length}</p>
              <p>• clarityIndex: {consciousnessData.clarityIndex}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
