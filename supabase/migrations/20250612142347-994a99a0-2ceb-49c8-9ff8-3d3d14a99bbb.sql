
-- Criar tabela para conversas marcadas para análise IA
CREATE TABLE public.whatsapp_conversations_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chat_id TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  marked_for_analysis BOOLEAN NOT NULL DEFAULT true,
  analysis_status TEXT NOT NULL DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  marked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  analysis_results JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, chat_id)
);

-- Habilitar RLS
ALTER TABLE public.whatsapp_conversations_analysis ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários verem apenas suas próprias conversas
CREATE POLICY "Users can view their own marked conversations" 
  ON public.whatsapp_conversations_analysis 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own marked conversations" 
  ON public.whatsapp_conversations_analysis 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marked conversations" 
  ON public.whatsapp_conversations_analysis 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marked conversations" 
  ON public.whatsapp_conversations_analysis 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_conversations_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whatsapp_conversations_analysis_updated_at
  BEFORE UPDATE ON public.whatsapp_conversations_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_conversations_analysis_updated_at();
