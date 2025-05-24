
import { useToast } from '@/hooks/use-toast';

export function useCacheManager() {
  const { toast } = useToast();

  const forceRefreshWithCacheClear = () => {
    try {
      // Limpar localStorage
      localStorage.clear();
      
      // Limpar sessionStorage
      sessionStorage.clear();
      
      // Mostrar toast de confirmação
      toast({
        title: "Cache limpo",
        description: "Cache foi limpo com sucesso. Recarregando a página...",
      });
      
      // Recarregar a página após um pequeno delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast({
        title: "Erro",
        description: "Erro ao limpar cache",
        variant: "destructive"
      });
    }
  };

  return {
    forceRefreshWithCacheClear
  };
}
