"use client"

import { useState, useEffect } from "react"
import type { CampaignStats } from "../types/campaign"
import { campaignService } from "../services/campaignService"

export function useCampaignStats(campaignId?: string) {
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async (id?: string) => {
    if (!id) return

    setLoading(true)
    setError(null)
    try {
      const response = await campaignService.getCampaignStats(id)
      if (response.ok && response.data) {
        setStats(response.data)
      } else {
        setError(response.error || "Error al cargar estadísticas")
      }
    } catch (err) {
      setError("Error de conexión")
      console.error("[v0] Error loading stats:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (campaignId) {
      loadStats(campaignId)
    }
  }, [campaignId])

  return {
    stats,
    loading,
    error,
    loadStats,
    refresh: () => loadStats(campaignId),
  }
}
