
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { parseDocument } from '@/utils/documentParser';

export function useConversationUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { config } = useClientConfig();

  // Função para dividir texto em chunks pequenos para análise
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

  // Função para analisar chunk com contexto do documento
  const analyzeChunk = async (chunk: string, assistantId: string, chunkIndex: number, totalChunks: number, documentInfo: any): Promise<string> => {
    const assistantPrompts = {
      kairon: 'Analise este fragmento do documento e identifique insights práticos.',
      oracle: 'Analise padrões emocionais e comportamentais neste fragmento.',
      guardian: 'Analise recursos financeiros, custos, oportunidades e dados econômicos neste fragmento.',
      engineer: 'Analise aspectos de saúde, bem-estar e otimização neste fragmento.',
      architect: 'Organize e estruture as informações principais deste fragmento.',
      weaver: 'Analise propósito, significado e conexões neste fragmento.',
      catalyst: 'Identifique oportunidades criativas e inovadoras neste fragmento.',
      mirror: 'Analise padrões relacionais e sociais neste fragmento.'
    };

    const prompt = assistantPrompts[assistantId as keyof typeof assistantPrompts] || assistantPrompts.kairon;
    
    // Contexto do documento para melhor análise
    const contextInfo = totalChunks > 1 
      ? `Este é o fragmento ${chunkIndex + 1} de ${totalChunks} do documento "${documentInfo.fileName}".`
      : `Documento completo: "${documentInfo.fileName}".`;
    
    const systemPrompt = `${prompt} ${contextInfo} Seja conciso (máximo 200 palavras) e foque no conteúdo real do documento.`;

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
            content: chunk
          }
        ],
        max_tokens: 300,
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
      
      // Verificação da API key
      if (!config.openai?.apiKey) {
        throw new Error('❌ API key da OpenAI não configurada');
      }

      if (!config.openai.apiKey.startsWith('sk-')) {
        throw new Error('❌ API key da OpenAI inválida');
      }
      
      // NOVO: Extrair conteúdo real do documento usando o parser
      console.log('📄 Extraindo conteúdo do documento...');
      const parsedDocument = await parseDocument(file);
      
      console.log('✅ Conteúdo extraído com sucesso:', {
        tamanho: parsedDocument.text.length,
        tipo: parsedDocument.metadata.fileType,
        paginas: parsedDocument.metadata.pageCount
      });
      
      // Dividir texto extraído em chunks
      const chunks = chunkText(parsedDocument.text, 8000);
      console.log('📊 Chunks criados:', chunks.length);

      let analysisResults: string[] = [];

      // Analisar cada chunk
      for (let i = 0; i < chunks.length; i++) {
        console.log(`🔄 Analisando chunk ${i + 1}/${chunks.length}`);
        
        try {
          const chunkResult = await analyzeChunk(chunks[i], assistantId, i, chunks.length, parsedDocument.metadata);
          analysisResults.push(chunks.length > 1 ? `**Parte ${i + 1}:**\n${chunkResult}` : chunkResult);
          
          // Pausa entre chunks
          if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (chunkError) {
          console.error(`❌ Erro no chunk ${i + 1}:`, chunkError);
          analysisResults.push(`**Parte ${i + 1}:**\n❌ Erro: ${chunkError instanceof Error ? chunkError.message : 'Erro desconhecido'}`);
        }
      }

      // Resultado final com informações do documento
      const documentSummary = `# Análise REAL de "${parsedDocument.metadata.fileName}"\n\n` +
        `**Tipo:** ${parsedDocument.metadata.fileType}\n` +
        `**Tamanho:** ${(parsedDocument.metadata.fileSize / 1024).toFixed(1)} KB\n` +
        `**Páginas estimadas:** ${parsedDocument.metadata.pageCount}\n\n---\n\n`;
      
      const finalResult = chunks.length > 1 
        ? `${documentSummary}${analysisResults.join('\n\n---\n\n')}`
        : `${documentSummary}${analysisResults[0]}`;
      
      console.log('✅ ANÁLISE REAL CONCLUÍDA');
      
      toast({
        title: "✅ Análise REAL concluída!",
        description: `Documento "${parsedDocument.metadata.fileName}" analisado com sucesso pela OpenAI`,
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
