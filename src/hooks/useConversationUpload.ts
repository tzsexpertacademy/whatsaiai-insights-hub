
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useClientConfig } from '@/contexts/ClientConfigContext';

interface ChunkResult {
  chunk: string;
  chunkIndex: number;
  totalChunks: number;
}

export function useConversationUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { config } = useClientConfig();

  // Função para dividir texto em chunks menores
  const chunkText = (text: string, maxTokens: number = 100000): string[] => {
    const estimatedTokensPerChar = 0.25; // Estimativa conservadora
    const maxChars = Math.floor(maxTokens / estimatedTokensPerChar);
    
    if (text.length <= maxChars) {
      return [text];
    }

    const chunks: string[] = [];
    let currentIndex = 0;

    while (currentIndex < text.length) {
      const chunk = text.slice(currentIndex, currentIndex + maxChars);
      chunks.push(chunk);
      currentIndex += maxChars;
    }

    return chunks;
  };

  // Função para analisar um chunk individual
  const analyzeChunk = async (chunk: string, assistantId: string, chunkIndex: number, totalChunks: number): Promise<string> => {
    const assistantPrompts = {
      kairon: 'Analise este fragmento de documento com máxima franqueza e confronto. Identifique pontos fracos, contradições e áreas que a pessoa está evitando. Seja direto e não suavize críticas construtivas.',
      oracle: 'Faça uma análise psicológica profunda deste fragmento. Identifique padrões emocionais, resistências inconscientes e sombras que precisam ser trabalhadas.',
      guardian: 'Analise este fragmento focando em recursos e energia. Como a pessoa está gerenciando tempo, dinheiro, energia? Que otimizações são necessárias?',
      engineer: 'Analise este fragmento focando na saúde física e bem-estar. Identifique sinais de desgaste, necessidades de cuidado corporal e otimizações de energia.',
      architect: 'Organize e estruture as informações deste fragmento. Identifique prioridades, sistemas que precisam ser implementados e planejamento estratégico.',
      weaver: 'Analise este fragmento buscando propósito e significado. Como isso se conecta com valores profundos e missão de vida da pessoa?',
      catalyst: 'Analise este fragmento para quebrar padrões limitantes. Identifique onde a criatividade está bloqueada e que mudanças revolucionárias são necessárias.',
      mirror: 'Analise este fragmento focando em relacionamentos. Como as dinâmicas interpessoais estão afetando a pessoa? Que padrões relacionais precisam mudar?'
    };

    const prompt = assistantPrompts[assistantId as keyof typeof assistantPrompts] || assistantPrompts.kairon;
    
    const systemPrompt = totalChunks > 1 
      ? `${prompt}\n\nIMPORTANTE: Este é o fragmento ${chunkIndex + 1} de ${totalChunks} de um documento maior. Analise este fragmento específico e mencione que é uma análise parcial.`
      : prompt;

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Analise o seguinte fragmento de documento:\n\n${chunk}`
          }
        ],
        max_tokens: config.openai.maxTokens || 1000,
        temperature: config.openai.temperature || 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro da OpenAI API (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Resposta vazia da OpenAI';
  };

  const uploadAndAnalyze = async (file: File, assistantId: string): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      console.log('🤖 Iniciando análise com chunking inteligente');
      console.log('Arquivo:', file.name, 'Assistente:', assistantId);
      
      // Verificar configuração da OpenAI
      if (!config.openai?.apiKey) {
        throw new Error('Chave da OpenAI não configurada. Vá para Configurações → OpenAI para configurar sua API key.');
      }

      if (!config.openai.apiKey.startsWith('sk-')) {
        throw new Error('Chave da OpenAI inválida. Deve começar com "sk-".');
      }
      
      // Ler o conteúdo do arquivo
      const fileContent = await file.text();
      console.log('📄 Arquivo carregado, tamanho:', fileContent.length, 'caracteres');
      
      // Dividir em chunks se necessário
      const chunks = chunkText(fileContent, 100000); // 100K tokens por chunk
      console.log('📊 Documento dividido em', chunks.length, 'fragmentos');

      let analysisResults: string[] = [];

      // Analisar cada chunk
      for (let i = 0; i < chunks.length; i++) {
        console.log(`🔄 Analisando fragmento ${i + 1}/${chunks.length}`);
        
        try {
          const chunkResult = await analyzeChunk(chunks[i], assistantId, i, chunks.length);
          analysisResults.push(`### Fragmento ${i + 1}/${chunks.length}\n\n${chunkResult}`);
        } catch (chunkError) {
          console.error(`❌ Erro no fragmento ${i + 1}:`, chunkError);
          analysisResults.push(`### Fragmento ${i + 1}/${chunks.length}\n\n❌ Erro ao analisar este fragmento: ${chunkError instanceof Error ? chunkError.message : 'Erro desconhecido'}`);
        }

        // Pequena pausa entre chunks para evitar rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Compilar resultado final
      let finalResult = '';
      
      if (chunks.length > 1) {
        finalResult = `# Análise Completa do Documento\n\n**Documento:** ${file.name}\n**Total de fragmentos analisados:** ${chunks.length}\n\n---\n\n${analysisResults.join('\n\n---\n\n')}`;
        
        // Se possível, fazer uma síntese final
        if (analysisResults.length > 1) {
          try {
            console.log('🔄 Gerando síntese final...');
            const synthesisPrompt = `Com base nas análises fragmentadas abaixo, faça uma síntese executiva dos principais pontos encontrados:\n\n${analysisResults.join('\n\n')}`;
            
            const synthesisResult = await analyzeChunk(synthesisPrompt, assistantId, 0, 1);
            finalResult = `# Síntese Executiva\n\n${synthesisResult}\n\n---\n\n${finalResult}`;
          } catch (synthesisError) {
            console.warn('⚠️ Não foi possível gerar síntese:', synthesisError);
          }
        }
      } else {
        finalResult = analysisResults[0];
      }
      
      console.log('✅ Análise completa concluída');
      
      toast({
        title: "Análise concluída!",
        description: `Documento analisado com sucesso em ${chunks.length} fragmento(s)`,
      });
      
      return finalResult;
      
    } catch (error) {
      console.error('❌ Erro na análise:', error);
      
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
