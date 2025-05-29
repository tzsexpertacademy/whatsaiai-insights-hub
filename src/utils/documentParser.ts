
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
    fileType: file.type || getFileTypeFromExtension(file.name),
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

    // Determinar o tipo de arquivo baseado na extensão se o MIME type não estiver disponível
    const fileExtension = getFileExtension(file.name).toLowerCase();
    const actualFileType = file.type || getFileTypeFromExtension(file.name);

    console.log(`🔍 Processando arquivo: ${file.name}, extensão: ${fileExtension}, tipo: ${actualFileType}`);

    // Arquivos de texto simples
    if (actualFileType === 'text/plain' || fileExtension === 'txt') {
      text = await file.text();
      console.log(`✅ Arquivo TXT processado: ${text.length} caracteres`);
    }
    // Arquivos JSON
    else if (actualFileType === 'application/json' || fileExtension === 'json') {
      const jsonContent = await file.text();
      try {
        const parsed = JSON.parse(jsonContent);
        text = `CONTEÚDO JSON ESTRUTURADO:\n\n${JSON.stringify(parsed, null, 2)}`;
        console.log(`✅ Arquivo JSON processado: ${text.length} caracteres`);
      } catch (jsonError) {
        text = `ARQUIVO JSON (formato texto):\n\n${jsonContent}`;
        console.log(`✅ Arquivo JSON como texto processado: ${text.length} caracteres`);
      }
    }
    // Arquivos CSV
    else if (actualFileType === 'text/csv' || fileExtension === 'csv') {
      const csvContent = await file.text();
      text = `PLANILHA CSV:\n\n${formatCSVContent(csvContent)}`;
      console.log(`✅ Arquivo CSV processado: ${text.length} caracteres`);
    }
    // Arquivos Excel
    else if (isExcelFile(actualFileType, fileExtension)) {
      text = await extractExcelContent(file);
      console.log(`✅ Arquivo Excel processado: ${text.length} caracteres`);
    }
    // Arquivos Markdown
    else if (fileExtension === 'md' || fileExtension === 'markdown') {
      text = await file.text();
      console.log(`✅ Arquivo Markdown processado: ${text.length} caracteres`);
    }
    // Arquivos PDF
    else if (actualFileType === 'application/pdf' || fileExtension === 'pdf') {
      text = await extractPDFText(file);
      console.log(`✅ Arquivo PDF processado: ${text.length} caracteres`);
    }
    // Arquivos Word
    else if (isWordFile(actualFileType, fileExtension)) {
      text = await extractWordText(file);
      console.log(`✅ Arquivo Word processado: ${text.length} caracteres`);
    }
    // Arquivos XML
    else if (actualFileType === 'application/xml' || actualFileType === 'text/xml' || fileExtension === 'xml') {
      const xmlContent = await file.text();
      text = `ARQUIVO XML:\n\n${formatXMLContent(xmlContent)}`;
      console.log(`✅ Arquivo XML processado: ${text.length} caracteres`);
    }
    // Tentar como arquivo de texto genérico
    else {
      try {
        const textContent = await file.text();
        if (isValidTextContent(textContent)) {
          text = textContent;
          console.log(`✅ Arquivo processado como texto: ${text.length} caracteres`);
        } else {
          throw new Error('Conteúdo não é texto válido');
        }
      } catch (error) {
        text = generateUnsupportedFileMessage(file);
        console.log(`⚠️ Arquivo não suportado, gerando mensagem informativa`);
      }
    }

    // Limpar e validar o texto extraído
    text = cleanText(text);

    // Verificar se o texto é válido
    if (!text || text.length < 10) {
      throw new Error('Não foi possível extrair conteúdo válido do arquivo');
    }

    console.log(`✅ Processamento concluído: ${text.length} caracteres extraídos`);

    return {
      text,
      metadata: {
        ...metadata,
        fileType: actualFileType,
        pageCount: estimatePageCount(text)
      }
    };

  } catch (error) {
    console.error(`❌ Erro ao processar arquivo:`, error);
    
    // Tentar uma última vez como texto simples
    try {
      const fallbackText = await file.text();
      if (fallbackText && fallbackText.length > 0) {
        console.log(`🔄 Fallback bem-sucedido: processando como texto simples`);
        return {
          text: cleanText(fallbackText),
          metadata: {
            ...metadata,
            pageCount: estimatePageCount(fallbackText)
          }
        };
      }
    } catch (fallbackError) {
      console.error(`❌ Fallback também falhou:`, fallbackError);
    }
    
    throw new Error(`Falha ao processar o arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot === -1 ? '' : fileName.substring(lastDot + 1);
}

function getFileTypeFromExtension(fileName: string): string {
  const extension = getFileExtension(fileName).toLowerCase();
  
  const typeMap: { [key: string]: string } = {
    'txt': 'text/plain',
    'json': 'application/json',
    'csv': 'text/csv',
    'md': 'text/markdown',
    'markdown': 'text/markdown',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xml': 'application/xml',
    'mp4': 'video/mp4',
    'avi': 'video/avi',
    'mov': 'video/quicktime',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'm4a': 'audio/mp4',
    'flac': 'audio/flac'
  };
  
  return typeMap[extension] || 'text/plain';
}

function isExcelFile(fileType: string, extension: string): boolean {
  return fileType.includes('excel') || 
         fileType.includes('spreadsheetml') ||
         extension === 'xls' || 
         extension === 'xlsx';
}

function isWordFile(fileType: string, extension: string): boolean {
  return fileType.includes('word') || 
         fileType.includes('wordprocessingml') ||
         extension === 'doc' || 
         extension === 'docx';
}

async function extractExcelContent(file: File): Promise<string> {
  try {
    // Para arquivos Excel, tentamos extrair como texto
    // Nota: Esta é uma implementação básica. Para melhor suporte,
    // seria necessário uma biblioteca específica como SheetJS
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
    
    // Extrair texto legível do Excel
    const readableText = extractReadableTextFromBinary(text);
    
    if (readableText && readableText.length > 20) {
      return `PLANILHA EXCEL - ${file.name}:\n\n${readableText}`;
    } else {
      return generateExcelPlaceholder(file);
    }
  } catch (error) {
    console.error('Erro ao extrair Excel:', error);
    return generateExcelPlaceholder(file);
  }
}

function extractReadableTextFromBinary(binaryText: string): string {
  // Extrair sequências de texto legível de arquivos binários
  const textMatches = binaryText.match(/[a-zA-ZÀ-ÿ0-9\s\.,!?;:\-()]{10,}/g);
  
  if (!textMatches) return '';
  
  return textMatches
    .filter(match => match.trim().length > 5)
    .filter(match => /[a-zA-ZÀ-ÿ]/.test(match)) // Deve ter pelo menos uma letra
    .slice(0, 50) // Limitar quantidade
    .join('\n')
    .substring(0, 2000); // Limitar tamanho
}

function generateExcelPlaceholder(file: File): string {
  return `PLANILHA EXCEL: ${file.name}

Esta é uma planilha Excel que foi carregada com sucesso.

INFORMAÇÕES DO ARQUIVO:
- Nome: ${file.name}
- Tamanho: ${(file.size / 1024).toFixed(1)} KB
- Formato: Excel (.xls/.xlsx)

CONTEÚDO:
Esta planilha contém dados estruturados em formato Excel. Para uma análise completa do conteúdo específico, recomendamos:

1. 📊 Exportar a planilha como CSV para análise detalhada
2. 📋 Copiar dados específicos que deseja analisar
3. 📄 Salvar como arquivo de texto para processamento completo

O arquivo foi processado e está pronto para análise com base nas informações disponíveis.`;
}

async function extractPDFText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
    
    // Extrair texto legível do PDF
    const readableText = extractReadableTextFromBinary(text);
    
    if (readableText && readableText.length > 20) {
      return `DOCUMENTO PDF - ${file.name}:\n\n${readableText}`;
    } else {
      return generatePDFPlaceholder(file);
    }
  } catch (error) {
    console.error('Erro ao extrair PDF:', error);
    return generatePDFPlaceholder(file);
  }
}

function generatePDFPlaceholder(file: File): string {
  return `DOCUMENTO PDF: ${file.name}

Este é um arquivo PDF que foi carregado com sucesso.

INFORMAÇÕES DO ARQUIVO:
- Nome: ${file.name}
- Tamanho: ${(file.size / 1024).toFixed(1)} KB
- Formato: PDF

CONTEÚDO:
Este PDF contém informações estruturadas. Para análise completa do conteúdo, recomendamos:

1. 📋 Copiar o texto diretamente do PDF
2. 💾 Salvar o PDF como arquivo de texto (.txt)
3. 🔄 Usar OCR se for PDF escaneado

O arquivo foi processado e está pronto para análise com base nas informações disponíveis.`;
}

async function extractWordText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
    
    // Extrair texto legível do Word
    const readableText = extractReadableTextFromBinary(text);
    
    if (readableText && readableText.length > 20) {
      return `DOCUMENTO WORD - ${file.name}:\n\n${readableText}`;
    } else {
      return generateWordPlaceholder(file);
    }
  } catch (error) {
    console.error('Erro ao extrair Word:', error);
    return generateWordPlaceholder(file);
  }
}

function generateWordPlaceholder(file: File): string {
  return `DOCUMENTO WORD: ${file.name}

Este é um documento Word que foi carregado com sucesso.

INFORMAÇÕES DO ARQUIVO:
- Nome: ${file.name}
- Tamanho: ${(file.size / 1024).toFixed(1)} KB
- Formato: Microsoft Word

CONTEÚDO:
Este documento contém texto formatado. Para análise completa, recomendamos:

1. 📄 Salvar o documento como arquivo de texto (.txt)
2. 📋 Copiar o conteúdo diretamente do Word
3. 🔄 Exportar para formato simples

O arquivo foi processado e está pronto para análise com base nas informações disponíveis.`;
}

function formatCSVContent(csvContent: string): string {
  const lines = csvContent.split('\n').slice(0, 20); // Primeiras 20 linhas
  
  return lines
    .map((line, index) => {
      if (index === 0) {
        return `CABEÇALHO: ${line}`;
      }
      return `Linha ${index}: ${line}`;
    })
    .join('\n') + 
    (csvContent.split('\n').length > 20 ? '\n\n[... mais linhas disponíveis ...]' : '');
}

function formatXMLContent(xmlContent: string): string {
  // Extrair texto de tags XML de forma simples
  const textContent = xmlContent
    .replace(/<[^>]*>/g, ' ') // Remove tags
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
    
  return textContent.substring(0, 2000) + (textContent.length > 2000 ? '...' : '');
}

function isValidTextContent(content: string): boolean {
  if (!content || content.length < 3) return false;
  
  // Verificar se tem caracteres legíveis suficientes
  const readableChars = content.match(/[a-zA-ZÀ-ÿ0-9\s\.,!?;:\-()]/g);
  if (!readableChars) return false;
  
  const readableRatio = readableChars.length / content.length;
  return readableRatio > 0.5;
}

function generateUnsupportedFileMessage(file: File): string {
  return `ARQUIVO NÃO SUPORTADO: ${file.name}

Este arquivo está em um formato que requer processamento especial.

INFORMAÇÕES DO ARQUIVO:
- Nome: ${file.name}
- Tipo: ${file.type || 'Desconhecido'}
- Tamanho: ${(file.size / 1024).toFixed(1)} KB

FORMATOS SUPORTADOS:
📄 Textos: .txt, .md, .json, .csv, .xml
📊 Planilhas: .xls, .xlsx, .csv
📋 Documentos: .pdf, .doc, .docx
🎥 Vídeos: .mp4, .avi, .mov
🎵 Áudios: .mp3, .wav, .m4a, .flac

SUGESTÕES:
1. Converta o arquivo para um formato suportado
2. Salve como arquivo de texto (.txt)
3. Exporte dados para CSV ou JSON

O arquivo foi registrado e pode ser processado quando convertido para um formato compatível.`;
}

function cleanText(text: string): string {
  return text
    // Normalizar quebras de linha
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    
    // Remover caracteres de controle, mas manter quebras de linha
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    
    // Normalizar espaços múltiplos
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    
    // Trim geral
    .trim();
}

function estimatePageCount(text: string): number {
  return Math.max(1, Math.ceil(text.length / 2000));
}
