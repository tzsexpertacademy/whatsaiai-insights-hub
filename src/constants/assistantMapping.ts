
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
    types: ['emotional', 'behavioral', 'relationships', 'psychological']
  },
  TECELAO_ALMA: {
    name: 'Tecelão da Alma',
    area: 'proposito',
    types: ['growth', 'creativity', 'general', 'personal_development']
  },
  GUARDIAO_RECURSOS: {
    name: 'Guardião dos Recursos',
    area: 'financeiro',
    types: ['financial', 'money', 'investment']
  },
  ENGENHEIRO_CORPO: {
    name: 'Engenheiro do Corpo',
    area: 'saude',
    types: ['health', 'wellness', 'fitness', 'physical']
  },
  ARQUITETO_JOGO: {
    name: 'Arquiteto do Jogo',
    area: 'estrategia',
    types: ['strategy', 'planning', 'goals']
  },
  CATALISADOR: {
    name: 'Catalisador',
    area: 'criatividade',
    types: ['creativity', 'innovation', 'brainstorming']
  },
  ESPELHO_SOCIAL: {
    name: 'Espelho Social',
    area: 'relacionamentos',
    types: ['relationships', 'social', 'communication']
  },
  KAIRON: {
    name: 'Kairon',
    area: 'geral',
    types: ['general', 'overview', 'summary']
  }
} as const;

/**
 * MAPEAMENTO MELHORADO - COM DETECÇÃO INTELIGENTE
 * 
 * Esta função mapeia insight_types e também analisa o conteúdo
 * para determinar o assistente correto.
 */
export const getAssistantByInsightType = (insightType: string, title?: string, description?: string): { name: string; area: string } => {
  console.log('🔍 Mapeando assistente para:', { insightType, title: title?.substring(0, 50) });
  
  // Mapeamento direto mais específico
  const directMap: { [key: string]: { name: string; area: string } } = {
    // Oráculo das Sombras - Psicologia/Emocional
    'emotional': REAL_ASSISTANTS.ORACULO_SOMBRAS,
    'behavioral': REAL_ASSISTANTS.ORACULO_SOMBRAS,
    'psychological': REAL_ASSISTANTS.ORACULO_SOMBRAS,
    'therapy': REAL_ASSISTANTS.ORACULO_SOMBRAS,
    'mental': REAL_ASSISTANTS.ORACULO_SOMBRAS,
    
    // Tecelão da Alma - Propósito/Crescimento
    'growth': REAL_ASSISTANTS.TECELAO_ALMA,
    'personal_development': REAL_ASSISTANTS.TECELAO_ALMA,
    'purpose': REAL_ASSISTANTS.TECELAO_ALMA,
    'meaning': REAL_ASSISTANTS.TECELAO_ALMA,
    
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
    
    // Espelho Social - Relacionamentos
    'relationships': REAL_ASSISTANTS.ESPELHO_SOCIAL,
    'social': REAL_ASSISTANTS.ESPELHO_SOCIAL,
    'communication': REAL_ASSISTANTS.ESPELHO_SOCIAL,
    'interpersonal': REAL_ASSISTANTS.ESPELHO_SOCIAL,
    
    // Kairon - Geral
    'general': REAL_ASSISTANTS.KAIRON,
    'overview': REAL_ASSISTANTS.KAIRON,
    'summary': REAL_ASSISTANTS.KAIRON
  };

  // Verificar mapeamento direto primeiro
  const directAssistant = directMap[insightType.toLowerCase()];
  if (directAssistant) {
    console.log('✅ Assistente encontrado por mapeamento direto:', directAssistant.name);
    return directAssistant;
  }

  // Análise inteligente por conteúdo se não houver mapeamento direto
  const content = `${title || ''} ${description || ''}`.toLowerCase();
  
  // Palavras-chave por assistente
  const keywordMap = {
    [REAL_ASSISTANTS.ORACULO_SOMBRAS.name]: [
      'emoc', 'sentim', 'psic', 'mental', 'ansied', 'depress', 'estress', 'medo', 
      'raiva', 'tristeza', 'alegria', 'autoestima', 'confidence', 'therapy', 'terapia'
    ],
    [REAL_ASSISTANTS.GUARDIAO_RECURSOS.name]: [
      'dinheiro', 'financ', 'gasto', 'renda', 'investim', 'economia', 'money', 
      'budget', 'orçamento', 'poupança', 'débito', 'crédito'
    ],
    [REAL_ASSISTANTS.ENGENHEIRO_CORPO.name]: [
      'saúde', 'corpo', 'exerc', 'sono', 'alimentação', 'dieta', 'physical', 
      'fitness', 'health', 'wellness', 'energia', 'cansaço'
    ],
    [REAL_ASSISTANTS.ARQUITETO_JOGO.name]: [
      'estratég', 'plano', 'meta', 'objetivo', 'produtiv', 'organiz', 'strategy', 
      'planning', 'goals', 'focus', 'prioridade'
    ],
    [REAL_ASSISTANTS.CATALISADOR.name]: [
      'criativ', 'inovação', 'ideia', 'brainstorm', 'inspiration', 'creative', 
      'innovation', 'arte', 'design'
    ],
    [REAL_ASSISTANTS.ESPELHO_SOCIAL.name]: [
      'relacionam', 'social', 'comunicação', 'amizade', 'família', 'relationship', 
      'interpersonal', 'conversa', 'conflito'
    ],
    [REAL_ASSISTANTS.TECELAO_ALMA.name]: [
      'propósito', 'sentido', 'crescimento', 'desenvolvimento', 'evolução', 'purpose', 
      'meaning', 'spiritual', 'valores', 'missão'
    ]
  };

  // Procurar por palavras-chave no conteúdo
  for (const [assistantName, keywords] of Object.entries(keywordMap)) {
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        const foundAssistant = Object.values(REAL_ASSISTANTS).find(a => a.name === assistantName);
        if (foundAssistant) {
          console.log('✅ Assistente encontrado por análise de conteúdo:', foundAssistant.name, 'palavra-chave:', keyword);
          return foundAssistant;
        }
      }
    }
  }
  
  // Fallback protegido - sempre retorna um assistente válido
  console.warn(`⚠️ Insight type '${insightType}' não mapeado. Usando Kairon como fallback.`);
  return REAL_ASSISTANTS.KAIRON;
};

/**
 * VALIDAÇÃO DE INTEGRIDADE
 * 
 * Verifica se o sistema de mapeamento está funcionando corretamente
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
  
  console.log('✅ Mapeamento de assistentes validado com sucesso');
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
