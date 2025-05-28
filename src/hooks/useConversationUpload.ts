
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useClientConfig } from '@/contexts/ClientConfigContext';

export function useConversationUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { config } = useClientConfig();

  const uploadAndAnalyze = async (file: File, assistantId: string): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      console.log('🤖 Iniciando análise REAL com OpenAI API');
      console.log('Arquivo:', file.name, 'Assistente:', assistantId);
      
      // Ler o conteúdo do arquivo
      const fileContent = await file.text();
      console.log('📄 Conteúdo do arquivo carregado');
      
      // Verificar se há chave API da OpenAI na configuração
      if (!config.openai?.apiKey) {
        throw new Error('Chave da OpenAI não configurada. Vá para Configurações → OpenAI para configurar sua API key.');
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
      
      console.log('🔑 Usando configuração OpenAI:', {
        model: config.openai.model || 'gpt-4o-mini',
        hasApiKey: !!config.openai.apiKey,
        temperature: config.openai.temperature || 0.7
      });
      
      // Chamar a API real da OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.openai.model || 'gpt-4o-mini',
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
          max_tokens: config.openai.maxTokens || 1000,
          temperature: config.openai.temperature || 0.7
        }),
      });
      
      console.log('📡 OpenAI Response Status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Erro da OpenAI API:', errorData);
        throw new Error(`Erro da OpenAI API (${response.status}): ${errorData}`);
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
