
export interface ParsedDocument {
  text: string;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
    pageCount?: number;
  };
}

export async function parseDocument(file: File): Promise<ParsedDocument> {
  console.log(`📄 Analisando arquivo: ${file.name} (${file.type})`);

  const metadata = {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  };

  // Verificar se é arquivo de vídeo ou áudio
  if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
    return {
      text: `[${file.type.startsWith('video/') ? 'VÍDEO' : 'ÁUDIO'}] ${file.name}

Este é um arquivo de ${file.type.startsWith('video/') ? 'vídeo' : 'áudio'} que requer processamento especial.

INFORMAÇÕES DO ARQUIVO:
- Nome: ${file.name}
- Tipo: ${file.type}
- Tamanho: ${(file.size / 1024 / 1024).toFixed(2)} MB

NOTA: Para analisar o conteúdo deste ${file.type.startsWith('video/') ? 'vídeo' : 'áudio'}, seria necessário:
1. Transcrição automática do áudio/vídeo
2. Processamento de IA para extrair insights
3. Análise do conteúdo transcrito

Este arquivo foi carregado com sucesso e está pronto para análise quando implementarmos as funcionalidades de transcrição.`,
      metadata
    };
  }

  try {
    let text = '';

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      text = await file.text();
    } 
    else if (file.type === 'application/json' || file.name.endsWith('.json')) {
      const jsonContent = await file.text();
      const parsed = JSON.parse(jsonContent);
      text = JSON.stringify(parsed, null, 2);
    }
    else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      text = await file.text();
    }
    else if (file.name.endsWith('.md')) {
      text = await file.text();
    }
    else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // Para PDFs, usar estratégia avançada de extração de conteúdo
      text = await extractPDFContent(file);
    }
    else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      // Para documentos Word, usar uma abordagem básica
      text = await extractWordText(file);
    }
    else {
      // Para outros tipos, tentar como texto
      try {
        text = await file.text();
      } catch (error) {
        text = `[ARQUIVO BINÁRIO] ${file.name}

Este arquivo parece ser um formato binário que não pode ser lido diretamente como texto.

INFORMAÇÕES DO ARQUIVO:
- Nome: ${file.name}
- Tipo: ${file.type}
- Tamanho: ${(file.size / 1024).toFixed(2)} KB

SUGESTÃO: Tente converter o arquivo para um formato de texto (.txt, .md, .json) antes de fazer o upload.`;
      }
    }

    // Verificar se o texto extraído é válido
    if (!text || text.trim().length < 10) {
      throw new Error('Não foi possível extrair texto suficiente do arquivo');
    }

    // Limpar caracteres especiais e normalizar o texto
    text = cleanExtractedText(text);

    console.log(`✅ Texto extraído com sucesso: ${text.length} caracteres`);

    return {
      text,
      metadata: {
        ...metadata,
        pageCount: estimatePageCount(text)
      }
    };

  } catch (error) {
    console.error(`❌ Erro ao processar arquivo:`, error);
    throw new Error(`Falha ao processar o arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

async function extractPDFContent(file: File): Promise<string> {
  try {
    console.log('🔍 Extraindo conteúdo real do PDF...');
    
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Converter para string usando diferentes encodings
    let pdfText = '';
    try {
      pdfText = new TextDecoder('utf-8').decode(uint8Array);
    } catch {
      pdfText = new TextDecoder('latin1').decode(uint8Array);
    }
    
    let extractedContent = '';
    
    // Método 1: Extrair texto entre parênteses (conteúdo principal)
    const textInParentheses = pdfText.match(/\(([^)]+)\)/g);
    if (textInParentheses) {
      textInParentheses.forEach(match => {
        const content = match.slice(1, -1); // Remove os parênteses
        // Filtrar apenas texto legível (não comandos PDF)
        if (isReadableContent(content)) {
          extractedContent += content + ' ';
        }
      });
    }
    
    // Método 2: Extrair texto após comandos "Tj" (show text)
    const tjMatches = pdfText.match(/\(([^)]*)\)\s*Tj/g);
    if (tjMatches) {
      tjMatches.forEach(match => {
        const content = match.match(/\(([^)]*)\)/)?.[1];
        if (content && isReadableContent(content)) {
          extractedContent += content + ' ';
        }
      });
    }
    
    // Método 3: Procurar por sequências de texto legível
    if (extractedContent.length < 100) {
      console.log('🔍 Usando método alternativo para extrair texto...');
      
      // Dividir o texto em linhas e procurar por conteúdo legível
      const lines = pdfText.split(/[\r\n]+/);
      for (const line of lines) {
        // Procurar por texto entre parênteses ou aspas
        const textMatches = line.match(/[\(\"]([^)\"]{5,})[\)\"]/g);
        if (textMatches) {
          textMatches.forEach(match => {
            const content = match.slice(1, -1);
            if (isReadableContent(content)) {
              extractedContent += content + ' ';
            }
          });
        }
      }
    }
    
    // Método 4: Extração de texto livre (último recurso)
    if (extractedContent.length < 100) {
      console.log('🔍 Usando extração de texto livre...');
      
      // Procurar por sequências de caracteres legíveis
      const readableChunks = pdfText.match(/[A-Za-zÀ-ÿ0-9\s.,!?;:\-()]{20,}/g);
      if (readableChunks) {
        readableChunks.forEach(chunk => {
          const cleanChunk = chunk
            .replace(/[^\w\sÀ-ÿ.,!?;:\-()]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (cleanChunk.length > 15 && isReadableContent(cleanChunk)) {
            extractedContent += cleanChunk + ' ';
          }
        });
      }
    }
    
    // Limpeza final do conteúdo extraído
    extractedContent = extractedContent
      .replace(/\s+/g, ' ') // Normalizar espaços
      .replace(/(.)\1{3,}/g, '$1$1') // Remover repetições excessivas
      .replace(/[^\w\sÀ-ÿ.,!?;:\-()]/g, ' ') // Remover caracteres especiais
      .trim();
    
    console.log(`📄 Conteúdo extraído do PDF: ${extractedContent.length} caracteres`);
    
    // Se ainda não conseguiu extrair conteúdo suficiente
    if (extractedContent.length < 50) {
      return generatePDFContentPlaceholder(file);
    }
    
    return extractedContent;
    
  } catch (error) {
    console.error('❌ Erro na extração de conteúdo do PDF:', error);
    return generatePDFContentPlaceholder(file);
  }
}

function isReadableContent(text: string): boolean {
  // Verificar se o texto contém conteúdo legível
  const cleanText = text.trim();
  
  // Deve ter pelo menos 3 caracteres
  if (cleanText.length < 3) return false;
  
  // Não deve ser apenas números ou comandos PDF
  if (/^[\d\s\.]+$/.test(cleanText)) return false;
  if (/^[A-Z]{1,3}$/.test(cleanText)) return false; // Comandos PDF como "Tj", "BT", etc.
  
  // Deve conter pelo menos algumas letras
  const letterCount = (cleanText.match(/[A-Za-zÀ-ÿ]/g) || []).length;
  const letterRatio = letterCount / cleanText.length;
  
  // Pelo menos 40% deve ser letras
  return letterRatio > 0.4;
}

function generatePDFContentPlaceholder(file: File): string {
  return `DOCUMENTO PDF: ${file.name}

Este documento PDF foi carregado mas o conteúdo de texto não pôde ser extraído automaticamente.

INFORMAÇÕES DO ARQUIVO:
- Nome: ${file.name}
- Tamanho: ${(file.size / 1024).toFixed(2)} KB
- Data de upload: ${new Date().toLocaleDateString('pt-BR')}

RECOMENDAÇÕES PARA ANÁLISE:
1. Este PDF pode conter:
   • Imagens escaneadas que precisam de OCR
   • Texto em formato protegido
   • Conteúdo gráfico ou tabelas complexas

2. Para uma análise completa, considere:
   • Converter o PDF para texto usando OCR
   • Copiar e colar o conteúdo manualmente em um arquivo .txt
   • Usar ferramentas como Adobe Reader para extrair o texto

3. Tipos de conteúdo que poderiam estar neste documento:
   • Relatórios financeiros ou comerciais
   • Contratos e documentos legais
   • Manuais técnicos ou procedimentos
   • Apresentações ou propostas
   • Análises de dados ou estudos

O arquivo foi carregado com sucesso e está pronto para processamento quando o conteúdo de texto estiver disponível.`;
}

async function extractWordText(file: File): Promise<string> {
  try {
    // Para documentos Word, fazer uma extração básica
    const text = await file.text();
    return cleanExtractedText(text);
  } catch (error) {
    console.error('Erro na extração de Word:', error);
    return `[WORD] ${file.name}

Este é um documento Word que requer processamento especial.

INFORMAÇÕES DO ARQUIVO:
- Nome: ${file.name}
- Tamanho: ${(file.size / 1024).toFixed(2)} KB

SUGESTÃO: Para melhor análise, converta o documento para formato .txt ou .md antes do upload.`;
  }
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{3,}/g, ' ')
    .trim();
}

function estimatePageCount(text: string): number {
  // Estimar páginas baseado no número de caracteres (aproximadamente 2000 caracteres por página)
  return Math.max(1, Math.ceil(text.length / 2000));
}
