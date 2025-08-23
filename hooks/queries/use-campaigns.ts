"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { campaignService } from "@/services/campaignService"
import { queryKeys } from "@/lib/query-client"
import type { Campaign } from "@/types/campaign"
import { useToast } from "@/hooks/use-toast"

export function useCampaigns() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Query para todas las campañas
  const campaignsQuery = useQuery({
    queryKey: queryKeys.campaigns.lists(),
    queryFn: async () => {
      const response = await campaignService.getAllCampaigns()
      if (!response.ok) {
        throw new Error(response.error || "Error al cargar campañas")
      }
      return response.data
    },
  })

  // Query para campaña activa
  const activeCampaignQuery = useQuery({
    queryKey: queryKeys.campaigns.active(),
    queryFn: async () => {
      const response = await campaignService.getActiveCampaign()
      if (!response.ok) {
        return null // Campaña activa puede no existir
      }
      return response.data
    },
  })

  // Mutation para crear campaña
  const createCampaignMutation = useMutation({
    mutationFn: async (data: Omit<Campaign, "id" | "created_at" | "updated_at">) => {
      const response = await campaignService.createCampaign(data)
      if (!response.ok) {
        throw new Error(response.error || "Error al crear campaña")
      }
      return response
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all })
      toast({
        variant: "default",
        title: "Campaña creada",
        description: "La campaña se creó exitosamente",
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

  // Mutation para crear y ejecutar campaña
  const createAndStartMutation = useMutation({
    mutationFn: async (data: Omit<Campaign, "id" | "created_at" | "updated_at">) => {
      const response = await campaignService.createAndStartCampaign(data)
      if (!response.ok) {
        throw new Error(response.error || "Error al crear y ejecutar campaña")
      }
      return response
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all })
      toast({
        variant: "default",
        title: "Campaña creada y ejecutada",
        description: `Se creó la campaña con ${data.data?.insertados || 0} destinatarios`,
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

  // Mutation para cambiar estado
  const changeStatusMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: number | string; estado: Campaign["estado"] }) => {
      const response = await campaignService.changeStatus(id, estado)
      if (!response.ok) {
        throw new Error(response.error || "Error al cambiar estado")
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all })
      toast({
        variant: "default",
        title: "Estado actualizado",
        description: "El estado de la campaña se actualizó correctamente",
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
    campaigns: campaignsQuery.data || [],
    activeCampaign: activeCampaignQuery.data,

    // Estados de loading
    isLoading: campaignsQuery.isLoading || activeCampaignQuery.isLoading,
    isCreating: createCampaignMutation.isPending || createAndStartMutation.isPending,
    isChangingStatus: changeStatusMutation.isPending,

    // Estados de error
    error: campaignsQuery.error || activeCampaignQuery.error,

    // Acciones
    createCampaign: createCampaignMutation.mutate,
    createAndStartCampaign: createAndStartMutation.mutate,
    changeStatus: changeStatusMutation.mutate,

    // Refetch manual
    refetch: () => {
      campaignsQuery.refetch()
      activeCampaignQuery.refetch()
    },
  }
}
