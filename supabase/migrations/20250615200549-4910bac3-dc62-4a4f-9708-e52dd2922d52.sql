
-- Criação da tabela 'custom_areas' para áreas personalizadas do usuário
CREATE TABLE public.custom_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  area_name text NOT NULL,
  focus text,
  objective text,
  assistant_name text NOT NULL,
  assistant_persona text,
  assistant_tone text,
  metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS: Ativar Row-Level Security
ALTER TABLE public.custom_areas ENABLE ROW LEVEL SECURITY;

-- RLS: Usuário pode ver apenas suas áreas
CREATE POLICY "Users can view their own custom areas"
  ON public.custom_areas
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS: Usuário pode criar área para si mesmo
CREATE POLICY "Users can insert their own custom areas"
  ON public.custom_areas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS: Usuário pode atualizar apenas suas áreas
CREATE POLICY "Users can update their own custom areas"
  ON public.custom_areas
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS: Usuário pode deletar apenas as próprias áreas
CREATE POLICY "Users can delete their own custom areas"
  ON public.custom_areas
  FOR DELETE
  USING (auth.uid() = user_id);
