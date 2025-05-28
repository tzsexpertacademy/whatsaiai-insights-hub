
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
    types: ['emotional', 'behavioral', 'relationships']
  },
  TECELAO_ALMA: {
    name: 'Tecelão da Alma',
    area: 'proposito',
    types: ['growth', 'creativity', 'general']
  },
  GUARDIAO_RECURSOS: {
    name: 'Guardião dos Recursos',
    area: 'financeiro',
    types: ['financial']
  },
  ENGENHEIRO_CORPO: {
    name: 'Engenheiro do Corpo',
    area: 'saude',
    types: ['health']
  },
  ARQUITETO_JOGO: {
    name: 'Arquiteto do Jogo',
    area: 'estrategia',
    types: ['strategy']
  },
  CATALISADOR: {
    name: 'Catalisador',
    area: 'criatividade',
    types: ['creativity']
  },
  ESPELHO_SOCIAL: {
    name: 'Espelho Social',
    area: 'relacionamentos',
    types: ['relationships']
  },
  KAIRON: {
    name: 'Kairon',
    area: 'geral',
    types: ['general']
  }
} as const;

/**
 * MAPEAMENTO PROTEGIDO - NÃO ALTERAR
 * 
 * Esta função garante que os insight_types sejam sempre mapeados
 * corretamente para os assistentes reais da plataforma.
 */
export const getAssistantByInsightType = (insightType: string): { name: string; area: string } => {
  // Mapeamento direto e protegido
  const assistantMap: { [key: string]: { name: string; area: string } } = {
    'emotional': REAL_ASSISTANTS.ORACULO_SOMBRAS,
    'behavioral': REAL_ASSISTANTS.ORACULO_SOMBRAS,
    'growth': REAL_ASSISTANTS.TECELAO_ALMA,
    'financial': REAL_ASSISTANTS.GUARDIAO_RECURSOS,
    'health': REAL_ASSISTANTS.ENGENHEIRO_CORPO,
    'strategy': REAL_ASSISTANTS.ARQUITETO_JOGO,
    'creativity': REAL_ASSISTANTS.CATALISADOR,
    'relationships': REAL_ASSISTANTS.ESPELHO_SOCIAL,
    'general': REAL_ASSISTANTS.KAIRON
  };

  const assistant = assistantMap[insightType];
  
  // Fallback protegido - sempre retorna um assistente válido
  if (!assistant) {
    console.warn(`⚠️ Insight type '${insightType}' não mapeado. Usando Kairon como fallback.`);
    return REAL_ASSISTANTS.KAIRON;
  }

  return assistant;
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
