
/**
 * SISTEMA BLINDADO DE MAPEAMENTO DE ASSISTENTES
 * 
 * ⚠️ ATENÇÃO: Este arquivo contém a configuração CRÍTICA do sistema de análise por IA.
 * NÃO ALTERE sem entender completamente o impacto.
 * 
 * Este mapeamento garante que os insights gerados pelos assistentes sejam
 * corretamente associados aos assistentes reais da plataforma.
 */

// Assistentes REAIS configurados na plataforma
export const REAL_ASSISTANTS = {
  ORACULO_SOMBRAS: {
    name: 'Oráculo das Sombras',
    area: 'psicologia',
    types: ['emotional', 'behavioral', 'relationships', 'psychological', 'therapy', 'mental']
  },
  TECELAO_ALMA: {
    name: 'Tecelão da Alma',
    area: 'proposito',
    types: ['growth', 'creativity', 'general', 'personal_development', 'purpose', 'meaning', 'spiritual']
  },
  GUARDIAO_RECURSOS: {
    name: 'Guardião dos Recursos',
    area: 'financeiro',
    types: ['financial', 'money', 'investment', 'budget']
  },
  ENGENHEIRO_CORPO: {
    name: 'Engenheiro do Corpo',
    area: 'saude',
    types: ['health', 'wellness', 'fitness', 'physical', 'body']
  },
  ARQUITETO_JOGO: {
    name: 'Arquiteto do Jogo',
    area: 'estrategia',
    types: ['strategy', 'planning', 'goals', 'objectives']
  },
  CATALISADOR: {
    name: 'Catalisador',
    area: 'criatividade',
    types: ['creativity', 'innovation', 'brainstorming', 'creative', 'arte', 'design']
  },
  ESPELHO_SOCIAL: {
    name: 'Espelho Social',
    area: 'relacionamentos',
    types: ['relationships', 'social', 'communication', 'interpersonal', 'amizade', 'família']
  },
  KAIRON: {
    name: 'Kairon',
    area: 'geral',
    types: ['general', 'overview', 'summary']
  }
} as const;

/**
 * MAPEAMENTO CORRIGIDO - ANÁLISE INTELIGENTE DE CONTEÚDO
 * 
 * Esta função mapeia insight_types e analisa o conteúdo para determinar o assistente correto.
 */
export const getAssistantByInsightType = (insightType: string, title?: string, description?: string): { name: string; area: string } => {
  console.log('🔍 NOVO MAPEAMENTO - Analisando:', { insightType, title: title?.substring(0, 50) });
  
  // Normalizar o tipo de insight
  const normalizedType = insightType?.toLowerCase().trim();
  
  // MAPEAMENTO DIRETO PRIMEIRO - mais específico
  const directMapping: Record<string, { name: string; area: string }> = {
    // Oráculo das Sombras - Psicologia/Emocional/Comportamental
    'emotional': REAL_ASSISTANTS.ORACULO_SOMBRAS,
    'behavioral': REAL_ASSISTANTS.ORACULO_SOMBRAS,
    'psychological': REAL_ASSISTANTS.ORACULO_SOMBRAS,
    'therapy': REAL_ASSISTANTS.ORACULO_SOMBRAS,
    'mental': REAL_ASSISTANTS.ORACULO_SOMBRAS,
    'relationships': REAL_ASSISTANTS.ORACULO_SOMBRAS, // Relacionamentos também podem ser psicológicos
    
    // Guardião dos Recursos - Financeiro
    'financial': REAL_ASSISTANTS.GUARDIAO_RECURSOS,
    'money': REAL_ASSISTANTS.GUARDIAO_RECURSOS,
    'investment': REAL_ASSISTANTS.GUARDIAO_RECURSOS,
    'budget': REAL_ASSISTANTS.GUARDIAO_RECURSOS,
    
    // Engenheiro do Corpo - Saúde
    'health': REAL_ASSISTANTS.ENGENHEIRO_CORPO,
    'wellness': REAL_ASSISTANTS.ENGENHEIRO_CORPO,
    'fitness': REAL_ASSISTANTS.ENGENHEIRO_CORPO,
    'physical': REAL_ASSISTANTS.ENGENHEIRO_CORPO,
    'body': REAL_ASSISTANTS.ENGENHEIRO_CORPO,
    
    // Arquiteto do Jogo - Estratégia
    'strategy': REAL_ASSISTANTS.ARQUITETO_JOGO,
    'planning': REAL_ASSISTANTS.ARQUITETO_JOGO,
    'goals': REAL_ASSISTANTS.ARQUITETO_JOGO,
    'objectives': REAL_ASSISTANTS.ARQUITETO_JOGO,
    
    // Catalisador - Criatividade
    'creativity': REAL_ASSISTANTS.CATALISADOR,
    'innovation': REAL_ASSISTANTS.CATALISADOR,
    'brainstorming': REAL_ASSISTANTS.CATALISADOR,
    'creative': REAL_ASSISTANTS.CATALISADOR,
    
    // Tecelão da Alma - Propósito/Crescimento
    'growth': REAL_ASSISTANTS.TECELAO_ALMA,
    'personal_development': REAL_ASSISTANTS.TECELAO_ALMA,
    'purpose': REAL_ASSISTANTS.TECELAO_ALMA,
    'meaning': REAL_ASSISTANTS.TECELAO_ALMA,
    'spiritual': REAL_ASSISTANTS.TECELAO_ALMA,
    
    // Espelho Social - Comunicação Social
    'social': REAL_ASSISTANTS.ESPELHO_SOCIAL,
    'communication': REAL_ASSISTANTS.ESPELHO_SOCIAL,
    'interpersonal': REAL_ASSISTANTS.ESPELHO_SOCIAL,
    
    // Kairon - Geral (apenas quando realmente for geral)
    'general': REAL_ASSISTANTS.KAIRON,
    'overview': REAL_ASSISTANTS.KAIRON,
    'summary': REAL_ASSISTANTS.KAIRON
  };

  // Verificar mapeamento direto primeiro
  if (normalizedType && directMapping[normalizedType]) {
    console.log('✅ MAPEAMENTO DIRETO:', directMapping[normalizedType].name, 'para tipo:', normalizedType);
    return directMapping[normalizedType];
  }

  // ANÁLISE INTELIGENTE DE CONTEÚDO - mais robusta
  const content = `${title || ''} ${description || ''}`.toLowerCase();
  
  // Palavras-chave mais específicas por assistente
  const keywordAnalysis = [
    {
      assistant: REAL_ASSISTANTS.ORACULO_SOMBRAS,
      keywords: [
        // Emoções e sentimentos
        'emoc', 'sentim', 'ansied', 'depress', 'estress', 'medo', 'raiva', 'tristeza', 'alegria',
        // Psicologia
        'psic', 'mental', 'autoestima', 'confidence', 'therapy', 'terapia', 'comportament',
        // Relacionamentos pessoais
        'relacionam', 'amor', 'família', 'amizade', 'conflito', 'communication',
        // Padrões comportamentais
        'hábito', 'pattern', 'routine', 'behavior'
      ]
    },
    {
      assistant: REAL_ASSISTANTS.GUARDIAO_RECURSOS,
      keywords: [
        'dinheiro', 'financ', 'gasto', 'renda', 'investim', 'economia', 'money', 
        'budget', 'orçamento', 'poupança', 'débito', 'crédito', 'lucro', 'receita',
        'custo', 'despesa', 'patrimônio'
      ]
    },
    {
      assistant: REAL_ASSISTANTS.ENGENHEIRO_CORPO,
      keywords: [
        'saúde', 'corpo', 'exerc', 'sono', 'alimentação', 'dieta', 'physical', 
        'fitness', 'health', 'wellness', 'energia', 'cansaço', 'nutrição',
        'treino', 'músculo', 'peso', 'cardio'
      ]
    },
    {
      assistant: REAL_ASSISTANTS.ARQUITETO_JOGO,
      keywords: [
        'estratég', 'plano', 'meta', 'objetivo', 'produtiv', 'organiz', 'strategy', 
        'planning', 'goals', 'focus', 'prioridade', 'projeto', 'deadline',
        'task', 'tarefa', 'gestão'
      ]
    },
    {
      assistant: REAL_ASSISTANTS.CATALISADOR,
      keywords: [
        'criativ', 'inovação', 'ideia', 'brainstorm', 'inspiration', 'creative', 
        'innovation', 'arte', 'design', 'imaginação', 'original', 'inventiv'
      ]
    },
    {
      assistant: REAL_ASSISTANTS.ESPELHO_SOCIAL,
      keywords: [
        'social', 'comunicação', 'network', 'team', 'grupo', 'comunidade',
        'liderança', 'apresentação', 'meeting', 'reunião', 'público'
      ]
    },
    {
      assistant: REAL_ASSISTANTS.TECELAO_ALMA,
      keywords: [
        'propósito', 'sentido', 'crescimento', 'desenvolvimento', 'evolução', 'purpose', 
        'meaning', 'spiritual', 'valores', 'missão', 'visão', 'transcend',
        'alma', 'essência', 'transformação'
      ]
    }
  ];

  // Procurar por palavras-chave no conteúdo
  for (const analysis of keywordAnalysis) {
    for (const keyword of analysis.keywords) {
      if (content.includes(keyword)) {
        console.log('✅ MAPEAMENTO POR CONTEÚDO:', analysis.assistant.name, 'palavra-chave encontrada:', keyword);
        return analysis.assistant;
      }
    }
  }
  
  // Se não encontrou nada específico, analisar o contexto mais amplo
  if (content.includes('relacionam') || content.includes('social') || content.includes('comunicação')) {
    console.log('✅ CONTEXTO SOCIAL detectado -> Espelho Social');
    return REAL_ASSISTANTS.ESPELHO_SOCIAL;
  }
  
  if (content.includes('psic') || content.includes('emoc') || content.includes('sentim')) {
    console.log('✅ CONTEXTO PSICOLÓGICO detectado -> Oráculo das Sombras');
    return REAL_ASSISTANTS.ORACULO_SOMBRAS;
  }

  // Fallback mais inteligente baseado no tipo
  if (normalizedType?.includes('relation')) {
    console.log('✅ FALLBACK RELACIONAL -> Oráculo das Sombras');
    return REAL_ASSISTANTS.ORACULO_SOMBRAS;
  }
  
  if (normalizedType?.includes('social')) {
    console.log('✅ FALLBACK SOCIAL -> Espelho Social');
    return REAL_ASSISTANTS.ESPELHO_SOCIAL;
  }
  
  // Último fallback - Kairon apenas se realmente não conseguir determinar
  console.warn(`⚠️ FALLBACK FINAL - Tipo '${normalizedType}' não mapeado. Conteúdo: "${content.substring(0, 100)}"`);
  return REAL_ASSISTANTS.KAIRON;
};

/**
 * VALIDAÇÃO DE INTEGRIDADE
 */
export const validateAssistantMapping = (): boolean => {
  const requiredTypes = ['emotional', 'behavioral', 'growth', 'financial', 'health', 'strategy', 'creativity', 'relationships', 'general'];
  
  for (const type of requiredTypes) {
    const assistant = getAssistantByInsightType(type);
    if (!assistant.name || !assistant.area) {
      console.error(`❌ Falha na validação do mapeamento para tipo: ${type}`);
      return false;
    }
  }
  
  console.log('✅ Sistema de mapeamento validado com sucesso');
  return true;
};

/**
 * CONFIGURAÇÕES PROTEGIDAS DO SISTEMA
 */
export const ANALYSIS_SYSTEM_CONFIG = {
  // Prefixos para identificar dados gerados por assistentes
  ASSISTANT_BADGE_PREFIX: '🔮',
  CACHE_PREFIX: 'assistant_analysis_',
  
  // Campos obrigatórios para insights
  REQUIRED_INSIGHT_FIELDS: ['id', 'title', 'description', 'insight_type', 'created_at'],
  
  // Validação de dados
  MIN_INSIGHT_LENGTH: 10,
  MAX_INSIGHT_LENGTH: 2000,
  
  // Configurações de display
  DEFAULT_INSIGHTS_LIMIT: 10,
  TIMELINE_EVENTS_LIMIT: 20
} as const;
