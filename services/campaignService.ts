import { apiService } from "./api"
import type { Campaign, CampaignStats, ApiResponse } from "../types/campaign"

export class CampaignService {
  async createCampaign(
    campaignData: Omit<Campaign, "id" | "created_at" | "updated_at">,
  ): Promise<ApiResponse<{ campana_id: string; proximo_envio_at?: string }>> {
    return apiService.post("/crear_campana.php", campaignData)
  }

  // Cambiar estado de campaña
  async changeStatus(campaignId: string, estado: Campaign["estado"]): Promise<ApiResponse> {
    return apiService.post("/cambiar_estado.php", {
      campana_id: campaignId,
      estado,
    })
  }

  // Obtener campaña activa
  async getActiveCampaign(): Promise<ApiResponse<{ campana: Campaign }>> {
    return apiService.post("/campanas.get_activa.php", {})
  }

  async populateRecipients(
    campaignId: string,
    audiencia?: Campaign["audiencia"],
  ): Promise<ApiResponse<{ insertados: number; audiencia_usada: any }>> {
    const payload: any = { campana_id: campaignId }
    if (audiencia) {
      payload.audiencia = audiencia
    }
    return apiService.post("/campanas.poblar_destinatarios.php", payload)
  }

  // Obtener estadísticas de campaña
  async getCampaignStats(campaignId: string): Promise<ApiResponse<CampaignStats>> {
    return apiService.post("/campanas.estado_resumen.php", {
      campana_id: campaignId,
    })
  }

  // Finalizar campaña si está vacía
  async finalizeCampaignIfEmpty(campaignId: string): Promise<ApiResponse> {
    return apiService.post("/campanas.finalizar_si_vacia.php", {
      campana_id: campaignId,
    })
  }

  async createAndStartCampaign(
    campaignData: Omit<Campaign, "id" | "created_at" | "updated_at">,
  ): Promise<ApiResponse<{ campana_id: string; insertados?: number }>> {
    try {
      // 1. Crear campaña
      const createResponse = await this.createCampaign(campaignData)
      if (!createResponse.ok || !createResponse.campana_id) {
        return createResponse
      }

      const campaignId = createResponse.campana_id

      // 2. Poblar destinatarios
      const populateResponse = await this.populateRecipients(campaignId, campaignData.audiencia)
      if (!populateResponse.ok) {
        return populateResponse
      }

      // 3. Cambiar a estado "en_ejecucion"
      const statusResponse = await this.changeStatus(campaignId, "en_ejecucion")
      if (!statusResponse.ok) {
        return statusResponse
      }

      return {
        ok: true,
        campana_id: campaignId,
        insertados: populateResponse.insertados,
        message: "Campaña creada y puesta en ejecución exitosamente",
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Obtener todas las campañas (mock por ahora, agregar endpoint si existe)
  async getAllCampaigns(): Promise<ApiResponse<Campaign[]>> {
    // Por ahora retornamos datos mock hasta que tengas el endpoint
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ok: true,
          data: [
            {
              id: "1",
              nombre: "Prospección 2025-08-12",
              remitente_nombre: "Luis García",
              remitente_email: "luisgarcia@ideidev.com",
              proveedor: "zeptomail",
              estado: "en_ejecucion",
              tz: "Europe/Amsterdam",
              ritmo: {
                quota: { emails: 12, horas: 6 },
                activo: {
                  dias: [1, 2, 3, 4, 5],
                  franjas: [
                    ["09:30", "13:00"],
                    ["15:30", "19:00"],
                  ],
                },
                jitter_seg: { min: 30, max: 240 },
              },
              audiencia: {
                politica_email_por_empresa: "uno",
                excluir: { lista_supresion: true },
                limite_empresas: 1000,
              },
            },
          ],
        })
      }, 500)
    })
  }
}

export const campaignService = new CampaignService()
