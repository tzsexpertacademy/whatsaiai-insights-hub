
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
      text = await extractPDFTextRobust(file);
    }
    else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      text = await extractWordTextRobust(file);
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

    // Verificar se o texto extraído é válido e legível
    if (!isTextMeaningful(text)) {
      throw new Error('Não foi possível extrair texto legível do arquivo');
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

async function extractPDFTextRobust(file: File): Promise<string> {
  console.log('🔍 Iniciando extração robusta de PDF...');
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Converter para string usando diferentes codificações
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
    
    // Nova estratégia: extrair apenas texto entre comandos de texto específicos
    let extractedText = '';
    
    // Estratégia 1: Buscar por strings entre parênteses que sejam texto real
    const textBetweenParens = extractMeaningfulTextFromParens(pdfString);
    if (textBetweenParens.length > 50) {
      extractedText = textBetweenParens;
    }
    
    // Estratégia 2: Se ainda não temos texto bom, tentar comandos TJ
    if (extractedText.length < 50) {
      const tjText = extractTextFromTJCommands(pdfString);
      if (tjText.length > 50) {
        extractedText = tjText;
      }
    }
    
    // Estratégia 3: Buscar por sequências de palavras em português
    if (extractedText.length < 50) {
      const portugueseText = extractPortugueseText(pdfString);
      if (portugueseText.length > 50) {
        extractedText = portugueseText;
      }
    }
    
    // Limpeza final super rigorosa
    extractedText = superCleanText(extractedText);
    
    console.log(`📄 Texto final extraído: ${extractedText.length} caracteres`);
    
    // Validação final: verificar se é texto real
    if (!isTextMeaningful(extractedText)) {
      console.log('⚠️ Texto extraído não é legível');
      return generateErrorMessage(file, 'PDF_NOT_READABLE');
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('❌ Erro na extração de PDF:', error);
    return generateErrorMessage(file, 'PDF_EXTRACTION_ERROR');
  }
}

function extractMeaningfulTextFromParens(pdfString: string): string {
  const parenMatches = pdfString.match(/\(([^)]{3,})\)/g);
  if (!parenMatches) return '';
  
  const meaningfulTexts = [];
  
  for (const match of parenMatches) {
    const text = match.slice(1, -1); // Remove ( e )
    const cleaned = cleanBasicText(text);
    
    // Verificar se é texto real (tem letras e não são apenas códigos)
    if (isMeaningfulTextSegment(cleaned)) {
      meaningfulTexts.push(cleaned);
    }
  }
  
  return meaningfulTexts.join(' ');
}

function extractTextFromTJCommands(pdfString: string): string {
  const tjMatches = pdfString.match(/\[([^\]]+)\]\s*TJ/gi);
  if (!tjMatches) return '';
  
  const meaningfulTexts = [];
  
  for (const match of tjMatches) {
    const arrayContent = match.match(/\[([^\]]+)\]/);
    if (arrayContent) {
      const textInArray = arrayContent[1].match(/\(([^)]+)\)/g);
      if (textInArray) {
        for (const textMatch of textInArray) {
          const text = textMatch.slice(1, -1);
          const cleaned = cleanBasicText(text);
          if (isMeaningfulTextSegment(cleaned)) {
            meaningfulTexts.push(cleaned);
          }
        }
      }
    }
  }
  
  return meaningfulTexts.join(' ');
}

function extractPortugueseText(pdfString: string): string {
  // Procurar por sequências que parecem palavras em português
  const wordPattern = /[A-Za-zÀ-ÿçÇ]{3,}(?:\s+[A-Za-zÀ-ÿçÇ.,!?;:]{1,}){2,}/g;
  const matches = pdfString.match(wordPattern);
  
  if (!matches) return '';
  
  const meaningfulTexts = matches
    .filter(text => isMeaningfulTextSegment(text))
    .filter(text => !containsPDFCommands(text))
    .slice(0, 100); // Limitar
  
  return meaningfulTexts.join(' ');
}

function isMeaningfulTextSegment(text: string): boolean {
  if (!text || text.length < 3) return false;
  
  // Deve ter pelo menos algumas letras
  const letterCount = (text.match(/[a-zA-ZÀ-ÿçÇ]/g) || []).length;
  if (letterCount < 3) return false;
  
  // Não deve ser apenas números ou códigos
  if (/^[\d\s\.\-_#]+$/.test(text)) return false;
  
  // Não deve conter muitos caracteres especiais consecutivos
  if (/[^\w\sÀ-ÿçÇ\.,!?;:\-()]{3,}/.test(text)) return false;
  
  // Deve parecer com texto real (proporção de letras)
  const totalChars = text.length;
  const letterRatio = letterCount / totalChars;
  
  return letterRatio > 0.5;
}

function containsPDFCommands(text: string): boolean {
  const pdfCommands = [
    'obj', 'endobj', 'stream', 'endstream', 'xref', 'trailer',
    'startxref', 'PDF', 'Type', 'Font', 'Page', 'Kids', 'Parent',
    'BT', 'ET', 'Tj', 'TJ', 'Td', 'TD', 'Tm', 'Tf'
  ];
  
  const upperText = text.toUpperCase();
  return pdfCommands.some(cmd => upperText.includes(cmd));
}

function cleanBasicText(text: string): string {
  return text
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .trim();
}

function superCleanText(text: string): string {
  return text
    // Remover códigos de escape
    .replace(/\\[nrt]/g, ' ')
    .replace(/\\\([)]/g, '')
    
    // Remover caracteres de controle
    .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
    
    // Manter apenas caracteres legíveis
    .replace(/[^\w\sÀ-ÿçÇ\.,!?;:\-()]/g, ' ')
    
    // Normalizar espaços
    .replace(/\s+/g, ' ')
    .trim();
}

function isTextMeaningful(text: string): boolean {
  if (!text || text.length < 20) return false;
  
  // Verificar se tem palavras reais
  const words = text.split(/\s+/).filter(word => word.length > 2);
  if (words.length < 5) return false;
  
  // Verificar proporção de letras
  const letters = (text.match(/[a-zA-ZÀ-ÿçÇ]/g) || []).length;
  const totalChars = text.length;
  const letterRatio = letters / totalChars;
  
  // Pelo menos 60% deve ser letras
  return letterRatio > 0.6;
}

async function extractWordTextRobust(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let text = '';
    
    try {
      text = new TextDecoder('utf-8').decode(uint8Array);
    } catch {
      try {
        text = new TextDecoder('latin1').decode(uint8Array);
      } catch {
        text = new TextDecoder('ascii').decode(uint8Array);
      }
    }
    
    // Extrair texto de documento Word (XML)
    const extractedText = extractTextFromWordXML(text);
    
    if (extractedText && extractedText.length > 20) {
      return superCleanText(extractedText);
    }
    
    throw new Error('Não foi possível extrair texto do documento Word');
    
  } catch (error) {
    console.error('Erro na extração de Word:', error);
    return generateErrorMessage(file, 'WORD_EXTRACTION_ERROR');
  }
}

function extractTextFromWordXML(content: string): string {
  // Procurar por conteúdo entre tags XML que pareça texto
  const xmlTextMatches = content.match(/>([^<]{5,})</g);
  if (!xmlTextMatches) return '';
  
  const meaningfulTexts = [];
  
  for (const match of xmlTextMatches) {
    const text = match.slice(1, -1); // Remove > e <
    const cleaned = superCleanText(text);
    
    if (isMeaningfulTextSegment(cleaned) && !containsXMLOrWordCommands(cleaned)) {
      meaningfulTexts.push(cleaned);
    }
  }
  
  return meaningfulTexts.join(' ');
}

function containsXMLOrWordCommands(text: string): boolean {
  const commands = ['xml', 'docx', 'word', 'document', 'rels', 'content'];
  const lowerText = text.toLowerCase();
  return commands.some(cmd => lowerText.includes(cmd));
}

function generateErrorMessage(file: File, errorType: string): string {
  const messages = {
    PDF_NOT_READABLE: `❌ PDF NÃO LEGÍVEL: ${file.name}

Este PDF não contém texto extraível. Possíveis causas:
• PDF criado a partir de imagem escaneada
• PDF com proteção contra cópia
• PDF com texto em formato gráfico

SOLUÇÕES:
1. 📋 Copie o texto manualmente do PDF
2. 🔄 Use OCR se for PDF escaneado
3. 💾 Salve como texto no Adobe Reader`,

    PDF_EXTRACTION_ERROR: `❌ ERRO AO PROCESSAR PDF: ${file.name}

Não foi possível extrair o conteúdo do PDF.

SOLUÇÕES:
1. 📄 Tente salvar o PDF como arquivo de texto
2. 📋 Copie o conteúdo manualmente
3. 🔄 Verifique se o arquivo não está corrompido`,

    WORD_EXTRACTION_ERROR: `❌ ERRO AO PROCESSAR WORD: ${file.name}

Não foi possível extrair o conteúdo do documento Word.

SOLUÇÕES:
1. 📄 Salve o documento como .txt
2. 📋 Copie o conteúdo manualmente
3. 🔄 Tente abrir no Google Docs e salvar como texto`
  };

  return messages[errorType as keyof typeof messages] || 
    `❌ Erro ao processar ${file.name}. Tente converter para formato .txt primeiro.`;
}

function cleanAndValidateText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    .replace(/[^\w\sÀ-ÿçÇ\.,!?;:\-()]{5,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{3,}/g, ' ')
    .trim();
}

function estimatePageCount(text: string): number {
  return Math.max(1, Math.ceil(text.length / 2000));
}
