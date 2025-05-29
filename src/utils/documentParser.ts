
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
      text = await extractPDFTextAdvanced(file);
    }
    else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      text = await extractWordTextAdvanced(file);
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

    // Limpar e validar o texto extraído
    text = cleanAndValidateText(text);

    // Verificar se o texto extraído é válido
    if (!text || text.trim().length < 10) {
      throw new Error('Não foi possível extrair texto suficiente do arquivo');
    }

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

async function extractPDFTextAdvanced(file: File): Promise<string> {
  console.log('🔍 Iniciando extração avançada de PDF...');
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Tentar múltiplas codificações
    let pdfString = '';
    try {
      pdfString = new TextDecoder('utf-8').decode(uint8Array);
    } catch {
      try {
        pdfString = new TextDecoder('latin1').decode(uint8Array);
      } catch {
        pdfString = new TextDecoder('ascii').decode(uint8Array);
      }
    }
    
    console.log('📊 Tamanho do conteúdo PDF:', pdfString.length);
    
    // Estratégias múltiplas de extração
    let extractedText = '';
    
    // Estratégia 1: Texto entre parênteses simples
    extractedText = extractTextFromPDFPatterns(pdfString, /\(([^)]+)\)/g);
    
    // Estratégia 2: Se não conseguiu texto suficiente, tentar comandos Tj
    if (extractedText.length < 100) {
      extractedText = extractTextFromPDFPatterns(pdfString, /\(([^)]*)\)\s*Tj/gi);
    }
    
    // Estratégia 3: Arrays TJ
    if (extractedText.length < 100) {
      extractedText = extractTextFromPDFArrays(pdfString);
    }
    
    // Estratégia 4: Busca por texto livre (última tentativa)
    if (extractedText.length < 100) {
      extractedText = extractFreeTextFromPDF(pdfString);
    }
    
    // Limpeza final rigorosa
    extractedText = cleanPDFTextRigorously(extractedText);
    
    console.log(`📄 Texto final extraído: ${extractedText.length} caracteres`);
    
    // Se ainda não conseguiu extrair texto legível
    if (extractedText.length < 50 || !isTextReadable(extractedText)) {
      console.log('⚠️ Não foi possível extrair texto legível do PDF');
      return generatePDFPlaceholder(file);
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('❌ Erro na extração de PDF:', error);
    return generatePDFPlaceholder(file);
  }
}

function extractTextFromPDFPatterns(pdfString: string, pattern: RegExp): string {
  const matches = pdfString.match(pattern);
  if (!matches) return '';
  
  const textParts = [];
  for (const match of matches) {
    const textMatch = match.match(/\(([^)]*)\)/);
    if (textMatch) {
      let text = cleanPDFTextBasic(textMatch[1]);
      if (isValidTextSegment(text)) {
        textParts.push(text);
      }
    }
  }
  
  return textParts.join(' ');
}

function extractTextFromPDFArrays(pdfString: string): string {
  const tjArrayMatches = pdfString.match(/\[([^\]]*)\]\s*TJ/gi);
  if (!tjArrayMatches) return '';
  
  const textParts = [];
  for (const match of tjArrayMatches) {
    const arrayContent = match.match(/\[([^\]]*)\]/);
    if (arrayContent) {
      const textMatches = arrayContent[1].match(/\(([^)]*)\)/g);
      if (textMatches) {
        for (const textMatch of textMatches) {
          let text = cleanPDFTextBasic(textMatch.slice(1, -1));
          if (isValidTextSegment(text)) {
            textParts.push(text);
          }
        }
      }
    }
  }
  
  return textParts.join(' ');
}

function extractFreeTextFromPDF(pdfString: string): string {
  // Procurar por sequências de texto legível
  const textMatches = pdfString.match(/[A-Za-zÀ-ÿ0-9\s\.,!?;:]{10,}/g);
  if (!textMatches) return '';
  
  const validTexts = textMatches
    .filter(text => isTextReadable(text))
    .filter(text => !isPDFCommand(text))
    .slice(0, 50); // Limitar para evitar excesso
  
  return validTexts.join(' ');
}

function cleanPDFTextBasic(text: string): string {
  return text
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanPDFTextRigorously(text: string): string {
  return text
    // Remover códigos de escape e caracteres de controle
    .replace(/\\[nrt]/g, ' ')
    .replace(/\\\([)]/g, '')
    .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
    // Remover símbolos e caracteres especiais em excesso
    .replace(/[^\w\sÀ-ÿ\.,!?;:\-()]/g, ' ')
    // Remover sequências de símbolos
    .replace(/[^\w\s]{3,}/g, ' ')
    // Normalizar espaços
    .replace(/\s+/g, ' ')
    .trim();
}

function isValidTextSegment(text: string): boolean {
  if (!text || text.length < 2) return false;
  
  // Filtrar comandos PDF
  if (isPDFCommand(text)) return false;
  
  // Filtrar apenas números ou coordenadas
  if (/^[\d\s\.\-]+$/.test(text)) return false;
  
  // Deve ter letras suficientes
  const letterCount = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
  return letterCount >= 2 && letterCount > text.length * 0.3;
}

function isPDFCommand(text: string): boolean {
  const pdfCommands = [
    'BT', 'ET', 'Tj', 'TJ', 'Td', 'TD', 'Tm', 'T*', 'Tf', 'TL',
    'obj', 'endobj', 'stream', 'endstream', 'xref', 'trailer',
    'startxref', 'PDF', 'Type', 'Font', 'Page', 'Kids', 'Parent'
  ];
  
  const cleanText = text.trim().toUpperCase();
  return pdfCommands.some(cmd => cleanText === cmd || cleanText.includes(cmd));
}

function isTextReadable(text: string): boolean {
  if (!text || text.length < 5) return false;
  
  // Verificar se tem conteúdo legível
  const readableChars = text.match(/[a-zA-ZÀ-ÿ0-9\s\.,!?;:]/g) || [];
  const totalChars = text.length;
  
  // Pelo menos 80% deve ser legível
  return (readableChars.length / totalChars) > 0.8;
}

function generatePDFPlaceholder(file: File): string {
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

async function extractWordTextAdvanced(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Tentar extrair texto de documento Word
    let text = '';
    
    try {
      // Tentar UTF-8 primeiro
      text = new TextDecoder('utf-8').decode(uint8Array);
    } catch {
      try {
        // Fallback para latin1
        text = new TextDecoder('latin1').decode(uint8Array);
      } catch {
        // Último fallback
        text = new TextDecoder('ascii').decode(uint8Array);
      }
    }
    
    // Extrair texto legível do conteúdo Word
    const readableText = extractReadableTextFromWord(text);
    
    if (readableText && readableText.length > 50) {
      return readableText;
    }
    
    throw new Error('Não foi possível extrair texto do documento Word');
    
  } catch (error) {
    console.error('Erro na extração de Word:', error);
    return `[DOCUMENTO WORD] ${file.name}

Este é um documento Word que requer processamento especial.

INFORMAÇÕES DO ARQUIVO:
- Nome: ${file.name}
- Tamanho: ${(file.size / 1024).toFixed(2)} KB

SUGESTÕES PARA ANÁLISE:
1. 📄 Copie o texto do documento e cole em um arquivo .txt
2. 🔄 Salve o documento como .txt no Word
3. 📤 Use Google Docs para converter automaticamente

NOTA: Documentos .docx são arquivos compactados que precisam de processamento especial para extração de texto.`;
  }
}

function extractReadableTextFromWord(content: string): string {
  // Procurar por texto legível no conteúdo XML do Word
  const textMatches = content.match(/>([^<]{10,})</g);
  if (!textMatches) return '';
  
  const textParts = [];
  for (const match of textMatches) {
    const text = match.slice(1, -1); // Remove > e <
    if (isTextReadable(text) && !text.includes('xml') && !text.includes('docx')) {
      textParts.push(text.trim());
    }
  }
  
  return textParts.join(' ').replace(/\s+/g, ' ').trim();
}

function cleanAndValidateText(text: string): string {
  // Limpeza geral para todos os tipos de arquivo
  return text
    // Normalizar quebras de linha
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remover caracteres de controle problemáticos
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    // Remover sequências excessivas de símbolos especiais
    .replace(/[^\w\sÀ-ÿ\.,!?;:\-()]{5,}/g, ' ')
    // Normalizar espaços
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{3,}/g, ' ')
    .trim();
}

function estimatePageCount(text: string): number {
  return Math.max(1, Math.ceil(text.length / 2000));
}
