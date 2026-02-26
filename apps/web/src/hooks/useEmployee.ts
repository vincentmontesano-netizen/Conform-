import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Employee,
  EmployeeWithRelations,
  EmployeeSearchResult,
  EmployeeStats,
  EmployeeFilters,
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from '@conform-plus/shared';

// ─── List ───────────────────────────────────────────

export function useEmployees(filters?: EmployeeFilters) {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.site_id) params.set('site_id', filters.site_id);
  if (filters?.is_active !== undefined) params.set('is_active', String(filters.is_active));
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();

  return useQuery<{ employees: Employee[]; total: number; page: number; limit: number }>({
    queryKey: ['employees', filters],
    queryFn: () => api.get(`/employees${qs ? `?${qs}` : ''}`),
  });
}

// ─── Detail ─────────────────────────────────────────

export function useEmployee(id: string) {
  return useQuery<EmployeeWithRelations>({
    queryKey: ['employees', id],
    queryFn: () => api.get(`/employees/${id}`),
    enabled: !!id,
  });
}

// ─── Search (autocomplete) ──────────────────────────

export function useEmployeeSearch(query: string) {
  return useQuery<EmployeeSearchResult[]>({
    queryKey: ['employees-search', query],
    queryFn: () => api.get(`/employees/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
  });
}

// ─── Stats ──────────────────────────────────────────

export function useEmployeeStats() {
  return useQuery<EmployeeStats>({
    queryKey: ['employee-stats'],
    queryFn: () => api.get('/employees/stats'),
  });
}

// ─── Create ─────────────────────────────────────────

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeInput) =>
      api.post<Employee>('/employees', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] });
    },
  });
}

// ─── Update ─────────────────────────────────────────

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateEmployeeInput & { id: string }) =>
      api.patch<Employee>(`/employees/${id}`, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] });
    },
  });
}

// ─── Delete (soft) ──────────────────────────────────

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] });
    },
  });
}

// ─── Import from RUP ────────────────────────────────

export function useImportEmployeesFromRup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ imported: number }>('/employees/import'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] });
    },
  });
}
