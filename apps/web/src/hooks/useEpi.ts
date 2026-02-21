import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { EpiCategory, EpiItem, EpiAttribution, EpiControle } from '@conform-plus/shared';

// ─── Categories ──────────────────────────────────────

export function useEpiCategories() {
  return useQuery<(EpiCategory & { items_count: number })[]>({
    queryKey: ['epi-categories'],
    queryFn: () => api.get('/epi/categories'),
  });
}

export function useEpiCategory(id: string) {
  return useQuery<EpiCategory>({
    queryKey: ['epi-categories', id],
    queryFn: () => api.get(`/epi/categories/${id}`),
    enabled: !!id,
  });
}

export function useCreateEpiCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; code?: string; description?: string; norme?: string; duree_vie_mois?: number; controle_periodique_mois?: number }) =>
      api.post<EpiCategory>('/epi/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epi-categories'] });
    },
  });
}

export function useUpdateEpiCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; code?: string; description?: string; norme?: string; duree_vie_mois?: number; controle_periodique_mois?: number; is_active?: boolean }) =>
      api.patch<EpiCategory>(`/epi/categories/${id}`, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['epi-categories'] });
      queryClient.invalidateQueries({ queryKey: ['epi-categories', vars.id] });
    },
  });
}

export function useDeleteEpiCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/epi/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epi-categories'] });
    },
  });
}

export function useInitEpiCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/epi/categories/init'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epi-categories'] });
    },
  });
}

// ─── Items ──────────────────────────────────────────

interface ItemsResponse {
  items: (EpiItem & { epi_categories: EpiCategory })[];
  total: number;
  page: number;
  limit: number;
}

interface ItemFilters {
  statut?: string;
  etat?: string;
  category_id?: string;
  site_id?: string;
  page?: number;
  limit?: number;
}

export function useEpiItems(filters?: ItemFilters) {
  const params = new URLSearchParams();
  if (filters?.statut) params.set('statut', filters.statut);
  if (filters?.etat) params.set('etat', filters.etat);
  if (filters?.category_id) params.set('category_id', filters.category_id);
  if (filters?.site_id) params.set('site_id', filters.site_id);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();

  return useQuery<ItemsResponse>({
    queryKey: ['epi-items', filters],
    queryFn: () => api.get(`/epi/items${qs ? `?${qs}` : ''}`),
  });
}

export function useEpiItem(id: string) {
  return useQuery<EpiItem>({
    queryKey: ['epi-items', id],
    queryFn: () => api.get(`/epi/items/${id}`),
    enabled: !!id,
  });
}

export function useCreateEpiItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      category_id: string;
      site_id?: string;
      reference?: string;
      taille?: string;
      date_achat?: string;
      date_fabrication?: string;
      date_mise_en_service?: string;
      etat?: string;
      statut?: string;
      quantite?: number;
      notes?: string;
    }) => api.post<EpiItem>('/epi/items', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epi-items'] });
      queryClient.invalidateQueries({ queryKey: ['epi-categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateEpiItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: unknown }) =>
      api.patch<EpiItem>(`/epi/items/${id}`, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['epi-items'] });
      queryClient.invalidateQueries({ queryKey: ['epi-items', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['epi-categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteEpiItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/epi/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epi-items'] });
      queryClient.invalidateQueries({ queryKey: ['epi-categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useEpiExpiringItems(days?: number) {
  return useQuery<EpiItem[]>({
    queryKey: ['epi-items-expiring', days],
    queryFn: () => api.get(`/epi/items/expiring${days ? `?days=${days}` : ''}`),
  });
}

export function useEpiStats() {
  return useQuery<{
    total: number;
    by_statut: Record<string, number>;
    by_etat: Record<string, number>;
    expiring_30_days: number;
    non_conforme: number;
  }>({
    queryKey: ['epi-stats'],
    queryFn: () => api.get('/epi/stats'),
  });
}

// ─── Attributions ───────────────────────────────────

interface AttributionsResponse {
  attributions: (EpiAttribution & { epi_items: EpiItem & { epi_categories: EpiCategory } })[];
  total: number;
  page: number;
  limit: number;
}

interface AttributionFilters {
  salarie_nom?: string;
  epi_item_id?: string;
  page?: number;
  limit?: number;
}

export function useEpiAttributions(filters?: AttributionFilters) {
  const params = new URLSearchParams();
  if (filters?.salarie_nom) params.set('salarie_nom', filters.salarie_nom);
  if (filters?.epi_item_id) params.set('epi_item_id', filters.epi_item_id);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();

  return useQuery<AttributionsResponse>({
    queryKey: ['epi-attributions', filters],
    queryFn: () => api.get(`/epi/attributions${qs ? `?${qs}` : ''}`),
  });
}

export function useEpiAttribution(id: string) {
  return useQuery<EpiAttribution>({
    queryKey: ['epi-attributions', id],
    queryFn: () => api.get(`/epi/attributions/${id}`),
    enabled: !!id,
  });
}

export function useCreateEpiAttribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      epi_item_id: string;
      salarie_nom: string;
      salarie_poste?: string;
      date_attribution: string;
      motif?: string;
      attribue_par: string;
      signature_salarie?: boolean;
      notes?: string;
    }) => api.post<EpiAttribution>('/epi/attributions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epi-attributions'] });
      queryClient.invalidateQueries({ queryKey: ['epi-items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateEpiAttribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; date_retour?: string; notes?: string }) =>
      api.patch<EpiAttribution>(`/epi/attributions/${id}`, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['epi-attributions'] });
      queryClient.invalidateQueries({ queryKey: ['epi-attributions', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['epi-items'] });
    },
  });
}

// ─── Controles ──────────────────────────────────────

interface ControlesResponse {
  controles: (EpiControle & { epi_items: EpiItem & { epi_categories: EpiCategory } })[];
  total: number;
  page: number;
  limit: number;
}

interface ControleFilters {
  epi_item_id?: string;
  page?: number;
  limit?: number;
}

export function useEpiControles(filters?: ControleFilters) {
  const params = new URLSearchParams();
  if (filters?.epi_item_id) params.set('epi_item_id', filters.epi_item_id);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();

  return useQuery<ControlesResponse>({
    queryKey: ['epi-controles', filters],
    queryFn: () => api.get(`/epi/controles${qs ? `?${qs}` : ''}`),
  });
}

export function useCreateEpiControle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      epi_item_id: string;
      date_controle: string;
      controleur: string;
      resultat: string;
      observations?: string;
      prochain_controle?: string;
    }) => api.post<EpiControle>('/epi/controles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epi-controles'] });
      queryClient.invalidateQueries({ queryKey: ['epi-items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ─── Documents ──────────────────────────────────────

export function useAddEpiDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      parentType,
      parentId,
      file,
    }: {
      parentType: 'item' | 'attribution' | 'controle';
      parentId: string;
      file: File;
    }) => {
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

      const res = await fetch(
        `${baseUrl}/epi/documents?parent_type=${parentType}&parent_id=${parentId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      if (!res.ok) throw new Error('Erreur upload');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epi-items'] });
    },
  });
}

export function useRemoveEpiDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => api.delete(`/epi/documents/${docId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epi-items'] });
    },
  });
}
