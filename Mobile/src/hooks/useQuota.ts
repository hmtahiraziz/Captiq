<<<<<<< HEAD
import { useQuery } from '@tanstack/react-query';
import * as authService from '../services/auth.service';

export const quotaKeys = {
  all: ['quota'] as const,
  today: () => [...quotaKeys.all, 'today'] as const,
};

export function useQuota(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: quotaKeys.today(),
    queryFn: () => authService.getQuota(),
    enabled: options?.enabled ?? true,
    // Always treat as fresh-enough to refetch when Profile focuses or after scans.
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  });
}
=======
import { useQuery } from '@tanstack/react-query';
import * as authService from '../services/auth.service';

export const quotaKeys = {
  all: ['quota'] as const,
  today: () => [...quotaKeys.all, 'today'] as const,
};

export function useQuota(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: quotaKeys.today(),
    queryFn: () => authService.getQuota(),
    enabled: options?.enabled ?? true,
    // Always treat as fresh-enough to refetch when Profile focuses or after scans.
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  });
}
>>>>>>> c87195a43bac9b793e933ef90ea71ba0cb2217de
