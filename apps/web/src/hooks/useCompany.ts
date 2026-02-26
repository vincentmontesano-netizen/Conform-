'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Company, Site } from '@conform-plus/shared';

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get<Company[]>('/companies'),
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => api.get<Company & { sites: Site[] }>(`/companies/${id}`),
    enabled: !!id,
  });
}

export function useAutoLinkCompany() {
  return useMutation({
    mutationFn: () => api.get<{ linked: boolean; company_id: string | null }>('/companies/auto-link'),
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Company>) => api.post<Company>('/companies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Company> }) =>
      api.patch<Company>(`/companies/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companies', id] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/companies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

// Sites
export function useSites(companyId: string) {
  return useQuery({
    queryKey: ['companies', companyId, 'sites'],
    queryFn: () => api.get<Site[]>(`/companies/${companyId}/sites`),
    enabled: !!companyId,
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: Partial<Site> }) =>
      api.post<Site>(`/companies/${companyId}/sites`, data),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'sites'] });
      queryClient.invalidateQueries({ queryKey: ['companies', companyId] });
    },
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, siteId, data }: { companyId: string; siteId: string; data: Partial<Site> }) =>
      api.patch<Site>(`/companies/${companyId}/sites/${siteId}`, data),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'sites'] });
      queryClient.invalidateQueries({ queryKey: ['companies', companyId] });
    },
  });
}
