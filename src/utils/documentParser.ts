
/**
 * Utilitário para extrair texto de diferentes formatos de documento
 */

export interface ParsedDocument {
  text: string;
  metadata: {
    fileName: string;
    fileSize: number;
    fileType: string;
    pageCount?: number;
  };
}

/**
 * Extrai texto limpo de diferentes tipos de arquivo
 */
export async function parseDocument(file: File): Promise<ParsedDocument> {
  const fileName = file.name;
  const fileSize = file.size;
  const fileType = file.type || getFileTypeFromExtension(fileName);
  
  console.log(`📄 Analisando arquivo: ${fileName} (${fileType})`);

  try {
    let extractedText = '';
    
    // Determinar método de extração baseado no tipo de arquivo
    if (fileType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      extractedText = await extractPdfText(file);
    } else if (fileType.includes('text') || fileName.toLowerCase().endsWith('.txt')) {
      extractedText = await extractPlainText(file);
    } else if (fileName.toLowerCase().endsWith('.md')) {
      extractedText = await extractMarkdownText(file);
    } else if (fileType.includes('json') || fileName.toLowerCase().endsWith('.json')) {
      extractedText = await extractJsonText(file);
    } else if (fileType.includes('csv') || fileName.toLowerCase().endsWith('.csv')) {
      extractedText = await extractCsvText(file);
    } else if (fileType.includes('word') || fileName.toLowerCase().match(/\.(doc|docx)$/)) {
      extractedText = await extractWordText(file);
    } else {
      // Fallback: tentar como texto simples
      extractedText = await extractPlainText(file);
    }

    // Limpar e validar o texto extraído
    const cleanedText = cleanExtractedText(extractedText);
    
    if (!cleanedText || cleanedText.length < 10) {
      throw new Error(`Não foi possível extrair texto legível do arquivo ${fileName}`);
    }

    console.log(`✅ Texto extraído com sucesso: ${cleanedText.length} caracteres`);

    return {
      text: cleanedText,
      metadata: {
        fileName,
        fileSize,
        fileType,
        pageCount: estimatePageCount(cleanedText)
      }
    };

  } catch (error) {
    console.error(`❌ Erro ao processar ${fileName}:`, error);
    throw new Error(`Erro ao processar ${fileName}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Extrai texto de PDF (simulado - em produção usaria pdf-parse ou similar)
 */
async function extractPdfText(file: File): Promise<string> {
  // Para esta versão, vamos simular extração de PDF
  // Em produção real, seria necessário usar uma biblioteca como pdf-parse
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Converter para string e tentar extrair texto legível
  let text = '';
  for (let i = 0; i < uint8Array.length; i++) {
    const char = String.fromCharCode(uint8Array[i]);
    // Manter apenas caracteres legíveis
    if (char.match(/[a-zA-Z0-9\s\-.,;:()[\]{}\/\\@#$%&*+=?!'"]/)) {
      text += char;
    }
  }
  
  // Limpar sequências muito longas de caracteres repetidos
  text = text.replace(/(.)\1{10,}/g, '$1');
  
  // Extrair linhas que parecem ter conteúdo real
  const lines = text.split(/\r?\n/).filter(line => {
    const trimmed = line.trim();
    return trimmed.length > 3 && 
           trimmed.match(/[a-zA-Z]/) && 
           !trimmed.match(/^[^a-zA-Z]*$/);
  });
  
  if (lines.length === 0) {
    throw new Error('PDF não contém texto extraível ou está criptografado');
  }
  
  return lines.join('\n');
}

/**
 * Extrai texto simples
 */
async function extractPlainText(file: File): Promise<string> {
  return await file.text();
}

/**
 * Extrai texto de Markdown
 */
async function extractMarkdownText(file: File): Promise<string> {
  const text = await file.text();
  // Remover marcações básicas do Markdown mas manter estrutura
  return text
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remove links
}

/**
 * Extrai texto de JSON
 */
async function extractJsonText(file: File): Promise<string> {
  const text = await file.text();
  try {
    const json = JSON.parse(text);
    return JSON.stringify(json, null, 2);
  } catch {
    return text; // Se não for JSON válido, retorna como texto
  }
}

/**
 * Extrai texto de CSV
 */
async function extractCsvText(file: File): Promise<string> {
  const text = await file.text();
  const lines = text.split(/\r?\n/);
  
  // Formatar CSV para análise mais legível
  return lines.map((line, index) => {
    if (index === 0) {
      return `Cabeçalhos: ${line}`;
    }
    return `Linha ${index}: ${line}`;
  }).join('\n');
}

/**
 * Extrai texto de documentos Word (simulado)
 */
async function extractWordText(file: File): Promise<string> {
  // Para documentos Word, em produção seria necessário usar mammoth.js ou similar
  const text = await file.text();
  
  // Tentar extrair texto legível de documentos Word
  const cleanText = text.replace(/[^\x20-\x7E\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
    
  if (cleanText.length < 10) {
    throw new Error('Documento Word não pode ser processado. Tente converter para PDF ou TXT.');
  }
  
  return cleanText;
}

/**
 * Limpa texto extraído removendo caracteres problemáticos
 */
function cleanExtractedText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove caracteres de controle
    .replace(/\s+/g, ' ') // Normaliza espaços
    .replace(/(.)\1{5,}/g, '$1') // Remove repetições excessivas
    .trim();
}

/**
 * Estima número de páginas baseado no comprimento do texto
 */
function estimatePageCount(text: string): number {
  // Estima ~250 palavras por página
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 250));
}

/**
 * Determina tipo de arquivo pela extensão
 */
function getFileTypeFromExtension(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop();
  
  const typeMap: Record<string, string> = {
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'md': 'text/markdown',
    'json': 'application/json',
    'csv': 'text/csv',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  
  return typeMap[ext || ''] || 'text/plain';
}
