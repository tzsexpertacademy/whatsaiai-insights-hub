
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCommercialClientConfig } from './useCommercialClientConfig';
import { useClientConfig } from '@/contexts/ClientConfigContext';

interface CacheEntry {
  conversation_id: string;
  last_analysis: string;
  content_hash: string;
  cached_results: any;
  conversation_length: number;
}

interface AnalysisCacheStats {
  totalConversations: number;
  cachedConversations: number;
  newConversations: number;
  modifiedConversations: number;
  estimatedSavings: number;
}

export function useAnalysisCache(module: 'commercial' | 'observatory' = 'observatory') {
  const [cacheStats, setCacheStats] = useState<AnalysisCacheStats | null>(null);
  const { toast } = useToast();
  const { config: commercialConfig } = useCommercialClientConfig();
  const { config: observatoryConfig } = useClientConfig();

  // Gerar hash simples do conteúdo da conversa para detectar mudanças
  const generateContentHash = (conversation: any): string => {
    const content = JSON.stringify({
      messages: conversation.messages,
      contact_name: conversation.contact_name,
      updated_at: conversation.updated_at
    });
    
    // Hash simples usando soma de char codes
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converter para 32bit
    }
    return Math.abs(hash).toString(36);
  };

  // Obter configuração do Firebase baseada no módulo
  const getFirebaseConfig = () => {
    if (module === 'commercial') {
      return commercialConfig?.commercial_firebase_config;
    }
    return observatoryConfig?.firebase;
  };

  // Buscar cache existente do Firebase
  const getCacheData = async (): Promise<Record<string, CacheEntry>> => {
    try {
      const firebaseConfig = getFirebaseConfig();
      
      if (!firebaseConfig?.databaseURL || !firebaseConfig?.apiKey) {
        return {};
      }

      const firebaseUrl = firebaseConfig.databaseURL.replace(/\/$/, '');
      const authToken = firebaseConfig.apiKey;
      
      const cacheUrl = `${firebaseUrl}/analysis_cache/${module}.json?auth=${authToken}`;
      
      console.log(`📋 Buscando cache de análises (${module})`);
      
      const response = await fetch(cacheUrl);
      
      if (!response.ok || response.status === 404) {
        console.log('📝 Nenhum cache encontrado - primeira execução');
        return {};
      }

      const cacheData = await response.json();
      return cacheData || {};

    } catch (error) {
      console.error('❌ Erro ao buscar cache:', error);
      return {};
    }
  };

  // Salvar cache no Firebase
  const saveCacheData = async (cacheData: Record<string, CacheEntry>): Promise<void> => {
    try {
      const firebaseConfig = getFirebaseConfig();
      
      if (!firebaseConfig?.databaseURL || !firebaseConfig?.apiKey) {
        throw new Error('Firebase não configurado');
      }

      const firebaseUrl = firebaseConfig.databaseURL.replace(/\/$/, '');
      const authToken = firebaseConfig.apiKey;
      
      const cacheUrl = `${firebaseUrl}/analysis_cache/${module}.json?auth=${authToken}`;
      
      console.log(`💾 Salvando cache de análises (${module})`);
      
      const response = await fetch(cacheUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cacheData)
      });

      if (!response.ok) {
        throw new Error(`Erro ao salvar cache: ${response.status}`);
      }

      console.log('✅ Cache salvo com sucesso');

    } catch (error) {
      console.error('❌ Erro ao salvar cache:', error);
      throw error;
    }
  };

  // Analisar quais conversas precisam ser processadas
  const analyzeConversationsForCache = async (conversations: any[]): Promise<{
    toAnalyze: any[];
    cached: any[];
    stats: AnalysisCacheStats;
  }> => {
    console.log(`🔍 Analisando cache para ${conversations.length} conversas (${module})`);
    
    const existingCache = await getCacheData();
    const toAnalyze: any[] = [];
    const cached: any[] = [];
    
    let newCount = 0;
    let modifiedCount = 0;
    let cachedCount = 0;

    for (const conversation of conversations) {
      const conversationId = conversation.id;
      const currentHash = generateContentHash(conversation);
      const messageCount = conversation.messages?.length || 0;
      
      const cacheEntry = existingCache[conversationId];
      
      if (!cacheEntry) {
        // Conversa nova - precisa analisar
        toAnalyze.push(conversation);
        newCount++;
        console.log(`🆕 Nova conversa: ${conversationId} (${messageCount} mensagens)`);
      } else if (cacheEntry.content_hash !== currentHash || cacheEntry.conversation_length !== messageCount) {
        // Conversa modificada - precisa reanalisar
        toAnalyze.push(conversation);
        modifiedCount++;
        console.log(`🔄 Conversa modificada: ${conversationId} (${messageCount} mensagens)`);
      } else {
        // Conversa inalterada - usar cache
        cached.push({
          ...conversation,
          cached_analysis: cacheEntry.cached_results
        });
        cachedCount++;
        console.log(`💾 Usando cache: ${conversationId} (${messageCount} mensagens)`);
      }
    }

    const totalToProcess = toAnalyze.length;
    const estimatedSavings = totalToProcess > 0 ? Math.round((cachedCount / conversations.length) * 100) : 0;

    const stats: AnalysisCacheStats = {
      totalConversations: conversations.length,
      cachedConversations: cachedCount,
      newConversations: newCount,
      modifiedConversations: modifiedCount,
      estimatedSavings
    };

    console.log(`📊 Estatísticas do cache (${module}):`, {
      total: conversations.length,
      cached: cachedCount,
      toAnalyze: totalToProcess,
      savings: `${estimatedSavings}%`
    });

    setCacheStats(stats);

    return { toAnalyze, cached, stats };
  };

  // Atualizar cache após análise
  const updateCacheAfterAnalysis = async (
    analyzedConversations: any[], 
    analysisResults: any[]
  ): Promise<void> => {
    try {
      console.log(`🔄 Atualizando cache com ${analyzedConversations.length} novas análises (${module})`);
      
      const existingCache = await getCacheData();
      const timestamp = new Date().toISOString();

      // Atualizar cache com novas análises
      for (let i = 0; i < analyzedConversations.length; i++) {
        const conversation = analyzedConversations[i];
        const analysis = analysisResults[i];
        
        existingCache[conversation.id] = {
          conversation_id: conversation.id,
          last_analysis: timestamp,
          content_hash: generateContentHash(conversation),
          cached_results: analysis,
          conversation_length: conversation.messages?.length || 0
        };
      }

      await saveCacheData(existingCache);
      
      console.log('✅ Cache atualizado com sucesso');

    } catch (error) {
      console.error('❌ Erro ao atualizar cache:', error);
      // Não falhar a operação se cache não funcionar
    }
  };

  // Limpar cache (útil para reset ou debugging)
  const clearCache = async (): Promise<void> => {
    try {
      console.log(`🧹 Limpando cache de análises (${module})`);
      await saveCacheData({});
      setCacheStats(null);
      
      toast({
        title: "Cache limpo",
        description: `Cache de análises do ${module} foi limpo com sucesso`,
      });
      
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
      toast({
        title: "Erro ao limpar cache",
        description: "Não foi possível limpar o cache",
        variant: "destructive"
      });
    }
  };

  return {
    analyzeConversationsForCache,
    updateCacheAfterAnalysis,
    clearCache,
    cacheStats,
    generateContentHash
  };
}
