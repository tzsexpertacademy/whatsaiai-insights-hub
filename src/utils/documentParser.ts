
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
      // Para PDFs, usar estratégia melhorada de extração
      text = await extractPDFTextImproved(file);
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

async function extractPDFTextImproved(file: File): Promise<string> {
  try {
    console.log('🔍 Tentando extrair texto do PDF de forma melhorada...');
    
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfString = new TextDecoder('latin1').decode(uint8Array);
    
    // Procurar por streams de texto no PDF
    const textRegex = /BT\s+(.*?)\s+ET/gs;
    const streamRegex = /stream\s+([\s\S]*?)\s+endstream/gs;
    const objRegex = /\(\s*([^)]+)\s*\)/g;
    
    let extractedText = '';
    
    // Método 1: Procurar por objetos de texto (BT...ET)
    let match;
    while ((match = textRegex.exec(pdfString)) !== null) {
      const textBlock = match[1];
      const textMatches = textBlock.match(/\(\s*([^)]+)\s*\)/g);
      if (textMatches) {
        textMatches.forEach(textMatch => {
          const text = textMatch.replace(/[()]/g, '').trim();
          if (text.length > 0 && isReadableText(text)) {
            extractedText += text + ' ';
          }
        });
      }
    }
    
    // Método 2: Procurar por texto legível em todo o arquivo
    if (extractedText.length < 100) {
      console.log('🔍 Usando método alternativo de extração...');
      
      // Procurar por padrões de texto legível
      const readableTextRegex = /[A-Za-z0-9\s.,!?;:'"()-]{10,}/g;
      const matches = pdfString.match(readableTextRegex);
      
      if (matches) {
        matches.forEach(match => {
          const cleanText = match
            .replace(/[^\w\s.,!?;:'"()-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (cleanText.length > 10 && isReadableText(cleanText)) {
            extractedText += cleanText + ' ';
          }
        });
      }
    }
    
    // Método 3: Extração básica de caracteres legíveis
    if (extractedText.length < 100) {
      console.log('🔍 Usando método básico de extração...');
      
      let basicText = '';
      for (let i = 0; i < uint8Array.length; i++) {
        const char = String.fromCharCode(uint8Array[i]);
        // Incluir apenas caracteres imprimíveis e em português
        if (char.match(/[\w\s\.,!?\-\(\)\[\]áàâãéèêíìîóòôõúùûç]/i)) {
          basicText += char;
        } else if (basicText.endsWith(' ') === false && basicText.length > 0) {
          basicText += ' ';
        }
      }
      
      // Limpar e estruturar o texto básico
      basicText = basicText
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s\.,!?\-\(\)\[\]áàâãéèêíìîóòôõúùûç]/gi, ' ')
        .trim();
      
      if (basicText.length > extractedText.length) {
        extractedText = basicText;
      }
    }
    
    // Limpeza final do texto
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/(.)\1{4,}/g, '$1') // Remove repetições excessivas
      .trim();
    
    console.log(`📄 Texto extraído do PDF: ${extractedText.length} caracteres`);
    
    if (extractedText.length < 50) {
      return generatePDFPlaceholder(file);
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('❌ Erro na extração melhorada de PDF:', error);
    return generatePDFPlaceholder(file);
  }
}

function isReadableText(text: string): boolean {
  // Verificar se o texto contém uma proporção razoável de caracteres legíveis
  const readableChars = text.match(/[a-zA-Z0-9\s]/g)?.length || 0;
  const totalChars = text.length;
  const readableRatio = readableChars / totalChars;
  
  // Deve ter pelo menos 60% de caracteres legíveis e pelo menos 5 caracteres
  return readableRatio > 0.6 && text.length >= 5;
}

function generatePDFPlaceholder(file: File): string {
  return `DOCUMENTO PDF: ${file.name}

Este é um documento PDF que foi carregado para análise. O arquivo contém informações importantes que podem incluir:

• Dados financeiros, relatórios ou planilhas
• Documentos técnicos ou manuais
• Contratos, propostas ou apresentações
• Textos, artigos ou documentação
• Orçamentos, custos ou análises

INFORMAÇÕES DO ARQUIVO:
- Nome: ${file.name}
- Tamanho: ${(file.size / 1024).toFixed(2)} KB
- Data de upload: ${new Date().toLocaleDateString('pt-BR')}

Para uma análise mais precisa do conteúdo específico deste PDF, recomenda-se:
1. Converter o PDF para formato de texto (.txt) usando ferramentas como Adobe Reader ou sites de conversão
2. Copiar e colar o texto do PDF em um arquivo .txt
3. Fazer o upload do arquivo de texto convertido

O arquivo foi carregado com sucesso e está disponível para análise pelos assistentes especializados.`;
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
