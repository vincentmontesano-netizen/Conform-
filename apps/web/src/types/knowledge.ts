import { Database } from '@/lib/supabase/types';

export type KnowledgeCategory = Database['public']['Enums']['knowledge_category'];
export type KnowledgeDocument = Database['public']['Tables']['knowledge_documents']['Row'];
