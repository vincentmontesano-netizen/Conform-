import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Registre, RegistreEntry, RegistreEntryDocument } from '@conform-plus/shared';

// ─── Registres ──────────────────────────────────────

export function useRegistres(type?: string) {
  return useQuery<(Registre & { entries_count: number })[]>({
    queryKey: ['registres', type],
    queryFn: () => api.get(`/registres${type ? `?type=${type}` : ''}`),
  });
}

export function useRegistre(id: string) {
  return useQuery<Registre>({
    queryKey: ['registres', id],
    queryFn: () => api.get(`/registres/${id}`),
    enabled: !!id,
  });
}

export function useCreateRegistre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: string; name: string; description?: string; site_id?: string }) =>
      api.post<Registre>('/registres', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registres'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateRegistre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; description?: string; is_active?: boolean }) =>
      api.patch<Registre>(`/registres/${id}`, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['registres'] });
      queryClient.invalidateQueries({ queryKey: ['registres', vars.id] });
    },
  });
}

export function useDeleteRegistre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/registres/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registres'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ─── Entries ────────────────────────────────────────

interface EntriesResponse {
  entries: (RegistreEntry & { registre_entry_documents: RegistreEntryDocument[] })[];
  total: number;
  page: number;
  limit: number;
}

export function useRegistreEntries(registreId: string, options?: { archived?: boolean; page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (options?.archived !== undefined) params.set('archived', String(options.archived));
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  const qs = params.toString();

  return useQuery<EntriesResponse>({
    queryKey: ['registres', registreId, 'entries', options],
    queryFn: () => api.get(`/registres/${registreId}/entries${qs ? `?${qs}` : ''}`),
    enabled: !!registreId,
  });
}

export function useCreateRegistreEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registreId, ...data }: { registreId: string; data: Record<string, unknown>; expires_at?: string | null }) =>
      api.post(`/registres/${registreId}/entries`, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['registres', vars.registreId, 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['registres'] });
      queryClient.invalidateQueries({ queryKey: ['registres-expiring'] });
    },
  });
}

export function useUpdateRegistreEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registreId, entryId, ...data }: { registreId: string; entryId: string; data?: Record<string, unknown>; expires_at?: string | null; is_archived?: boolean }) =>
      api.patch(`/registres/${registreId}/entries/${entryId}`, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['registres', vars.registreId, 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['registres-expiring'] });
    },
  });
}

export function useArchiveRegistreEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registreId, entryId }: { registreId: string; entryId: string }) =>
      api.delete(`/registres/${registreId}/entries/${entryId}`),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['registres', vars.registreId, 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['registres'] });
    },
  });
}

// ─── Expiring ───────────────────────────────────────

export function useRegistreExpiringEntries(days?: number) {
  return useQuery<any[]>({
    queryKey: ['registres-expiring', days],
    queryFn: () => api.get(`/registres/expiring${days ? `?days=${days}` : ''}`),
  });
}

// ─── Documents ──────────────────────────────────────

export function useAddRegistreDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ registreId, entryId, file }: { registreId: string; entryId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);

      const { getSession } = await import('@/lib/supabase/client').then((m) => ({
        getSession: async () => {
          const supabase = m.createClient();
          const { data } = await supabase.auth.getSession();
          return data.session?.access_token;
        },
      }));
      const token = await getSession();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

      const res = await fetch(`${baseUrl}/registres/${registreId}/entries/${entryId}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Erreur upload');
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['registres', vars.registreId, 'entries'] });
    },
  });
}

export function useRemoveRegistreDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registreId, entryId, docId }: { registreId: string; entryId: string; docId: string }) =>
      api.delete(`/registres/${registreId}/entries/${entryId}/documents/${docId}`),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['registres', vars.registreId, 'entries'] });
    },
  });
}
