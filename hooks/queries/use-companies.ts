"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { empresaService } from "@/services/empresaService"
import { queryKeys } from "@/lib/query-client"
import type { Empresa, EmpresaFilters } from "@/types/empresa"
import { useToast } from "@/hooks/use-toast"

export function useCompanies(filters: EmpresaFilters = { page: 1, per_page: 50, order_by: "recientes" }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Query para lista de empresas
  const companiesQuery = useQuery({
    queryKey: queryKeys.companies.list(filters),
    queryFn: async () => {
      const response = await empresaService.listarEmpresas(filters)
      if (!response.ok) {
        throw new Error("Error al cargar empresas")
      }
      return {
        data: response.data,
        meta: response.meta,
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos para datos que cambian frecuentemente
  })

  // Mutation para actualizar empresa
  const updateCompanyMutation = useMutation({
    mutationFn: async (params: {
      empresa_id: number
      estado: string
      notas?: string
      telefono?: string
      sitio_web?: string
      contactada_manual: boolean
    }) => {
      const response = await empresaService.actualizarEstado(params)
      if (!response.ok) {
        throw new Error(response.error || "Error al actualizar empresa")
      }
      return response
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(variables.empresa_id) })

      toast({
        variant: "default",
        title: "Empresa actualizada",
        description: "Los datos se actualizaron correctamente",
      })
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    },
  })

  // Mutation para eliminar empresa
  const deleteCompanyMutation = useMutation({
    mutationFn: async (empresaId: number) => {
      const response = await empresaService.eliminarEmpresa(empresaId)
      if (!response.ok) {
        throw new Error(response.error || "Error al eliminar empresa")
      }
      return response
    },
    onSuccess: (data, empresaId) => {
      // Actualización optimista - remover de cache
      queryClient.setQueryData(queryKeys.companies.list(filters), (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.filter((empresa: Empresa) => empresa.id !== empresaId),
          meta: {
            ...old.meta,
            total: Math.max(0, old.meta.total - 1),
          },
        }
      })

      // Invalidar para refrescar desde servidor
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.lists() })

      const impacto = data.impacto
      const detalle = impacto
        ? `Se borraron ${impacto.emails_borrados} emails y ${impacto.destinatarios_borrados} destinatarios.`
        : ""

      toast({
        variant: "default",
        title: "Empresa eliminada",
        description: `La empresa fue eliminada correctamente. ${detalle}`,
      })
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    },
  })

  return {
    // Datos
    companies: companiesQuery.data?.data || [],
    totalCompanies: companiesQuery.data?.meta?.total || 0,
    currentPage: companiesQuery.data?.meta?.page || 1,

    // Estados
    isLoading: companiesQuery.isLoading,
    isUpdating: updateCompanyMutation.isPending,
    isDeleting: deleteCompanyMutation.isPending,
    error: companiesQuery.error,

    // Acciones
    updateCompany: updateCompanyMutation.mutate,
    deleteCompany: deleteCompanyMutation.mutate,

    // Refetch
    refetch: companiesQuery.refetch,
  }
}
