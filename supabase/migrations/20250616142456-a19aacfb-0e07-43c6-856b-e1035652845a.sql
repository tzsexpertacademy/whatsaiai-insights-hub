
-- Criar tabela para histórico de análises
CREATE TABLE public.conversation_analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_analysis_id UUID REFERENCES public.whatsapp_conversations_analysis(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  analysis_type TEXT NOT NULL DEFAULT 'behavioral',
  assistant_id TEXT NOT NULL,
  assistant_name TEXT,
  analysis_results JSONB DEFAULT '[]'::jsonb,
  analysis_prompt TEXT,
  analysis_status TEXT NOT NULL DEFAULT 'completed',
  messages_analyzed INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  cost_estimate NUMERIC DEFAULT 0,
  processing_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.conversation_analysis_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para que usuários vejam apenas suas análises
CREATE POLICY "Users can view their own analysis history" 
  ON public.conversation_analysis_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis history" 
  ON public.conversation_analysis_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis history" 
  ON public.conversation_analysis_history 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis history" 
  ON public.conversation_analysis_history 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX idx_conversation_analysis_history_user_id ON public.conversation_analysis_history(user_id);
CREATE INDEX idx_conversation_analysis_history_conversation_id ON public.conversation_analysis_history(conversation_analysis_id);
CREATE INDEX idx_conversation_analysis_history_created_at ON public.conversation_analysis_history(created_at DESC);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_conversation_analysis_history_updated_at
  BEFORE UPDATE ON public.conversation_analysis_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
