// services/campaignService.ts
import { apiService } from "./api";
import type {
  Campaign,
  CampaignStats,
  ApiResponse,
  Recipient,
  RecipientResult,
} from "../types/campaign";

/**
 * Normaliza respuestas que vienen "planas" del backend a { ok, data, ... }.
 * - Si encuentra campana_id o proximo_envio_at en el nivel raíz, los mapea a data.
 * - Preserva ok, message, error originales.
 */
function normalizeCreateResponse(
  raw: any
): ApiResponse<{ campana_id: number; proximo_envio_at?: string }> {
  // Caso ideal: ya viene en formato { ok, data: { campana_id, ... } }
  if (raw && raw.ok && raw.data && typeof raw.data.campana_id !== "undefined") {
    return raw as ApiResponse<{
      campana_id: number;
      proximo_envio_at?: string;
    }>;
  }

  // Caso backend plano: { ok, campana_id, proximo_envio_at }
  if (raw && typeof raw.campana_id !== "undefined") {
    const { campana_id, proximo_envio_at } = raw;
    return {
      ok: !!raw.ok,
      data: {
        campana_id:
          typeof campana_id === "string" ? Number(campana_id) : campana_id,
        proximo_envio_at,
      },
      message: raw.message,
      error: raw.error,
    };
  }

  // Devuelve tal cual si no pudo normalizar
  return raw as ApiResponse<{ campana_id: number; proximo_envio_at?: string }>;
}

function normalizePopulateResponse(
  raw: any,
  campaignId: number
): ApiResponse<{
  campana_id: number;
  insertados: number;
  audiencia_usada: any;
}> {
  // Caso ideal: { ok, data: { insertados, audiencia_usada } }
  if (raw && raw.ok && raw.data) {
    return {
      ok: true,
      data: {
        campana_id: campaignId,
        insertados: Number(raw.data.insertados ?? 0),
        audiencia_usada: raw.data.audiencia_usada,
      },
      message: raw.message,
    };
  }

  // Caso backend plano: { ok, insertados, audiencia_usada }
  if (raw && typeof raw.insertados !== "undefined") {
    return {
      ok: !!raw.ok,
      data: {
        campana_id: campaignId,
        insertados: Number(raw.insertados ?? 0),
        audiencia_usada: raw.audiencia_usada,
      },
      message: raw.message,
      error: raw.error,
    };
  }

  return raw as ApiResponse<{
    campana_id: number;
    insertados: number;
    audiencia_usada: any;
  }>;
}

function normalizeChangeStatusResponse(
  raw: any
): ApiResponse<{ actualizadas?: number }> {
  // Si ya trae data, lo dejamos
  if (raw && raw.ok && raw.data)
    return raw as ApiResponse<{ actualizadas?: number }>;

  // Backend plano: { ok, actualizadas }
  if (raw && typeof raw.actualizadas !== "undefined") {
    return {
      ok: !!raw.ok,
      data: { actualizadas: Number(raw.actualizadas) },
      message: raw.message,
      error: raw.error,
    };
  }

  return raw as ApiResponse<{ actualizadas?: number }>;
}

function normalizeNextRecipientResponse(
  raw: any
): ApiResponse<Recipient> & { next_at?: string } {
  // Caso ideal: ya trae data
  if (raw?.ok && raw?.data) return raw as ApiResponse<Recipient>;

  // Compat backend: item | items[0]
  const item =
    raw?.item ?? (Array.isArray(raw?.items) ? raw.items[0] : undefined);

  if (raw?.ok && item) {
    const mapped: any = {
      dest_id: Number(item.dest_id ?? item.id),
      email: item.email,
      token_baja: item.token_baja,
      // El backend envía "empresa"; la UI usa "empresa_nombre"
      empresa_nombre: item.empresa_nombre ?? item.empresa ?? "",
      sitio_web: item.sitio_web,
      categoria: item.categoria,
    };
    return {
      ok: true,
      data: mapped,
      message: raw.message,
      next_at: raw.next_at,
    };
  }

  // ok pero sin item: devolver next_at para que la UI informe ventana/cuota
  if (raw?.ok) {
    return {
      ok: true,
      data: undefined as any,
      message: raw.message ?? "sin_item",
      next_at: raw.next_at,
    };
  }

  // error tal cual
  return raw as ApiResponse<Recipient>;
}

export class CampaignService {
  async createCampaign(
    campaignData: Omit<Campaign, "id" | "created_at" | "updated_at">
  ): Promise<ApiResponse<{ campana_id: number; proximo_envio_at?: string }>> {
    const raw = await apiService.post<any>(
      "/campana/crear_campana.php",
      campaignData
    );
    return normalizeCreateResponse(raw);
  }

  async changeStatus(
    campaignId: number | string,
    estado: Campaign["estado"]
  ): Promise<ApiResponse<{ actualizadas?: number }>> {
    const raw = await apiService.post<any>("/campana/cambiar_estado.php", {
      campana_id:
        typeof campaignId === "string" ? Number(campaignId) : campaignId,
      estado,
    });
    return normalizeChangeStatusResponse(raw);
  }

  async getActiveCampaign(): Promise<ApiResponse<Campaign>> {
    const response = (await apiService.post(
      "/campana/campanas.get_activa.php",
      {}
    )) as ApiResponse<any>;

    // Algunos backends devuelven { campana: {...} } en raíz.
    if (response?.ok && (response as any).campana) {
      return {
        ok: true,
        data: (response as any).campana,
        message: (response as any).message,
      } as ApiResponse<Campaign>;
    }
    return response as ApiResponse<Campaign>;
  }

  async populateRecipients(
    campaignId: number | string,
    audiencia?: Campaign["audiencia"]
  ): Promise<
    ApiResponse<{
      campana_id: number;
      insertados: number;
      audiencia_usada: any;
    }>
  > {
    const payload: any = {
      campana_id:
        typeof campaignId === "string" ? Number(campaignId) : campaignId,
    };
    if (audiencia) payload.audiencia = audiencia;

    const raw = await apiService.post<any>(
      "/campana/campanas.poblar_destinatarios.php",
      payload
    );
    return normalizePopulateResponse(raw, payload.campana_id);
  }

  async getStatusSummary(
    campaignId: number | string
  ): Promise<ApiResponse<CampaignStats>> {
    return apiService.post("/campana/campanas.estado_resumen.php", {
      campana_id:
        typeof campaignId === "string" ? Number(campaignId) : campaignId,
    });
  }

  /**
   * Flujo Crear → Poblar → Cambiar a "en_ejecucion"
   * Robusto a respuestas planas (top-level) y normalizadas (con data).
   */
  async createAndStartCampaign(
    campaignData: Omit<Campaign, "id" | "created_at" | "updated_at">
  ): Promise<ApiResponse<{ campana_id: number; insertados?: number }>> {
    try {
      // 1) Crear
      const createResponse = await this.createCampaign(campaignData);

      // Fallback por si algún entorno devuelve plano y no pasó por normalize (defensa extra)
      const topLevelId =
        (createResponse as any)?.campana_id ??
        (createResponse as any)?.data?.campana_id;

      if (!createResponse.ok || typeof topLevelId === "undefined") {
        return {
          ok: false,
          error:
            (createResponse as any)?.error ||
            "No se recibió campana_id al crear la campaña",
        };
      }

      const campaignId: number =
        typeof topLevelId === "string" ? Number(topLevelId) : topLevelId;

      // 2) Poblar destinatarios
      const populateResponse = await this.populateRecipients(
        campaignId,
        campaignData.audiencia
      );
      if (!populateResponse.ok) {
        return {
          ok: false,
          error:
            (populateResponse as any)?.error || "Error al poblar destinatarios",
        };
      }

      // 3) Cambiar estado a "en_ejecucion"
      const statusResponse = await this.changeStatus(
        campaignId,
        "en_ejecucion"
      );
      if (!statusResponse.ok) {
        return {
          ok: false,
          error:
            (statusResponse as any)?.error ||
            "No se pudo cambiar el estado a en_ejecucion",
        };
      }

      return {
        ok: true,
        data: {
          campana_id: campaignId,
          insertados: populateResponse.data?.insertados,
        },
        message: "Campaña creada y puesta en ejecución exitosamente",
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  // Mock de listado (igual que tu versión actual)
  async getAllCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ok: true,
          data: [
            {
              id: 1,
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
                  franjas: [["08:30", "21:00"]],
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
        });
      }, 500);
    });
  }

  async getCampaignStatus(
    campaignId: number | string,
    sinceId = 0,
    limit = 50
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.post<any>(
        "/campana/campanas.status.php",
        {
          campana_id:
            typeof campaignId === "string" ? Number(campaignId) : campaignId,
          since_id: sinceId,
          limit: limit,
        }
      );

      if (!response || typeof response !== "object") {
        return { ok: false, error: "Respuesta inválida del servidor" };
      }

      if (!response.ok) {
        return { ok: false, error: response.error || "Error del servidor" };
      }

      // --- Normalización al shape que consume el front ---
      const camp = { ...(response.campana ?? {}) };

      // Parsear JSON si backend lo manda como string
      try {
        if (camp.ritmo && typeof camp.ritmo === "string")
          camp.ritmo = JSON.parse(camp.ritmo);
      } catch {}
      try {
        if (camp.audiencia && typeof camp.audiencia === "string")
          camp.audiencia = JSON.parse(camp.audiencia);
      } catch {}

      const s = response.resumen ?? {};
      const resumen = {
        en_cola: Number(s.en_cola ?? 0),
        procesando: Number(s.procesando ?? 0),
        enviados: Number(s.enviado ?? 0), // map: enviado -> enviados
        rebotados: Number(s.rebote ?? 0), // map: rebote -> rebotados
        bajas: Number(s.baja ?? 0),
        error: Number(s.error ?? 0),
        bloqueado: Number(s.bloqueado ?? 0),
      };

      const metricas = {
        abiertos_unicos: Number(response.metricas?.abiertos_unicos ?? 0),
        clic_unicos: Number(response.metricas?.clic_unicos ?? 0),
        open_rate_uni_pct: Number(response.metricas?.open_rate_uni_pct ?? 0),
        ctr_uni_pct: Number(response.metricas?.ctr_uni_pct ?? 0),
        bounce_rate_pct: Number(response.metricas?.bounce_rate_pct ?? 0),
      };

      const progreso = {
        porcentaje: Number(response.progreso ?? 0), // backend ya trae 0..100
      };

      const ultimos = Array.isArray(response.ultimos) ? response.ultimos : [];

      const actividades = Array.isArray(response.actividades)
        ? response.actividades
        : Array.isArray(response.llamadas)
        ? response.llamadas
        : [];

      const next_cursor =
        typeof response.next_cursor === "number"
          ? response.next_cursor
          : Number(response.next_cursor ?? 0);

      const normalized = {
        ok: true,
        campana: camp,
        resumen,
        metricas,
        progreso,
        ultimos,
        worker: response.worker ?? null,
        actividades,
        llamadas: actividades, // alias
        next_cursor,
      };

      return { ok: true, data: normalized };
    } catch (error) {
      console.error("[v0] getCampaignStatus error:", error);
      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error de conexión con el servidor",
      };
    }
  }
}
export const campaignService = new CampaignService();
