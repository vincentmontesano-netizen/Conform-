/**
 * Stub Database types — replace with `supabase gen types typescript` output
 * when a full type-safe Supabase client is needed.
 */
export interface Database {
  public: {
    Tables: {
      knowledge_documents: {
        Row: {
          id: string;
          title: string;
          category: string;
          content: string | null;
          file_url: string | null;
          company_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Enums: {
      knowledge_category: 'reglementation' | 'guide' | 'modele' | 'faq' | 'autre';
      [key: string]: string;
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
  };
}
