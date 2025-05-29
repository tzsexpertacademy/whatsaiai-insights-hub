
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
      // Para PDFs, vamos tentar uma abordagem completamente diferente
      text = await extractPDFTextContent(file);
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

async function extractPDFTextContent(file: File): Promise<string> {
  console.log('🔍 Tentando extrair texto do PDF...');
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Converter para string usando UTF-8
    const decoder = new TextDecoder('utf-8', { ignoreBOM: true });
    let pdfString = '';
    
    try {
      pdfString = decoder.decode(uint8Array);
    } catch {
      // Se UTF-8 falhar, tentar latin1
      const latin1Decoder = new TextDecoder('latin1');
      pdfString = latin1Decoder.decode(uint8Array);
    }
    
    console.log('📊 Tamanho do conteúdo PDF:', pdfString.length);
    
    let extractedText = '';
    
    // Método 1: Extrair texto entre parênteses simples (mais comum)
    const simpleTextMatches = pdfString.match(/\(([^)]+)\)/g);
    if (simpleTextMatches) {
      console.log('🔍 Encontrados', simpleTextMatches.length, 'textos simples');
      
      const textParts = [];
      for (const match of simpleTextMatches) {
        let text = match.slice(1, -1); // Remove os parênteses
        
        // Limpar e validar o texto
        text = cleanPDFText(text);
        
        if (isValidText(text)) {
          textParts.push(text);
        }
      }
      
      extractedText = textParts.join(' ');
    }
    
    // Método 2: Se não conseguiu texto suficiente, tentar padrões mais complexos
    if (extractedText.length < 100) {
      console.log('🔍 Tentando extração avançada...');
      
      // Procurar por comandos Tj (show text)
      const tjMatches = pdfString.match(/\(([^)]*)\)\s*Tj/gi);
      if (tjMatches) {
        const textParts = [];
        for (const match of tjMatches) {
          const textMatch = match.match(/\(([^)]*)\)/);
          if (textMatch) {
            let text = cleanPDFText(textMatch[1]);
            if (isValidText(text)) {
              textParts.push(text);
            }
          }
        }
        extractedText = textParts.join(' ');
      }
    }
    
    // Método 3: Se ainda não conseguiu, tentar arrays TJ
    if (extractedText.length < 100) {
      console.log('🔍 Tentando extração de arrays TJ...');
      
      const tjArrayMatches = pdfString.match(/\[([^\]]*)\]\s*TJ/gi);
      if (tjArrayMatches) {
        const textParts = [];
        for (const match of tjArrayMatches) {
          const arrayContent = match.match(/\[([^\]]*)\]/);
          if (arrayContent) {
            const textMatches = arrayContent[1].match(/\(([^)]*)\)/g);
            if (textMatches) {
              for (const textMatch of textMatches) {
                let text = cleanPDFText(textMatch.slice(1, -1));
                if (isValidText(text)) {
                  textParts.push(text);
                }
              }
            }
          }
        }
        extractedText = textParts.join(' ');
      }
    }
    
    // Limpeza final
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log(`📄 Texto final extraído: ${extractedText.length} caracteres`);
    
    // Se ainda não conseguiu extrair texto legível
    if (extractedText.length < 50 || !hasReadableContent(extractedText)) {
      console.log('⚠️ Não foi possível extrair texto legível do PDF');
      return generatePDFPlaceholder(file);
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('❌ Erro na extração de PDF:', error);
    return generatePDFPlaceholder(file);
  }
}

function cleanPDFText(text: string): string {
  return text
    // Decodificar escapes básicos
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    // Remover caracteres de controle
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    // Normalizar espaços
    .replace(/\s+/g, ' ')
    .trim();
}

function isValidText(text: string): boolean {
  if (!text || text.length < 2) return false;
  
  // Filtrar comandos PDF comuns
  const pdfCommands = ['BT', 'ET', 'Tj', 'TJ', 'Td', 'TD', 'Tm', 'T*', 'Tf', 'TL'];
  if (pdfCommands.includes(text.trim())) return false;
  
  // Filtrar apenas números ou coordenadas
  if (/^[\d\s\.\-]+$/.test(text)) return false;
  
  // Deve ter pelo menos algumas letras
  const letterCount = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
  return letterCount >= 2;
}

function hasReadableContent(text: string): boolean {
  // Verificar se tem conteúdo legível (não só símbolos ou códigos)
  const readableChars = text.match(/[a-zA-ZÀ-ÿ\s]/g) || [];
  const totalChars = text.length;
  
  // Pelo menos 70% deve ser legível
  return (readableChars.length / totalChars) > 0.7;
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
