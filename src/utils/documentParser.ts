
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
      text = await extractAdvancedPDFContent(file);
    }
    else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      text = await extractWordText(file);
    }
    else {
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

async function extractAdvancedPDFContent(file: File): Promise<string> {
  console.log('🔍 Iniciando extração avançada de PDF...');
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfContent = new TextDecoder('latin1').decode(uint8Array);
    
    console.log('📊 Tamanho do PDF:', pdfContent.length, 'caracteres');
    
    let extractedText = '';
    
    // Método 1: Extrair texto de objetos stream (mais comum em PDFs modernos)
    const streamMatches = pdfContent.match(/stream\s*([\s\S]*?)\s*endstream/gi);
    console.log('🔍 Encontrados', streamMatches?.length || 0, 'streams');
    
    if (streamMatches) {
      for (const stream of streamMatches) {
        const streamContent = stream.replace(/^stream\s*|\s*endstream$/gi, '');
        
        // Tentar extrair texto legível do stream
        const readableText = extractReadableTextFromStream(streamContent);
        if (readableText && readableText.length > 10) {
          extractedText += readableText + '\n';
        }
      }
    }
    
    // Método 2: Extrair texto entre parênteses (formato comum de texto em PDF)
    if (extractedText.length < 100) {
      console.log('🔍 Usando método de extração por parênteses...');
      const textMatches = pdfContent.match(/\(([^)]{3,})\)/g);
      
      if (textMatches) {
        const uniqueTexts = new Set<string>();
        
        textMatches.forEach(match => {
          let text = match.slice(1, -1); // Remove parênteses
          
          // Decodificar caracteres especiais
          text = decodePDFText(text);
          
          // Filtrar apenas texto legível
          if (isValidPDFText(text)) {
            uniqueTexts.add(text);
          }
        });
        
        extractedText = Array.from(uniqueTexts).join(' ');
      }
    }
    
    // Método 3: Extrair texto após comandos Tj e TJ (comandos de texto em PDF)
    if (extractedText.length < 100) {
      console.log('🔍 Usando método de extração por comandos Tj/TJ...');
      
      // Padrão para comandos Tj (show text)
      const tjMatches = pdfContent.match(/\(([^)]*)\)\s*Tj/gi);
      if (tjMatches) {
        tjMatches.forEach(match => {
          const text = match.match(/\(([^)]*)\)/)?.[1];
          if (text && isValidPDFText(text)) {
            extractedText += decodePDFText(text) + ' ';
          }
        });
      }
      
      // Padrão para comandos TJ (show text with individual glyph positioning)
      const tjArrayMatches = pdfContent.match(/\[([^\]]*)\]\s*TJ/gi);
      if (tjArrayMatches) {
        tjArrayMatches.forEach(match => {
          const arrayContent = match.match(/\[([^\]]*)\]/)?.[1];
          if (arrayContent) {
            const texts = arrayContent.match(/\(([^)]*)\)/g);
            if (texts) {
              texts.forEach(textMatch => {
                const text = textMatch.slice(1, -1);
                if (isValidPDFText(text)) {
                  extractedText += decodePDFText(text) + ' ';
                }
              });
            }
          }
        });
      }
    }
    
    // Método 4: Busca por padrões de texto legível (último recurso)
    if (extractedText.length < 50) {
      console.log('🔍 Usando busca por padrões de texto legível...');
      
      // Procurar por sequências de texto em português/inglês
      const textPatterns = [
        /[A-ZÀ-Ÿ][a-zA-ZÀ-ÿ\s]{10,}/g,  // Textos que começam com maiúscula
        /[a-zA-ZÀ-ÿ]{3,}[\s][a-zA-ZÀ-ÿ\s]{10,}/g,  // Palavras seguidas de texto
        /\b[A-ZÀ-Ÿ][a-zA-ZÀ-ÿ]*[\s][a-zA-ZÀ-ÿ\s,\.]{15,}/g  // Parágrafo-like text
      ];
      
      textPatterns.forEach(pattern => {
        const matches = pdfContent.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const cleanMatch = match.replace(/[^\w\sÀ-ÿ.,!?;:\-()]/g, ' ')
                                   .replace(/\s+/g, ' ')
                                   .trim();
            if (cleanMatch.length > 15 && isValidPDFText(cleanMatch)) {
              extractedText += cleanMatch + ' ';
            }
          });
        }
      });
    }
    
    // Limpeza final e validação
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/(.)\1{4,}/g, '$1$1')  // Remove repetições excessivas
      .trim();
    
    console.log(`📄 Texto extraído do PDF: ${extractedText.length} caracteres`);
    
    // Se ainda não conseguiu extrair conteúdo suficiente
    if (extractedText.length < 50) {
      console.log('⚠️ Pouco texto extraído, gerando placeholder...');
      return generateAdvancedPDFPlaceholder(file);
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('❌ Erro na extração avançada de PDF:', error);
    return generateAdvancedPDFPlaceholder(file);
  }
}

function extractReadableTextFromStream(streamContent: string): string {
  // Tentar diferentes métodos de decodificação para streams
  let readable = '';
  
  // Método 1: Procurar por texto entre parênteses no stream
  const textInParens = streamContent.match(/\(([^)]+)\)/g);
  if (textInParens) {
    textInParens.forEach(match => {
      const text = match.slice(1, -1);
      if (isValidPDFText(text)) {
        readable += decodePDFText(text) + ' ';
      }
    });
  }
  
  // Método 2: Procurar por comandos de texto
  const tjCommands = streamContent.match(/\(([^)]*)\)\s*Tj/gi);
  if (tjCommands) {
    tjCommands.forEach(cmd => {
      const text = cmd.match(/\(([^)]*)\)/)?.[1];
      if (text && isValidPDFText(text)) {
        readable += decodePDFText(text) + ' ';
      }
    });
  }
  
  return readable.trim();
}

function decodePDFText(text: string): string {
  // Decodificar caracteres especiais comuns em PDFs
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\(/g, '(')
    .replace(/\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\([0-7]{3})/g, (match, octal) => String.fromCharCode(parseInt(octal, 8)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/[^\x20-\x7E\u00C0-\u017F\u0100-\u024F]/g, ' ') // Manter apenas caracteres legíveis
    .replace(/\s+/g, ' ')
    .trim();
}

function isValidPDFText(text: string): boolean {
  if (!text || text.length < 2) return false;
  
  // Filtrar comandos PDF e texto técnico
  const technicalPatterns = [
    /^[A-Z]{1,3}$/,  // Comandos PDF como BT, ET, Tj
    /^\d+(\.\d+)?\s*\d+(\.\d+)?\s*\d+(\.\d+)?/,  // Coordenadas
    /^[0-9\s\.]+$/,  // Apenas números
    /^[\/\[\]<>]+$/,  // Apenas símbolos PDF
    /^(obj|endobj|stream|endstream)$/i,  // Palavras-chave PDF
    /^[a-f0-9]{8,}$/i,  // Hashes hexadecimais
  ];
  
  for (const pattern of technicalPatterns) {
    if (pattern.test(text.trim())) {
      return false;
    }
  }
  
  // Deve ter pelo menos algumas letras
  const letterCount = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
  const letterRatio = letterCount / text.length;
  
  // Pelo menos 50% deve ser letras ou espaços
  return letterRatio > 0.3 && text.length > 2;
}

function generateAdvancedPDFPlaceholder(file: File): string {
  return `DOCUMENTO PDF: ${file.name}

❌ ATENÇÃO: Não foi possível extrair o texto deste PDF automaticamente.

POSSÍVEIS CAUSAS:
• PDF criado a partir de imagem escaneada (precisa de OCR)
• PDF com proteção de cópia
• PDF com codificação especial
• PDF com texto em formato gráfico

SOLUÇÕES RECOMENDADAS:
1. 📄 Copie o texto manualmente do PDF e cole em um arquivo .txt
2. 🔄 Converta o PDF para texto usando:
   • Adobe Reader (Arquivo > Exportar para > Texto)
   • Google Docs (upload + conversão automática)
   • Ferramentas online de PDF para texto
3. 📱 Use OCR se for PDF escaneado

INFORMAÇÕES DO ARQUIVO:
• Nome: ${file.name}
• Tamanho: ${(file.size / 1024).toFixed(1)} KB
• Data: ${new Date().toLocaleDateString('pt-BR')}

💡 DICA: Para análise eficaz, o arquivo precisa conter texto extraível. 
PDFs escaneados aparecem como imagens e precisam de OCR para extração de texto.`;
}

async function extractWordText(file: File): Promise<string> {
  try {
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
  return Math.max(1, Math.ceil(text.length / 2000));
}
