
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
      // Para PDFs, vamos tentar extrair o texto de forma mais robusta
      text = await extractPDFText(file);
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

async function extractPDFText(file: File): Promise<string> {
  try {
    // Tentar ler como texto primeiro
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Converter para string e procurar por texto legível
    let text = '';
    for (let i = 0; i < uint8Array.length; i++) {
      const char = String.fromCharCode(uint8Array[i]);
      if (char.match(/[\w\s\.\,\!\?\-\(\)\[\]]/)) {
        text += char;
      }
    }
    
    // Limpar e estruturar o texto extraído
    text = text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\.\,\!\?\-\(\)\[\]]/g, ' ')
      .trim();
    
    if (text.length < 50) {
      return `[PDF] ${file.name}

Este é um arquivo PDF que requer processamento especial para extração de texto.

INFORMAÇÕES DO ARQUIVO:
- Nome: ${file.name}
- Tamanho: ${(file.size / 1024).toFixed(2)} KB

NOTA: Para análise completa de PDFs complexos, recomendamos:
1. Converter o PDF para texto (.txt) usando ferramentas externas
2. Ou usar serviços especializados de OCR se o PDF contém imagens
3. Depois fazer o upload do arquivo de texto resultante

O arquivo foi carregado com sucesso e está disponível para análise básica.`;
    }
    
    return text;
  } catch (error) {
    console.error('Erro na extração de PDF:', error);
    return `[PDF] ${file.name} - Arquivo carregado, mas requer processamento especial para extração de texto completa.`;
  }
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
