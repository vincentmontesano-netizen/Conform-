'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ActionPlanLog {
  id: string;
  action_plan_id: string;
  event_type: string;
  previous_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  comment: string | null;
  created_by: string;
  created_at: string;
}

export function useActionPlanLogs(duerpId: string, planId: string) {
  return useQuery({
    queryKey: ['duerps', duerpId, 'action-plans', planId, 'logs'],
    queryFn: () => api.get<ActionPlanLog[]>(`/duerps/${duerpId}/action-plans/${planId}/logs`),
    enabled: !!duerpId && !!planId,
  });
}

export function useAddActionPlanLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      duerpId,
      planId,
      comment,
    }: {
      duerpId: string;
      planId: string;
      comment: string;
    }) => api.post(`/duerps/${duerpId}/action-plans/${planId}/logs`, { comment }),
    onSuccess: (_, { duerpId, planId }) => {
      queryClient.invalidateQueries({
        queryKey: ['duerps', duerpId, 'action-plans', planId, 'logs'],
      });
    },
  });
}
