import { apiService } from "./api"
import type { Recipient, ApiResponse } from "../types/campaign"

export class EmailService {
  // Enviar email directo
  async sendEmail(emailData: {
    to: string
    subject: string
    html: string
    text: string
    from_name: string
    from_email: string
  }): Promise<ApiResponse> {
    return apiService.post("/campana/email.enviar.php", emailData)
  }

  // Obtener siguiente lote de destinatarios
  async getNextBatch(campaignId: string, max = 10): Promise<ApiResponse<{ items: Recipient[] }>> {
    return apiService.post("/campana/destinatarios.next_lote.php", {
      campana_id: campaignId,
      max,
    })
  }

  // Marcar resultado de envío
  async markResult(destId: string, ok: boolean, error?: string): Promise<ApiResponse> {
    return apiService.post("/campana/destinatarios.marcar_resultado.php", {
      dest_id: destId,
      ok,
      error,
    })
  }

  // Desbloquear destinatarios antiguos
  async unlockOldRecipients(campaignId: string, hours = 1): Promise<ApiResponse> {
    return apiService.post("/campana/destinatarios.desbloquear_antiguos.php", {
      campana_id: campaignId,
      horas: hours,
    })
  }
}

export const emailService = new EmailService()
