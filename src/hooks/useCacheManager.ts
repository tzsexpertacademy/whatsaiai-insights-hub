
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useCacheManager() {
  const { toast } = useToast();

  const clearProblematicCache = () => {
    try {
      console.log('🧹 Limpando cache problemático...');
      
      // Limpa localStorage específico que pode estar causando problemas
      const keysToRemove = [
        'supabase.auth.token',
        'sb-duyxbtfknilgrvgsvlyy-auth-token',
        'lovable-cache',
        'app-cache'
      ];
      
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`🗑️ Removido localStorage: ${key}`);
        }
      });

      // Limpa sessionStorage
      const sessionKeysToRemove = [
        'temp-auth',
        'app-session'
      ];
      
      sessionKeysToRemove.forEach(key => {
        if (sessionStorage.getItem(key)) {
          sessionStorage.removeItem(key);
          console.log(`🗑️ Removido sessionStorage: ${key}`);
        }
      });

      console.log('✅ Cache problemático limpo');
      
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  };

  const forceRefreshWithCacheClear = () => {
    clearProblematicCache();
    
    toast({
      title: "Limpando cache",
      description: "Atualizando aplicação em 2 segundos...",
      duration: 2000
    });

    setTimeout(() => {
      // Força reload sem cache
      window.location.href = window.location.href;
    }, 2000);
  };

  // Limpa cache automaticamente a cada 30 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Limpeza automática de cache...');
      clearProblematicCache();
    }, 30 * 60 * 1000); // 30 minutos

    return () => clearInterval(interval);
  }, []);

  return {
    clearProblematicCache,
    forceRefreshWithCacheClear
  };
}
