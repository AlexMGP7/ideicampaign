"use client"

import { useState, useEffect, useRef } from "react"
import { campaignService } from "../services/campaignService"

interface CampaignStatusData {
  campana: {
    id: number
    nombre: string
    estado: string
    tz: string
    proximo_envio_at: string | null
    created_at: string
    started_at: string | null
    finished_at: string | null
  } | null
  resumen: {
    en_cola: number
    bloqueado: number
    procesando: number
    enviado: number
    rebote: number
    baja: number
    error: number
  }
  progreso: number
  ultimos: Array<{
    id: number
    email: string
    estado: string
    actualizado_at: string
    intentos: number
  }>
  worker: {
    alive: boolean
    last_at: string | null
    seconds_since: number
  }
  llamadas: Array<{
    id: number
    ts: string
    etapa: string
    ok: number
    http_status: number
    ms: number
    error: string | null
    dest_id: number
  }>
  next_cursor: number
}

export function useCampaignStatus(campaignId: string | number | null) {
  const [data, setData] = useState<CampaignStatusData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const cursorRef = useRef<number>(0)

  const fetchStatus = async (isIncremental = false) => {
    if (!campaignId) return

    try {
      setLoading(!isIncremental) // Only show loading on initial fetch
      const currentCursor = isIncremental ? cursorRef.current : 0

      console.log("[v0] Fetching campaign status:", { campaignId, currentCursor, isIncremental })

      const response = await campaignService.getCampaignStatus(campaignId, currentCursor, 50)

      console.log("[v0] Raw campaign status response:", {
        response,
        responseType: typeof response,
        responseKeys: response ? Object.keys(response) : "null",
        ok: response?.ok,
        error: response?.error,
        data: response?.data,
      })

      if (response.ok && response.data) {
        const newData = response.data as CampaignStatusData

        console.log("[v0] Processed campaign data:", newData)

        if (isIncremental) {
          setData((prev) =>
            prev
              ? {
                  ...newData,
                  llamadas: [...prev.llamadas, ...newData.llamadas],
                }
              : newData,
          )
        } else {
          setData(newData)
        }

        if (newData.next_cursor) {
          setCursor(newData.next_cursor)
          cursorRef.current = newData.next_cursor
        }

        setError(null)
      } else {
        const errorMessage = response?.error || "Error desconocido al obtener el estado de la campaña"
        console.error("[v0] Campaign status error:", {
          error: response?.error,
          errorType: typeof response?.error,
          fullResponse: response,
          fallbackMessage: errorMessage,
        })
        setError(errorMessage)
      }
    } catch (err) {
      console.error("[v0] Campaign status fetch error:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const startPolling = () => {
    if (intervalRef.current) return

    console.log("[v0] Starting campaign status polling")

    // Fetch immediately (full data)
    fetchStatus(false)

    // Then poll every 3 seconds with incremental updates
    intervalRef.current = setInterval(() => fetchStatus(true), 3000)
  }

  const stopPolling = () => {
    if (intervalRef.current) {
      console.log("[v0] Stopping campaign status polling")
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    if (campaignId) {
      setCursor(0)
      cursorRef.current = 0
      console.log("[v0] Campaign ID changed, starting polling for:", campaignId)
      startPolling()
    } else {
      console.log("[v0] No campaign ID, stopping polling")
      stopPolling()
    }

    return () => stopPolling()
  }, [campaignId])

  return {
    data,
    loading,
    error,
    refetch: () => {
      setCursor(0)
      cursorRef.current = 0
      fetchStatus(false)
    },
    startPolling,
    stopPolling,
  }
}
