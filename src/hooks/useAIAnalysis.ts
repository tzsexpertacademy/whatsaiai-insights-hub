
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useAIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const triggerAIAnalysis = async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      console.log('🤖 Iniciando análise por IA para usuário:', user.id);

      // Simular chamada para análise por IA
      // Em uma implementação real, isso faria uma chamada para uma Edge Function
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Aqui você pode implementar a lógica real de análise
      // Por exemplo, chamar uma Edge Function do Supabase
      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: { userId: user.id }
      });

      if (error) {
        console.error('❌ Erro na análise por IA:', error);
        throw error;
      }

      console.log('✅ Análise por IA concluída:', data);
      
      toast({
        title: "Análise concluída!",
        description: "As métricas foram atualizadas com base na análise por IA",
        duration: 3000
      });

      // Força atualização da página após análise
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('❌ Erro durante análise por IA:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível completar a análise por IA. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    triggerAIAnalysis
  };
}
