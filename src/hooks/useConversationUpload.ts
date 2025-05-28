
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

  // Função para dividir texto em chunks MUITO menores para evitar erro de tokens
  const chunkText = (text: string, maxTokens: number = 30000): string[] => {
    const estimatedTokensPerChar = 0.25;
    const maxChars = Math.floor(maxTokens / estimatedTokensPerChar);
    
    if (text.length <= maxChars) {
      return [text];
    }

    const chunks: string[] = [];
    let currentIndex = 0;

    while (currentIndex < text.length) {
      // Procurar por quebras naturais (parágrafos, sentenças)
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

  // Função para analisar um chunk individual com prompt mais enxuto
  const analyzeChunk = async (chunk: string, assistantId: string, chunkIndex: number, totalChunks: number): Promise<string> => {
    const assistantPrompts = {
      kairon: 'Analise este fragmento de forma direta e construtiva. Identifique os principais pontos e dê feedback honesto.',
      oracle: 'Faça uma análise psicológica rápida deste fragmento. Identifique padrões emocionais principais.',
      guardian: 'Analise recursos e energia neste fragmento. Como otimizar?',
      engineer: 'Analise saúde e bem-estar neste fragmento. Que melhorias são necessárias?',
      architect: 'Organize as informações deste fragmento. Identifique prioridades principais.',
      weaver: 'Analise propósito e significado neste fragmento. Como conecta com valores profundos?',
      catalyst: 'Analise para quebrar padrões limitantes. Que mudanças criativas são necessárias?',
      mirror: 'Analise relacionamentos neste fragmento. Que padrões precisam mudar?'
    };

    const prompt = assistantPrompts[assistantId as keyof typeof assistantPrompts] || assistantPrompts.kairon;
    
    const systemPrompt = totalChunks > 1 
      ? `${prompt}\n\nEste é o fragmento ${chunkIndex + 1} de ${totalChunks}. Seja conciso (máximo 200 palavras).`
      : `${prompt}\n\nSeja conciso e direto (máximo 300 palavras).`;

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
            content: `Analise: ${chunk.substring(0, 3000)}...` // Limitar tamanho do input também
          }
        ],
        max_tokens: 500, // Reduzir tokens de resposta
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
      console.log('🤖 Iniciando análise com chunking otimizado');
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
      
      // Dividir em chunks menores (30K tokens por chunk)
      const chunks = chunkText(fileContent, 30000);
      console.log('📊 Documento dividido em', chunks.length, 'fragmentos');

      let analysisResults: string[] = [];

      // Analisar cada chunk
      for (let i = 0; i < chunks.length; i++) {
        console.log(`🔄 Analisando fragmento ${i + 1}/${chunks.length}`);
        
        try {
          const chunkResult = await analyzeChunk(chunks[i], assistantId, i, chunks.length);
          analysisResults.push(`**Fragmento ${i + 1}:**\n${chunkResult}`);
        } catch (chunkError) {
          console.error(`❌ Erro no fragmento ${i + 1}:`, chunkError);
          analysisResults.push(`**Fragmento ${i + 1}:**\n❌ Erro: ${chunkError instanceof Error ? chunkError.message : 'Erro desconhecido'}`);
        }

        // Pausa entre chunks
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      // Compilar resultado final
      let finalResult = '';
      
      if (chunks.length > 1) {
        finalResult = `# Análise do Documento: ${file.name}\n\n${analysisResults.join('\n\n---\n\n')}`;
      } else {
        finalResult = analysisResults[0];
      }
      
      console.log('✅ Análise completa concluída');
      
      toast({
        title: "Análise concluída!",
        description: `Documento analisado com sucesso`,
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
