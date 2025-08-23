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
      const res = await campaignService.getAllCampaigns()
      if (res.ok && Array.isArray(res.data)) {
        setCampaigns(res.data)
      } else {
        throw new Error(res.error || "No se pudieron cargar las campañas")
      }
    } catch (e: any) {
      setError(e?.message || "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  // Cargar campaña activa
  const loadActiveCampaign = async () => {
    try {
      const res = await campaignService.getActiveCampaign()
      if (res.ok && res.data) {
        setActiveCampaign(res.data as Campaign)
      }
    } catch (e) {
      // Silencioso: campaña activa puede no existir
    }
  }

  // Crear campaña
  const createCampaign = async (data: Omit<Campaign, "id" | "created_at" | "updated_at">) => {
    setLoading(true)
    setError(null)
    try {
      const res = await campaignService.createCampaign(data)
      if (!res.ok) throw new Error(res.error || "No se pudo crear la campaña")
      // Refrescar listados
      await loadCampaigns()
      await loadActiveCampaign()
      return res
    } catch (e: any) {
      setError(e?.message || "Error al crear la campaña")
      return { ok: false, error: e?.message || "Error" }
    } finally {
      setLoading(false)
    }
  }

  // Cambiar estado
  const changeStatus = async (id: number | string, estado: Campaign["estado"]) => {
    setLoading(true)
    setError(null)
    try {
      const res = await campaignService.changeStatus(id, estado)
      if (!res.ok) throw new Error(res.error || "No se pudo cambiar el estado")
      await loadCampaigns()
      await loadActiveCampaign()
      return res
    } catch (e: any) {
      setError(e?.message || "Error al cambiar estado")
      return { ok: false, error: e?.message || "Error" }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Cargar al montar
    loadCampaigns()
    loadActiveCampaign()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
