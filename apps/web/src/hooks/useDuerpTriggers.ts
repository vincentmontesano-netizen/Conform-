'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DuerpTrigger {
  id: string;
  company_id: string;
  duerp_id: string | null;
  trigger_type: string;
  title: string;
  description: string | null;
  occurred_at: string;
  is_resolved: boolean;
  resolved_by_duerp_version_id: string | null;
  created_by: string;
  created_at: string;
  resolved_at: string | null;
}

export function useDuerpTriggers(resolved?: boolean) {
  const params = resolved !== undefined ? `?resolved=${resolved}` : '';
  return useQuery({
    queryKey: ['duerp-triggers', resolved],
    queryFn: () => api.get<DuerpTrigger[]>(`/duerp-triggers${params}`),
  });
}

export function useDuerpTrigger(id: string) {
  return useQuery({
    queryKey: ['duerp-triggers', id],
    queryFn: () => api.get<DuerpTrigger>(`/duerp-triggers/${id}`),
    enabled: !!id,
  });
}

export function useCreateDuerpTrigger() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      trigger_type: string;
      title: string;
      description?: string;
      occurred_at: string;
      duerp_id?: string;
    }) => api.post<DuerpTrigger>('/duerp-triggers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duerp-triggers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useResolveDuerpTrigger() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      triggerId,
      duerpVersionId,
    }: {
      triggerId: string;
      duerpVersionId?: string;
    }) =>
      api.patch(`/duerp-triggers/${triggerId}/resolve`, {
        resolved_by_duerp_version_id: duerpVersionId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duerp-triggers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
