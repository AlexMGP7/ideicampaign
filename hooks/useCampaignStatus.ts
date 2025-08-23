"use client"

import { useState, useEffect, useRef } from "react"
import type { CampaignStatusData } from "../types/campaign"
import { campaignService } from "@/services/campaignService"

export function useCampaignStatus(campaignId: string | number | null) {
  const [data, setData] = useState<CampaignStatusData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const cursorRef = useRef<number>(0)

  const fetchStatus = async (isIncremental = false) => {
    if (!campaignId) return
    setLoading(true)
    setError(null)
    try {
      const res = await campaignService.getCampaignStatus(campaignId, isIncremental ? cursorRef.current : 0)
      if (!res.ok) throw new Error(res.error || "No se pudo obtener el estado")
      const payload = res.data as CampaignStatusData

      if (!isIncremental || !data) {
        setData(payload)
      } else {
        // Merge incremental data
        setData(prev => {
          if (!prev) return payload
          return {
            ...payload,
            // Mantener acumulados y anexar nuevas actividades
            actividades: [...(prev.actividades || []), ...(payload.actividades || [])],
            llamadas: [...(prev.llamadas || []), ...(payload.llamadas || [])],
            resumen: payload.resumen || prev.resumen,
            metricas: payload.metricas || prev.metricas,
            progreso: payload.progreso || prev.progreso,
          }
        })
      }
      // actualizar cursor
      if (typeof payload.next_cursor === "number" && !Number.isNaN(payload.next_cursor)) {
        cursorRef.current = payload.next_cursor
        setCursor(payload.next_cursor)
      }
    } catch (e: any) {
      setError(e?.message || "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const startPolling = (ms = 3000) => {
    if (intervalRef.current) return
    // Ejecutar una vez y luego intervalos
    fetchStatus(true)
    intervalRef.current = setInterval(() => fetchStatus(true), ms) as any
  }

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current as any)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    cursorRef.current = 0
    setCursor(0)
    if (campaignId) {
      fetchStatus(false)
      startPolling()
    }
    return () => stopPolling()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  return {
    data,
    loading,
    error,
    refetch: () => { cursorRef.current = 0; setCursor(0); fetchStatus(false) },
    startPolling,
    stopPolling,
  }
}
