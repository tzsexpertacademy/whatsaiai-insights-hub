
# 🔒 SISTEMA BLINDADO DE ANÁLISE POR IA

## ⚠️ ATENÇÃO - DOCUMENTO CRÍTICO

Este documento descreve a arquitetura blindada do sistema de análise por IA. **NÃO ALTERE** sem entender completamente o impacto.

## 🛡️ Componentes Protegidos

### 1. Mapeamento de Assistentes (`/src/constants/assistantMapping.ts`)
- **NUNCA ALTERE** o mapeamento entre `insight_type` e assistentes
- Garante que insights sejam sempre associados aos assistentes corretos
- Contém validação automática de integridade

### 2. Hook Protegido (`/src/hooks/useProtectedAnalysisData.ts`)
- Carrega dados com validação de integridade
- Filtra apenas insights validados
- Fornece estatísticas protegidas

### 3. Context Blindado (`/src/contexts/AnalysisDataContext.tsx`)
- Processamento protegido de insights
- Validação automática do sistema
- Mapeamento garantido para assistentes reais

### 4. Status do Sistema (`/src/components/AnalysisSystemStatus.tsx`)
- Monitora integridade do sistema
- Permite revalidação manual
- Alerta sobre comprometimentos

## 🔒 Regras de Proteção

### NUNCA FAÇA:
1. Altere o mapeamento `insight_type -> assistente` sem validação
2. Remova a validação de integridade
3. Processe insights sem usar o sistema protegido
4. Ignore alertas de sistema comprometido

### SEMPRE FAÇA:
1. Use `getAssistantByInsightType()` para mapear insights
2. Valide integridade com `validateAssistantMapping()`
3. Monitore logs de sistema comprometido
4. Use hooks protegidos para dados críticos

## 🚨 Assistentes Protegidos

```typescript
ORÁCULO_SOMBRAS -> psicologia -> [emotional, behavioral, relationships]
TECELÃO_ALMA -> proposito -> [growth, creativity, general]
GUARDIÃO_RECURSOS -> financeiro -> [financial]
ENGENHEIRO_CORPO -> saude -> [health]
ARQUITETO_JOGO -> estrategia -> [strategy]
CATALISADOR -> criatividade -> [creativity]
ESPELHO_SOCIAL -> relacionamentos -> [relationships]
KAIRON -> geral -> [general]
```

## 🔍 Monitoramento

O sistema inclui:
- Validação automática na inicialização
- Logs detalhados de processamento
- Alertas de integridade comprometida
- Estatísticas de uso por assistente

## 🛠️ Manutenção

Para alterar o sistema:
1. Faça backup do mapeamento atual
2. Teste em ambiente isolado
3. Valide integridade após mudanças
4. Monitore logs por 24h após deploy

## 📊 Métricas Protegidas

- Total de insights validados
- Assistentes ativos gerando dados
- Última análise processada
- Status de integridade do sistema

---

**🔐 ESTE SISTEMA É CRÍTICO - QUALQUER ALTERAÇÃO DEVE SER APROVADA PELA EQUIPE TÉCNICA**
