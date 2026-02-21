-- Migration: Create Global App Settings for Admin Console
-- Allows super-admins to manage global variables/parameters

CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index on key
CREATE INDEX idx_app_settings_key ON app_settings(key);

-- updated_at trigger
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Only super_admin can read and write settings
CREATE POLICY "Super admin can do all on app_settings"
  ON app_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Insert some default settings (Pricing amounts, features)
INSERT INTO app_settings (key, value, description) VALUES
  ('pricing.basic.price', '29', 'Prix de l''abonnement mensuel Basic'),
  ('pricing.premium.price', '99', 'Prix de l''abonnement mensuel Premium'),
  ('features.rag_enabled', 'true', 'Activation ou désactivation du module IA (Chatbot RAG)'),
  ('features.maintenance_mode', 'false', 'Mettre la plateforme en maintenance complète');
