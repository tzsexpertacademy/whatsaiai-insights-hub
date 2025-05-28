
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useClientConfig } from '@/contexts/ClientConfigContext';

export function useConversationUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { config } = useClientConfig();

  // Função para dividir texto em chunks MUITO pequenos (8K tokens máximo)
  const chunkText = (text: string, maxTokens: number = 8000): string[] => {
    const estimatedTokensPerChar = 0.25;
    const maxChars = Math.floor(maxTokens / estimatedTokensPerChar);
    
    if (text.length <= maxChars) {
      return [text];
    }

    const chunks: string[] = [];
    let currentIndex = 0;

    while (currentIndex < text.length) {
      let chunkEnd = currentIndex + maxChars;
      
      if (chunkEnd < text.length) {
        // Tentar quebrar em parágrafo
        const lastParagraph = text.lastIndexOf('\n\n', chunkEnd);
        if (lastParagraph > currentIndex) {
          chunkEnd = lastParagraph;
        } else {
          // Tentar quebrar em sentença
          const lastSentence = text.lastIndexOf('.', chunkEnd);
          if (lastSentence > currentIndex) {
            chunkEnd = lastSentence + 1;
          }
        }
      }
      
      const chunk = text.slice(currentIndex, chunkEnd);
      chunks.push(chunk);
      currentIndex = chunkEnd;
    }

    return chunks;
  };

  // Função SIMPLIFICADA para analisar chunk
  const analyzeChunk = async (chunk: string, assistantId: string, chunkIndex: number, totalChunks: number): Promise<string> => {
    const assistantPrompts = {
      kairon: 'Analise de forma direta este fragmento. Identifique insights práticos.',
      oracle: 'Analise padrões emocionais neste fragmento.',
      guardian: 'Analise recursos e oportunidades neste fragmento.',
      engineer: 'Analise saúde e bem-estar neste fragmento.',
      architect: 'Organize as informações principais deste fragmento.',
      weaver: 'Analise propósito e significado neste fragmento.',
      catalyst: 'Identifique oportunidades criativas neste fragmento.',
      mirror: 'Analise padrões relacionais neste fragmento.'
    };

    const prompt = assistantPrompts[assistantId as keyof typeof assistantPrompts] || assistantPrompts.kairon;
    
    // Prompt MUITO mais enxuto
    const systemPrompt = `${prompt} Seja conciso (máximo 150 palavras).`;

    // Limitar drasticamente o input
    const limitedContent = chunk.substring(0, 2000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openai.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: limitedContent
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro da OpenAI API (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Resposta vazia';
  };

  const uploadAndAnalyze = async (file: File, assistantId: string): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      console.log('🔥 ANÁLISE REAL INICIADA - OpenAI API');
      console.log('Arquivo:', file.name, 'Assistente:', assistantId);
      
      // Verificação RIGOROSA da API key
      if (!config.openai?.apiKey) {
        throw new Error('❌ API key da OpenAI não configurada');
      }

      if (!config.openai.apiKey.startsWith('sk-')) {
        throw new Error('❌ API key da OpenAI inválida');
      }
      
      // Ler arquivo
      const fileContent = await file.text();
      console.log('📄 Conteúdo carregado:', fileContent.length, 'caracteres');
      
      // Dividir em chunks pequenos (8K tokens)
      const chunks = chunkText(fileContent, 8000);
      console.log('📊 Chunks criados:', chunks.length);

      let analysisResults: string[] = [];

      // Analisar cada chunk com pausa
      for (let i = 0; i < chunks.length; i++) {
        console.log(`🔄 Analisando chunk ${i + 1}/${chunks.length}`);
        
        try {
          const chunkResult = await analyzeChunk(chunks[i], assistantId, i, chunks.length);
          analysisResults.push(`**Parte ${i + 1}:**\n${chunkResult}`);
          
          // Pausa entre chunks
          if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (chunkError) {
          console.error(`❌ Erro no chunk ${i + 1}:`, chunkError);
          analysisResults.push(`**Parte ${i + 1}:**\n❌ Erro: ${chunkError instanceof Error ? chunkError.message : 'Erro desconhecido'}`);
        }
      }

      // Resultado final
      const finalResult = chunks.length > 1 
        ? `# Análise REAL por IA\n\n${analysisResults.join('\n\n---\n\n')}`
        : analysisResults[0];
      
      console.log('✅ ANÁLISE REAL CONCLUÍDA');
      
      toast({
        title: "✅ Análise REAL concluída!",
        description: `Analisado pela OpenAI com sucesso`,
      });
      
      return finalResult;
      
    } catch (error) {
      console.error('❌ ERRO NA ANÁLISE REAL:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: "❌ Erro na análise REAL",
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
