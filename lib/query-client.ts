import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
      retry: (failureCount, error: any) => {
        // No reintentar en errores 4xx
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Keys para queries organizadas por dominio
export const queryKeys = {
  campaigns: {
    all: ["campaigns"] as const,
    lists: () => [...queryKeys.campaigns.all, "list"] as const,
    list: (filters: any) => [...queryKeys.campaigns.lists(), filters] as const,
    details: () => [...queryKeys.campaigns.all, "detail"] as const,
    detail: (id: string | number) => [...queryKeys.campaigns.details(), id] as const,
    stats: (id: string | number) => [...queryKeys.campaigns.detail(id), "stats"] as const,
    status: (id: string | number) => [...queryKeys.campaigns.detail(id), "status"] as const,
    active: () => [...queryKeys.campaigns.all, "active"] as const,
  },
  companies: {
    all: ["companies"] as const,
    lists: () => [...queryKeys.companies.all, "list"] as const,
    list: (filters: any) => [...queryKeys.companies.lists(), filters] as const,
    details: () => [...queryKeys.companies.all, "detail"] as const,
    detail: (id: string | number) => [...queryKeys.companies.details(), id] as const,
  },
} as const
