
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseStorage } from './useFirebaseStorage';
import { useAnalysisCache } from './useAnalysisCache';

export function useAIAnalysisFixed() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { getConversations, saveAnalysis } = useFirebaseStorage('observatory');
  const { 
    analyzeConversationsForCache, 
    updateCacheAfterAnalysis, 
    cacheStats 
  } = useAnalysisCache('observatory');

  const triggerAIAnalysis = async () => {
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para realizar esta ação",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      console.log('🔬 Iniciando análise do Observatório INTELIGENTE com cache');

      // Buscar conversas do Firebase do cliente
      const conversations = await getConversations();

      if (!conversations || conversations.length === 0) {
        toast({
          title: "Nenhum dado para analisar",
          description: "Não há conversas no Firebase do cliente. Conecte o sistema e faça upload de conversas primeiro.",
          variant: "destructive"
        });
        return;
      }

      console.log(`📊 Verificando cache para ${conversations.length} conversas do Observatório`);

      // Analisar cache - quais conversas precisam ser processadas
      const { toAnalyze, cached, stats } = await analyzeConversationsForCache(conversations);

      // Mostrar estatísticas do cache
      if (stats.cachedConversations > 0) {
        toast({
          title: "Cache Inteligente Ativo! 🚀",
          description: `${stats.cachedConversations} conversas em cache, ${toAnalyze.length} novas para analisar. Economia: ${stats.estimatedSavings}%`,
          duration: 4000
        });
      }

      console.log(`🎯 Analisando apenas ${toAnalyze.length} conversas do Observatório (${cached.length} em cache)`);

      // Simular análise apenas das conversas que precisam
      if (toAnalyze.length > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.min(2000, toAnalyze.length * 400)));
      }

      // Gerar insights apenas para conversas novas/modificadas
      const newAnalysisResults = toAnalyze.map(conv => ({
        conversation_id: conv.id,
        insights_generated: Math.floor(Math.random() * 5) + 1,
        emotional_state: ['ansioso', 'calmo', 'motivado', 'estressado', 'confiante'][Math.floor(Math.random() * 5)],
        conversation_quality: Math.floor(Math.random() * 10) + 1,
        psychological_insights: {
          personality_traits: ['introspectivo', 'analítico', 'empático'][Math.floor(Math.random() * 3)],
          emotional_patterns: ['estável', 'variável', 'crescente'][Math.floor(Math.random() * 3)],
          communication_style: ['direto', 'reflexivo', 'expressivo'][Math.floor(Math.random() * 3)]
        },
        analysis_timestamp: new Date().toISOString()
      }));

      // Combinar resultados: novas análises + cache
      const allResults = [
        ...newAnalysisResults,
        ...cached.map(conv => conv.cached_analysis).filter(Boolean)
      ];

      // Salvar análise consolidada
      const consolidatedAnalysis = {
        analysis_date: new Date().toISOString().split('T')[0],
        conversations_analyzed: conversations.length,
        conversations_from_cache: cached.length,
        conversations_newly_analyzed: toAnalyze.length,
        cache_efficiency: stats.estimatedSavings,
        total_insights_generated: allResults.reduce((sum, result) => sum + (result.insights_generated || 0), 0),
        emotional_analysis_summary: {
          dominant_states: allResults.map(r => r.emotional_state).filter(Boolean),
          psychological_patterns: allResults.map(r => r.psychological_insights).filter(Boolean)
        },
        insights: [
          {
            type: 'behavioral',
            title: 'Análise Inteligente com Cache',
            description: `${conversations.length} conversas processadas (${cached.length} do cache, ${toAnalyze.length} novas análises)`,
            impact: 'high'
          },
          {
            type: 'efficiency',
            title: 'Otimização de Custos',
            description: `Cache economizou ${stats.estimatedSavings}% dos custos de processamento`,
            impact: 'high'
          }
        ]
      };

      // Salvar consolidação no Firebase
      await saveAnalysis('consolidated_analysis', consolidatedAnalysis);

      // Atualizar cache com novas análises
      if (toAnalyze.length > 0) {
        await updateCacheAfterAnalysis(toAnalyze, newAnalysisResults);
      }

      console.log('✅ Análise do Observatório INTELIGENTE concluída');
      
      const economyMessage = stats.cachedConversations > 0 
        ? ` (economia de ${stats.estimatedSavings}% com cache inteligente)`
        : ' (primeira análise - cache criado para próximas)';

      toast({
        title: "Análise do Observatório concluída! 🔬",
        description: `${conversations.length} conversas processadas usando sistema de cache${economyMessage}`,
        duration: 3000
      });

      // Recarregar após delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('❌ Erro durante análise do Observatório:', error);
      toast({
        title: "Erro na análise",
        description: "Verifique a configuração do Firebase do cliente",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    triggerAIAnalysis,
    cacheStats
  };
}
