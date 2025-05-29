
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
    const fileExtension = getFileExtension(file.name).toLowerCase();
    const actualFileType = file.type || getFileTypeFromExtension(file.name);

    console.log(`🔍 Processando arquivo: ${file.name}, extensão: ${fileExtension}, tipo: ${actualFileType}`);

    // Arquivos de texto simples (.txt, .md)
    if (actualFileType === 'text/plain' || fileExtension === 'txt' || fileExtension === 'md' || fileExtension === 'markdown') {
      console.log('📝 Processando como arquivo de texto...');
      const rawText = await file.text();
      
      if (!rawText || rawText.trim().length === 0) {
        throw new Error('Arquivo de texto está vazio');
      }
      
      text = `DOCUMENTO DE TEXTO: ${file.name}

CONTEÚDO:
${rawText.trim()}`;
      
      console.log(`✅ Arquivo de texto processado: ${text.length} caracteres`);
    }
    
    // Arquivos JSON
    else if (actualFileType === 'application/json' || fileExtension === 'json') {
      console.log('📊 Processando como JSON...');
      const jsonContent = await file.text();
      
      if (!jsonContent || jsonContent.trim().length === 0) {
        throw new Error('Arquivo JSON está vazio');
      }
      
      try {
        const parsed = JSON.parse(jsonContent);
        text = `ARQUIVO JSON: ${file.name}

ESTRUTURA E DADOS:
${JSON.stringify(parsed, null, 2)}`;
      } catch (jsonError) {
        text = `ARQUIVO JSON (formato texto): ${file.name}

CONTEÚDO:
${jsonContent}`;
      }
      
      console.log(`✅ Arquivo JSON processado: ${text.length} caracteres`);
    }
    
    // Arquivos CSV
    else if (actualFileType === 'text/csv' || fileExtension === 'csv') {
      console.log('📈 Processando como CSV...');
      const csvContent = await file.text();
      
      if (!csvContent || csvContent.trim().length === 0) {
        throw new Error('Arquivo CSV está vazio');
      }
      
      text = formatCSVContent(csvContent, file.name);
      console.log(`✅ Arquivo CSV processado: ${text.length} caracteres`);
    }
    
    // Arquivos XML
    else if (actualFileType === 'application/xml' || actualFileType === 'text/xml' || fileExtension === 'xml') {
      console.log('🔖 Processando como XML...');
      const xmlContent = await file.text();
      
      if (!xmlContent || xmlContent.trim().length === 0) {
        throw new Error('Arquivo XML está vazio');
      }
      
      text = formatXMLContent(xmlContent, file.name);
      console.log(`✅ Arquivo XML processado: ${text.length} caracteres`);
    }
    
    // Arquivos Excel
    else if (isExcelFile(actualFileType, fileExtension)) {
      console.log('📊 Processando como Excel...');
      text = await extractExcelContent(file);
      console.log(`✅ Arquivo Excel processado: ${text.length} caracteres`);
    }
    
    // Arquivos PDF
    else if (actualFileType === 'application/pdf' || fileExtension === 'pdf') {
      console.log('📄 Processando como PDF...');
      text = await extractPDFText(file);
      console.log(`✅ Arquivo PDF processado: ${text.length} caracteres`);
    }
    
    // Arquivos Word
    else if (isWordFile(actualFileType, fileExtension)) {
      console.log('📝 Processando como Word...');
      text = await extractWordText(file);
      console.log(`✅ Arquivo Word processado: ${text.length} caracteres`);
    }
    
    // Tentar processar como texto genérico
    else {
      console.log('❓ Tentando processar como texto genérico...');
      try {
        const textContent = await file.text();
        
        if (!textContent || textContent.trim().length === 0) {
          throw new Error('Arquivo está vazio');
        }
        
        if (isValidTextContent(textContent)) {
          text = `ARQUIVO DE TEXTO: ${file.name}

CONTEÚDO:
${textContent.trim()}`;
          console.log(`✅ Arquivo processado como texto genérico: ${text.length} caracteres`);
        } else {
          throw new Error('Conteúdo não é texto válido');
        }
      } catch (error) {
        console.log(`⚠️ Não foi possível processar como texto, gerando mensagem informativa`);
        text = generateUnsupportedFileMessage(file);
      }
    }

    // Validação final do texto extraído
    if (!text || text.trim().length < 10) {
      throw new Error('Não foi possível extrair conteúdo suficiente do arquivo');
    }

    // Limpeza final do texto
    text = cleanExtractedText(text);

    console.log(`✅ Processamento concluído com sucesso: ${text.length} caracteres extraídos`);

    return {
      text,
      metadata: {
        ...metadata,
        fileType: actualFileType,
        pageCount: estimatePageCount(text)
      }
    };

  } catch (error) {
    console.error(`❌ Erro ao processar arquivo ${file.name}:`, error);
    
    // Tentativa de fallback como texto simples
    try {
      console.log(`🔄 Tentando fallback como texto simples...`);
      const fallbackText = await file.text();
      
      if (fallbackText && fallbackText.trim().length > 0) {
        const processedText = `ARQUIVO PROCESSADO (FALLBACK): ${file.name}

CONTEÚDO EXTRAÍDO:
${fallbackText.trim()}`;
        
        console.log(`✅ Fallback bem-sucedido: ${processedText.length} caracteres`);
        
        return {
          text: cleanExtractedText(processedText),
          metadata: {
            ...metadata,
            pageCount: estimatePageCount(processedText)
          }
        };
      }
    } catch (fallbackError) {
      console.error(`❌ Fallback também falhou:`, fallbackError);
    }
    
    throw new Error(`Falha ao processar o arquivo ${file.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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

async function extractPDFText(file: File): Promise<string> {
  try {
    console.log('🔍 Tentando extrair texto do PDF...');
    
    // Converter arquivo para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log(`📊 PDF carregado: ${arrayBuffer.byteLength} bytes`);
    
    // Tentar diferentes codificações para extrair texto
    const strategies = [
      () => extractWithUTF8(arrayBuffer),
      () => extractWithLatin1(arrayBuffer),
      () => extractWithWindows1252(arrayBuffer)
    ];
    
    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`🔄 Tentativa ${i + 1} de extração de PDF...`);
        const extractedText = strategies[i]();
        
        if (extractedText && extractedText.length > 50) {
          const cleanText = cleanPDFText(extractedText);
          
          if (isValidExtractedText(cleanText)) {
            console.log(`✅ PDF extraído com sucesso na tentativa ${i + 1}`);
            return `DOCUMENTO PDF: ${file.name}

CONTEÚDO EXTRAÍDO:
${cleanText}`;
          }
        }
      } catch (strategyError) {
        console.log(`⚠️ Estratégia ${i + 1} falhou:`, strategyError);
        continue;
      }
    }
    
    // Se chegou aqui, não conseguiu extrair texto válido
    console.log('⚠️ Não foi possível extrair texto legível do PDF');
    return generatePDFPlaceholder(file);
    
  } catch (error) {
    console.error('❌ Erro na extração de PDF:', error);
    return generatePDFPlaceholder(file);
  }
}

function extractWithUTF8(arrayBuffer: ArrayBuffer): string {
  return new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
}

function extractWithLatin1(arrayBuffer: ArrayBuffer): string {
  return new TextDecoder('latin1', { fatal: false }).decode(arrayBuffer);
}

function extractWithWindows1252(arrayBuffer: ArrayBuffer): string {
  return new TextDecoder('windows-1252', { fatal: false }).decode(arrayBuffer);
}

function cleanPDFText(text: string): string {
  console.log('🧹 Limpando texto extraído do PDF...');
  
  // Extrair apenas sequências de texto legível
  const textPattern = /[a-zA-ZÀ-ÿ0-9\s\.,!?;:\-()%$€£¥]+/g;
  const matches = text.match(textPattern);
  
  if (!matches) {
    return '';
  }
  
  // Filtrar e limpar matches
  const cleanedMatches = matches
    .filter(match => match.trim().length > 3)
    .filter(match => /[a-zA-ZÀ-ÿ]/.test(match)) // Deve ter pelo menos uma letra
    .filter(match => {
      // Filtrar sequências que são principalmente números/símbolos
      const letterCount = (match.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
      return letterCount > match.length * 0.3;
    })
    .map(match => match.trim())
    .filter(match => match.length > 0);
  
  const result = cleanedMatches.join(' ').substring(0, 5000);
  console.log(`✂️ Texto limpo: ${result.length} caracteres`);
  
  return result;
}

function isValidExtractedText(text: string): boolean {
  if (!text || text.length < 20) return false;
  
  // Verificar se tem palavras reais (não apenas símbolos)
  const words = text.split(/\s+/).filter(word => 
    word.length > 2 && /[a-zA-ZÀ-ÿ]/.test(word)
  );
  
  return words.length >= 5;
}

async function extractWordText(file: File): Promise<string> {
  try {
    console.log('📝 Tentando extrair texto do Word...');
    
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
    
    // Extrair texto legível do Word
    const cleanText = extractReadableTextFromBinary(text);
    
    if (cleanText && isValidExtractedText(cleanText)) {
      return `DOCUMENTO WORD: ${file.name}

CONTEÚDO EXTRAÍDO:
${cleanText}`;
    } else {
      return generateWordPlaceholder(file);
    }
  } catch (error) {
    console.error('❌ Erro ao extrair Word:', error);
    return generateWordPlaceholder(file);
  }
}

async function extractExcelContent(file: File): Promise<string> {
  try {
    console.log('📊 Tentando extrair conteúdo do Excel...');
    
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
    
    // Extrair texto legível do Excel
    const readableText = extractReadableTextFromBinary(text);
    
    if (readableText && readableText.length > 20) {
      return `PLANILHA EXCEL: ${file.name}

DADOS EXTRAÍDOS:
${readableText}`;
    } else {
      return generateExcelPlaceholder(file);
    }
  } catch (error) {
    console.error('❌ Erro ao extrair Excel:', error);
    return generateExcelPlaceholder(file);
  }
}

function extractReadableTextFromBinary(binaryText: string): string {
  console.log('🔍 Extraindo texto legível de arquivo binário...');
  
  // Padrão mais específico para extrair texto útil
  const textMatches = binaryText.match(/[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ0-9\s\.,!?;:\-()%$€£¥]{8,}/g);
  
  if (!textMatches) {
    console.log('❌ Nenhum texto legível encontrado');
    return '';
  }
  
  const filteredMatches = textMatches
    .filter(match => {
      const trimmed = match.trim();
      // Deve ter pelo menos 5 caracteres e pelo menos 30% de letras
      if (trimmed.length < 5) return false;
      
      const letterCount = (trimmed.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
      return letterCount > trimmed.length * 0.3;
    })
    .slice(0, 100) // Limitar quantidade
    .join('\n')
    .substring(0, 3000); // Limitar tamanho
  
  console.log(`✅ Texto extraído: ${filteredMatches.length} caracteres`);
  return filteredMatches;
}

function formatCSVContent(csvContent: string, fileName: string): string {
  const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length === 0) {
    return `PLANILHA CSV VAZIA: ${fileName}`;
  }
  
  const header = lines[0];
  const dataLines = lines.slice(1, 21); // Primeiras 20 linhas de dados
  
  let result = `PLANILHA CSV: ${fileName}

CABEÇALHO:
${header}

DADOS:
`;
  
  dataLines.forEach((line, index) => {
    result += `Linha ${index + 1}: ${line}\n`;
  });
  
  if (lines.length > 21) {
    result += `\n[... mais ${lines.length - 21} linhas disponíveis ...]`;
  }
  
  return result;
}

function formatXMLContent(xmlContent: string, fileName: string): string {
  // Extrair texto de tags XML de forma simples
  const textContent = xmlContent
    .replace(/<[^>]*>/g, ' ') // Remove tags
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
    
  return `ARQUIVO XML: ${fileName}

CONTEÚDO EXTRAÍDO:
${textContent.substring(0, 2000)}${textContent.length > 2000 ? '...' : ''}`;
}

function isValidTextContent(content: string): boolean {
  if (!content || content.length < 3) return false;
  
  // Verificar se tem caracteres legíveis suficientes
  const readableChars = content.match(/[a-zA-ZÀ-ÿ0-9\s\.,!?;:\-()]/g);
  if (!readableChars) return false;
  
  const readableRatio = readableChars.length / content.length;
  return readableRatio > 0.5;
}

function cleanExtractedText(text: string): string {
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

function generatePDFPlaceholder(file: File): string {
  return `DOCUMENTO PDF: ${file.name}

Este arquivo PDF foi carregado mas o texto não pôde ser extraído automaticamente.

INFORMAÇÕES DO ARQUIVO:
- Nome: ${file.name}
- Tamanho: ${(file.size / 1024).toFixed(1)} KB
- Formato: PDF

POSSÍVEIS CAUSAS:
1. PDF escaneado (imagem) - requer OCR
2. PDF protegido ou criptografado
3. Formato PDF não padrão

SOLUÇÕES RECOMENDADAS:
1. 📋 Copie o texto diretamente do PDF e cole aqui
2. 💾 Salve o PDF como arquivo de texto (.txt)
3. 🔄 Use ferramentas de OCR se for PDF escaneado

O arquivo foi registrado e está pronto para análise quando o texto for fornecido de outra forma.`;
}

function generateWordPlaceholder(file: File): string {
  return `DOCUMENTO WORD: ${file.name}

Este arquivo Word foi carregado mas o conteúdo não pôde ser extraído automaticamente.

INFORMAÇÕES DO ARQUIVO:
- Nome: ${file.name}
- Tamanho: ${(file.size / 1024).toFixed(1)} KB
- Formato: Microsoft Word

SOLUÇÕES RECOMENDADAS:
1. 📄 Abra o documento e salve como arquivo de texto (.txt)
2. 📋 Copie o conteúdo diretamente do Word e cole aqui
3. 🔄 Exporte para formato de texto simples

O arquivo foi registrado e está pronto para análise quando o conteúdo for fornecido em formato de texto.`;
}

function generateExcelPlaceholder(file: File): string {
  return `PLANILHA EXCEL: ${file.name}

Esta planilha Excel foi carregada mas os dados não puderam ser extraídos automaticamente.

INFORMAÇÕES DO ARQUIVO:
- Nome: ${file.name}
- Tamanho: ${(file.size / 1024).toFixed(1)} KB
- Formato: Excel

SOLUÇÕES RECOMENDADAS:
1. 📊 Exporte a planilha como CSV
2. 📋 Copie os dados específicos que deseja analisar
3. 📄 Salve as abas importantes como arquivos de texto

O arquivo foi registrado e está pronto para análise quando os dados forem fornecidos em formato compatível.`;
}

function generateUnsupportedFileMessage(file: File): string {
  return `ARQUIVO: ${file.name}

Este arquivo está em um formato que requer processamento especial.

INFORMAÇÕES DO ARQUIVO:
- Nome: ${file.name}
- Tipo: ${file.type || 'Desconhecido'}
- Tamanho: ${(file.size / 1024).toFixed(1)} KB

FORMATOS TOTALMENTE SUPORTADOS:
📄 Textos: .txt, .md, .json, .csv, .xml
📊 Planilhas: .csv (recomendado)
📋 Documentos: .txt (recomendado)

FORMATOS COM SUPORTE LIMITADO:
📄 .pdf, .doc, .docx, .xls, .xlsx
🎥 Vídeos: .mp4, .avi, .mov
🎵 Áudios: .mp3, .wav, .m4a, .flac

RECOMENDAÇÃO:
Para melhor análise, converta seu arquivo para formato de texto (.txt) ou CSV (.csv).

O arquivo foi registrado e pode ser processado quando convertido para formato compatível.`;
}
