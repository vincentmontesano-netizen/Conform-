import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  FormationType,
  ConformiteMatrix,
  FormationStats,
  FormationRapportData,
  ConformiteFilters,
  CreateFormationTypeInput,
  UpdateFormationTypeInput,
} from '@conform-plus/shared';

// ─── Formation Types ─────────────────────────────────

export function useFormationTypes() {
  return useQuery<FormationType[]>({
    queryKey: ['formation-types'],
    queryFn: () => api.get('/formations/types'),
  });
}

export function useFormationType(id: string) {
  return useQuery<FormationType>({
    queryKey: ['formation-types', id],
    queryFn: () => api.get(`/formations/types/${id}`),
    enabled: !!id,
  });
}

export function useCreateFormationType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFormationTypeInput) =>
      api.post<FormationType>('/formations/types', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formation-types'] });
      queryClient.invalidateQueries({ queryKey: ['formation-conformite'] });
      queryClient.invalidateQueries({ queryKey: ['formation-stats'] });
    },
  });
}

export function useUpdateFormationType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateFormationTypeInput & { id: string }) =>
      api.patch<FormationType>(`/formations/types/${id}`, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['formation-types'] });
      queryClient.invalidateQueries({ queryKey: ['formation-types', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['formation-conformite'] });
      queryClient.invalidateQueries({ queryKey: ['formation-stats'] });
    },
  });
}

export function useDeleteFormationType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/formations/types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formation-types'] });
      queryClient.invalidateQueries({ queryKey: ['formation-conformite'] });
      queryClient.invalidateQueries({ queryKey: ['formation-stats'] });
    },
  });
}

export function useInitFormationTypes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ created: number; types?: FormationType[] }>('/formations/types/init'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formation-types'] });
      queryClient.invalidateQueries({ queryKey: ['formation-conformite'] });
      queryClient.invalidateQueries({ queryKey: ['formation-stats'] });
    },
  });
}

// ─── Conformite Matrix ───────────────────────────────

export function useConformiteMatrix(filters?: ConformiteFilters) {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.site_id) params.set('site_id', filters.site_id);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.obligatoire_only) params.set('obligatoire_only', 'true');
  const qs = params.toString();

  return useQuery<ConformiteMatrix>({
    queryKey: ['formation-conformite', filters],
    queryFn: () => api.get(`/formations/conformite${qs ? `?${qs}` : ''}`),
  });
}

// ─── Stats ───────────────────────────────────────────

export function useFormationStats() {
  return useQuery<FormationStats>({
    queryKey: ['formation-stats'],
    queryFn: () => api.get('/formations/stats'),
  });
}

// ─── Rapport ─────────────────────────────────────────

export function useFormationRapport() {
  return useQuery<FormationRapportData>({
    queryKey: ['formation-rapport'],
    queryFn: () => api.get('/formations/rapport'),
  });
}
