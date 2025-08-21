"use client"

import { useState, useEffect } from "react"
import type { Campaign } from "../types/campaign"
import { campaignService } from "../services/campaignService"

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar todas las campañas
  const loadCampaigns = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await campaignService.getAllCampaigns()
      if (response.ok && response.data) {
        setCampaigns(response.data)
      } else {
        setError(response.error || "Error al cargar campañas")
      }
    } catch (err) {
      setError("Error de conexión")
      console.error("[v0] Error loading campaigns:", err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar campaña activa
  const loadActiveCampaign = async () => {
    try {
      const response = await campaignService.getActiveCampaign();
      if (response.ok && response.data) {
        setActiveCampaign(response.data);
      }
    } catch (err) {
      console.error("[v0] Error loading active campaign:", err)
    }
  }

  // Crear nueva campaña
  const createCampaign = async (campaignData: Omit<Campaign, "id">) => {
    setLoading(true)
    setError(null)
    try {
      const response = await campaignService.createCampaign(campaignData)
      if (response.ok) {
        await loadCampaigns() // Recargar lista
        return response.data
      } else {
        setError(response.error || "Error al crear campaña")
        return null
      }
    } catch (err) {
      setError("Error de conexión")
      console.error("[v0] Error creating campaign:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Cambiar estado de campaña
  const changeStatus = async (campaignId: string, estado: Campaign["estado"]) => {
    try {
      const response = await campaignService.changeStatus(campaignId, estado)
      if (response.ok) {
        await loadCampaigns()
        await loadActiveCampaign()
        return true
      } else {
        setError(response.error || "Error al cambiar estado")
        return false
      }
    } catch (err) {
      setError("Error de conexión")
      console.error("[v0] Error changing status:", err)
      return false
    }
  }

  useEffect(() => {
    loadCampaigns()
    loadActiveCampaign()
  }, [])

  return {
    campaigns,
    activeCampaign,
    loading,
    error,
    loadCampaigns,
    loadActiveCampaign,
    createCampaign,
    changeStatus,
  }
}
