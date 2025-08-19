import { apiService } from "./api"
import type { ApiResponse, TemplateRenderRequest, TemplateRenderResponse, EmailSendRequest } from "../types/campaign"

export class EmailService {
  async sendEmail(emailData: EmailSendRequest): Promise<ApiResponse> {
    return apiService.post("/campana/email.enviar.php", emailData)
  }

  async renderTemplate(templateData: TemplateRenderRequest): Promise<ApiResponse<TemplateRenderResponse>> {
    return apiService.post("/campana/plantillas.render.php", templateData)
  }
}

export const emailService = new EmailService()
