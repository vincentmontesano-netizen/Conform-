import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { InspectionReadiness } from '@conform-plus/shared';

export function useInspectionReadiness() {
  return useQuery<InspectionReadiness>({
    queryKey: ['inspection-readiness'],
    queryFn: () => api.get('/inspection/readiness'),
  });
}
