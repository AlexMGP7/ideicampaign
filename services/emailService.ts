import { apiService } from "./api"
import type {
  ApiResponse,
  TemplateRenderRequest,
  TemplateRenderResponse,
  EmailSendRequest,
} from "../types/campaign"

export class EmailService {
  // Asegura ids numéricos y mapea destinatario_id -> dest_id si hace falta
  private normalizeSendPayload(d: any) {
    const campana_id =
      typeof d?.campana_id === "string" ? Number(d.campana_id) : d?.campana_id

    const dest_id = d?.dest_id ?? d?.destinatario_id ?? d?.dest?.dest_id

    const payload = {
      ...d,
      campana_id,
      dest_id,
      // defaults seguros
      text: d?.text ?? "",
      reply_to: d?.reply_to ?? d?.from_email,
      track_opens: !!d?.track_opens,
      track_clicks: !!d?.track_clicks,
    }

    // Evitamos enviar el alias para no confundir al backend
    delete (payload as any).destinatario_id
    return payload
  }

  private normalizeRenderPayload(d: any) {
    return {
      ...d,
      campana_id: typeof d?.campana_id === "string" ? Number(d.campana_id) : d?.campana_id,
    }
  }

  async sendEmail(emailData: EmailSendRequest | any): Promise<ApiResponse> {
    const payload = this.normalizeSendPayload(emailData)
    return apiService.post("/campana/email.enviar.php", payload)
  }

  async renderTemplate(
    templateData: TemplateRenderRequest | any,
  ): Promise<ApiResponse<TemplateRenderResponse>> {
    const payload = this.normalizeRenderPayload(templateData)
    return apiService.post("/campana/plantillas.render.php", payload)
  }
}

export const emailService = new EmailService()
