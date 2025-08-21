"use client"

import { useState, useEffect, useRef } from "react"
import type { CampaignStatusData } from "../types/campaign"

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

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const apiKey = process.env.NEXT_PUBLIC_API_KEY

      if (!apiBaseUrl || !apiKey) {
        throw new Error("Configuración de API faltante")
      }

      const response = await fetch(`${apiBaseUrl}/campana/campanas.status.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify({
          campana_id: campaignId,
          limit: 50,
          since_id: currentCursor,
        }),
      })

      const responseData = await response.json()

      console.log("[v0] Raw campaign status response:", {
        response: responseData,
        responseType: typeof responseData,
        responseKeys: responseData ? Object.keys(responseData) : "null",
        ok: responseData?.ok,
        error: responseData?.error,
      })

      if (responseData.ok) {
        const newData = responseData as CampaignStatusData

        console.log("[v0] Processed campaign data:", newData)

        if (isIncremental && data) {
          setData((prev) =>
            prev
              ? {
                  ...newData,
                  ultimos: [...prev.ultimos, ...newData.ultimos],
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
        const errorMessage = responseData?.error || "Error desconocido al obtener el estado de la campaña"
        console.error("[v0] Campaign status error:", {
          error: responseData?.error,
          errorType: typeof responseData?.error,
          fullResponse: responseData,
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
