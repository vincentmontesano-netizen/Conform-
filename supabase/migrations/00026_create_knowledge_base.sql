-- Migration: Create knowledge base tables and bucket
-- CONFORM+ — Base de connaissances RAG (Mistral AI)

CREATE TYPE public.knowledge_category AS ENUM (
  'Code du travail',
  'Obligations DUERP',
  'Guides sectoriels',
  'Templates CONFORM+',
  'Base jurisprudence interne'
);

CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  category       public.knowledge_category NOT NULL,
  file_url       TEXT NOT NULL, -- url/path dans le bucket knowledge_base
  mistral_file_id TEXT,         -- ID renvoyé par l'API Mistral après upload
  status         TEXT DEFAULT 'pending', -- pending, synced, error
  uploaded_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_knowledge_docs_category ON public.knowledge_documents(category);

CREATE TRIGGER update_knowledge_docs_updated_at
  BEFORE UPDATE ON public.knowledge_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Lecture : admin uniquement (la lecture par l'Agent IA passe par le backend avec Service Role)
CREATE POLICY "Only super_admin can read knowledge documents"
  ON public.knowledge_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Ecriture : admin uniquement
CREATE POLICY "Only super_admin can modify knowledge documents"
  ON public.knowledge_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Setup Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('knowledge_base', 'knowledge_base', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS : Seul l'admin lit/écrit via dashboard, l'API IA passe en Service Role
CREATE POLICY "kb_admin_access"
  ON storage.objects FOR ALL 
  USING (
    bucket_id = 'knowledge_base' AND 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

COMMENT ON TABLE public.knowledge_documents IS 'Documents sources du RAG pour l''agent Mistral AI';
