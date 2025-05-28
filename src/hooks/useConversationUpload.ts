
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UploadResult {
  success: boolean;
  data?: any;
  error?: string;
}

export function useConversationUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadAndAnalyze = async (file: File, assistantId: string): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      console.log('🤖 Iniciando análise REAL com OpenAI API');
      console.log('Arquivo:', file.name, 'Assistente:', assistantId);
      
      // Ler o conteúdo do arquivo
      const fileContent = await file.text();
      console.log('📄 Conteúdo do arquivo carregado');
      
      // Verificar se há chave API da OpenAI
      const openaiKey = localStorage.getItem('openai_api_key');
      if (!openaiKey) {
        throw new Error('Chave API da OpenAI não configurada. Configure em Settings > OpenAI.');
      }
      
      // Preparar prompt baseado no assistente
      const assistantPrompts = {
        kairon: 'Analise este documento com máxima franqueza e confronto. Identifique pontos fracos, contradições e áreas que a pessoa está evitando. Seja direto e não suavize críticas construtivas.',
        oracle: 'Faça uma análise psicológica profunda deste documento. Identifique padrões emocionais, resistências inconscientes e sombras que precisam ser trabalhadas.',
        guardian: 'Analise este documento do ponto de vista de recursos e energia. Como a pessoa está gerenciando tempo, dinheiro, energia? Que otimizações são necessárias?',
        engineer: 'Analise este documento focando na saúde física e bem-estar. Identifique sinais de desgaste, necessidades de cuidado corporal e otimizações de energia.',
        architect: 'Organize e estruture as informações deste documento. Identifique prioridades, sistemas que precisam ser implementados e planejamento estratégico.',
        weaver: 'Analise este documento buscando propósito e significado. Como isso se conecta com valores profundos e missão de vida da pessoa?',
        catalyst: 'Analise este documento para quebrar padrões limitantes. Identifique onde a criatividade está bloqueada e que mudanças revolucionárias são necessárias.',
        mirror: 'Analise este documento focando em relacionamentos. Como as dinâmicas interpessoais estão afetando a pessoa? Que padrões relacionais precisam mudar?'
      };
      
      const prompt = assistantPrompts[assistantId as keyof typeof assistantPrompts] || assistantPrompts.kairon;
      
      // Chamar a API real da OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: prompt
            },
            {
              role: 'user',
              content: `Analise o seguinte documento:\n\n${fileContent}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro da OpenAI API: ${errorData.error?.message || 'Erro desconhecido'}`);
      }
      
      const data = await response.json();
      const analysisResult = data.choices[0]?.message?.content;
      
      if (!analysisResult) {
        throw new Error('Resposta vazia da OpenAI API');
      }
      
      console.log('✅ Análise REAL concluída pela OpenAI');
      
      toast({
        title: "Análise concluída pela IA!",
        description: "Documento analisado com sucesso pela OpenAI",
      });
      
      return analysisResult;
      
    } catch (error) {
      console.error('❌ Erro na análise real:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: "Erro na análise",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadAndAnalyze,
    isUploading
  };
}
