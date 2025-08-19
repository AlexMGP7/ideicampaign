"use client"

import { useState } from "react"
import { emailService } from "../services/emailService"

export function useEmailSending() {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendEmail = async (emailData: {
    to: string
    subject: string
    html: string
    text: string
    from_name: string
    from_email: string
  }) => {
    setSending(true)
    setError(null)
    try {
      const response = await emailService.sendEmail(emailData)
      if (response.ok) {
        return true
      } else {
        setError(response.error || "Error al enviar email")
        return false
      }
    } catch (err) {
      setError("Error de conexión")
      console.error("[v0] Error sending email:", err)
      return false
    } finally {
      setSending(false)
    }
  }

  const getNextBatch = async (campaignId: string, max = 10) => {
    try {
      const response = await emailService.getNextBatch(campaignId, max)
      if (response.ok && response.data) {
        return response.data.items
      }
      return []
    } catch (err) {
      console.error("[v0] Error getting next batch:", err)
      return []
    }
  }

  const markResult = async (destId: string, ok: boolean, error?: string) => {
    try {
      const response = await emailService.markResult(destId, ok, error)
      return response.ok
    } catch (err) {
      console.error("[v0] Error marking result:", err)
      return false
    }
  }

  return {
    sending,
    error,
    sendEmail,
    getNextBatch,
    markResult,
  }
}
