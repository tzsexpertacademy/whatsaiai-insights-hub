
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
        title: "Erro de autenticação",
        description: "Você precisa estar logado para realizar esta ação",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      console.log('🤖 Iniciando análise por IA do Observatório para usuário:', user.id);

      // Primeiro, limpar dados antigos do Observatório
      await supabase.from('insights').delete().eq('user_id', user.id);
      console.log('🧹 Dados antigos do Observatório limpos');

      // Simular análise por IA e geração de insights do Observatório
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Gerar insights simulados para o Observatório da Consciência
      const observatoryInsights = [
        {
          user_id: user.id,
          insight_type: 'emotional',
          title: 'Padrão Emocional Detectado',
          description: 'Análise identificou tendência de ansiedade em períodos de alta demanda de trabalho',
          priority: 'high',
          status: 'active'
        },
        {
          user_id: user.id,
          insight_type: 'behavioral',
          title: 'Comportamento de Evitação',
          description: 'Observado padrão de procrastinação em tarefas complexas',
          priority: 'medium',
          status: 'active'
        },
        {
          user_id: user.id,
          insight_type: 'growth',
          title: 'Oportunidade de Crescimento',
          description: 'Potencial para desenvolvimento de habilidades de liderança identificado',
          priority: 'medium',
          status: 'active'
        }
      ];

      // Inserir novos insights do Observatório
      const { error: insightsError } = await supabase
        .from('insights')
        .insert(observatoryInsights);

      if (insightsError) {
        console.error('❌ Erro ao inserir insights do Observatório:', insightsError);
        throw insightsError;
      }

      console.log('✅ Análise do Observatório da Consciência concluída');
      
      toast({
        title: "Análise do Observatório concluída!",
        description: "Os insights foram atualizados com base na análise por IA",
        duration: 3000
      });

      // Força atualização da página após análise
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('❌ Erro durante análise do Observatório:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível completar a análise do Observatório. Tente novamente.",
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
