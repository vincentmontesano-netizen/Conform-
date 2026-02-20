'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DuerpDocument } from '@conform-plus/shared';

export function useDuerps() {
  return useQuery({
    queryKey: ['duerps'],
    queryFn: () => api.get<DuerpDocument[]>('/duerps'),
  });
}

export function useDuerp(id: string) {
  return useQuery({
    queryKey: ['duerps', id],
    queryFn: () => api.get<DuerpDocument>(`/duerps/${id}`),
    enabled: !!id,
  });
}

export function useCreateDuerp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { company_id: string; site_id?: string }) =>
      api.post<DuerpDocument>('/duerps', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duerps'] });
    },
  });
}

export function useValidateDuerp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (duerpId: string) =>
      api.post(`/duerps/${duerpId}/validate`),
    onSuccess: (_, duerpId) => {
      queryClient.invalidateQueries({ queryKey: ['duerps'] });
      queryClient.invalidateQueries({ queryKey: ['duerps', duerpId] });
    },
  });
}

export function useDuerpVersions(duerpId: string) {
  return useQuery({
    queryKey: ['duerps', duerpId, 'versions'],
    queryFn: () => api.get(`/duerps/${duerpId}/versions`),
    enabled: !!duerpId,
  });
}

export function useAddWorkUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ duerpId, data }: { duerpId: string; data: { name: string; description?: string } }) =>
      api.post(`/duerps/${duerpId}/work-units`, data),
    onSuccess: (_, { duerpId }) => {
      queryClient.invalidateQueries({ queryKey: ['duerps', duerpId] });
    },
  });
}

export function useAddRisk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ duerpId, workUnitId, data }: { duerpId: string; workUnitId: string; data: any }) =>
      api.post(`/duerps/${duerpId}/work-units/${workUnitId}/risks`, data),
    onSuccess: (_, { duerpId }) => {
      queryClient.invalidateQueries({ queryKey: ['duerps', duerpId] });
    },
  });
}

export function useAddActionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ duerpId, data }: { duerpId: string; data: any }) =>
      api.post(`/duerps/${duerpId}/action-plans`, data),
    onSuccess: (_, { duerpId }) => {
      queryClient.invalidateQueries({ queryKey: ['duerps', duerpId] });
    },
  });
}

export function useUpdateActionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ duerpId, planId, data }: { duerpId: string; planId: string; data: any }) =>
      api.patch(`/duerps/${duerpId}/action-plans/${planId}`, data),
    onSuccess: (_, { duerpId }) => {
      queryClient.invalidateQueries({ queryKey: ['duerps', duerpId] });
    },
  });
}
