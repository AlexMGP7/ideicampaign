"use client";

import { useState, useEffect, useRef } from "react";
import type { CampaignStatusData } from "../types/campaign";
import { campaignService } from "@/services/campaignService";

export function useCampaignStatus(campaignId: string | number | null) {
  const [data, setData] = useState<CampaignStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cursorRef = useRef<number>(0);

  const fetchStatus = async (isIncremental = false) => {
    if (!campaignId) return;

    try {
      setLoading(!isIncremental);

      const response = await campaignService.getCampaignStatus(
        campaignId,
        isIncremental ? cursorRef.current : 0,
        50
      );

      if (response.ok && response.data) {
        const newData = response.data;

        if (isIncremental && data) {
          setData((prev) =>
            prev
              ? {
                  ...newData,
                  ultimos: [
                    ...(prev.ultimos || []),
                    ...(newData.ultimos || []),
                  ],
                  actividades: [
                    ...(prev.actividades || []),
                    ...(newData.actividades || []),
                  ],
                  llamadas: [
                    ...(prev.llamadas || []),
                    ...(newData.llamadas || []),
                  ],
                }
              : newData
          );
        } else {
          setData(newData);
        }

        if (newData.next_cursor) {
          setCursor(newData.next_cursor);
          cursorRef.current = newData.next_cursor;
        }

        setError(null);
      } else {
        setError(response.error || "Error desconocido al obtener estado");
      }
    } catch (err) {
      console.error("[v0] Campaign status fetch error:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (intervalRef.current) return;

    console.log("[v0] Starting campaign status polling");

    // Fetch immediately (full data)
    fetchStatus(false);

    // Then poll every 3 seconds with incremental updates
    intervalRef.current = setInterval(() => fetchStatus(true), 3000);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      console.log("[v0] Stopping campaign status polling");
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (campaignId) {
      setCursor(0);
      cursorRef.current = 0;
      console.log(
        "[v0] Campaign ID changed, starting polling for:",
        campaignId
      );
      startPolling();
    } else {
      console.log("[v0] No campaign ID, stopping polling");
      stopPolling();
    }

    return () => stopPolling();
  }, [campaignId]);

  return {
    data,
    loading,
    error,
    refetch: () => {
      setCursor(0);
      cursorRef.current = 0;
      fetchStatus(false);
    },
    startPolling,
    stopPolling,
  };
}
