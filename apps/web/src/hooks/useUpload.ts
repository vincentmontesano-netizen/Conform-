'use client';

import { useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export function useUploadProof() {
  return useMutation({
    mutationFn: async (file: File) => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/uploads/proof`, {
        method: 'POST',
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur upload' }));
        throw new Error(error.message || 'Erreur lors de l\'upload');
      }

      return response.json() as Promise<{ url: string; filename: string }>;
    },
  });
}

export function useDeleteProof() {
  return useMutation({
    mutationFn: async (filename: string) => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`${API_URL}/uploads/proof/${filename}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur suppression' }));
        throw new Error(error.message || 'Erreur lors de la suppression');
      }

      return response.json();
    },
  });
}
