"use client"

import { useState, useEffect } from "react"
import type { CampaignStats } from "../types/campaign"
import { campaignService } from "../services/campaignService"

export function useCampaignStats(campaignId?: number | string) {
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async (id?: number | string) => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await campaignService.getStatusSummary(id)
      if (res.ok) {
        setStats(res.data as CampaignStats)
      } else {
        throw new Error(res.error || "No se pudo obtener el estado")
      }
    } catch (e: any) {
      setError(e?.message || "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (campaignId !== undefined && campaignId !== null) {
      loadStats(campaignId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  return {
    stats,
    loading,
    error,
    loadStats,
    refresh: () => loadStats(campaignId),
  }
}
