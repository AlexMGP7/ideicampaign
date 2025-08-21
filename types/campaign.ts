export interface Campaign {
  id?: number
  nombre: string
  remitente_nombre: string
  remitente_email: string
  proveedor: "ses" | "sendgrid" | "postmark" | "smtp" | "zeptomail"
  estado?: "borrador" | "preparando" | "en_ejecucion" | "pausada" | "finalizada"
  tz: string
  ritmo: {
    quota: {
      emails: number
      horas: number
    }
    activo: {
      dias: number[] // 1=Lunes..7=Domingo
      franjas: string[][] // [["09:30","13:00"], ["15:30","19:00"]]
    }
    jitter_seg: {
      min: number
      max: number
    }
  }
  audiencia: {
    politica_email_por_empresa: "uno" | "todos"
    excluir: {
      lista_supresion: boolean
      enviados_ultimos_dias?: number
    }
    limite_empresas?: number
    filtro?: {
      q?: string
      has_sitio_web?: boolean
      creadas_desde?: string
      categoria_ids?: number[]
      categoria_nombres?: string[]
    }
    muestreo?: {
      seed: number
    }
  }
  proximo_envio_at?: string
  created_at?: string
  updated_at?: string
  ultimo_intento?: string | null
  totales?: {
    total_destinatarios: number
    en_cola: number
    procesando: number
    enviados: number
    rebotados: number
    bajas: number
    abiertos: number
    clicados: number
    entregados_eventos: number
    spam_eventos: number
    error_eventos: number
  }
  progreso?: {
    procesados: number
    total: number
    porcentaje: number
  }
}

export interface CampaignStats {
  total_destinatarios: number
  enviados: number
  exitosos: number
  fallidos: number
  pendientes: number
  tasa_exito: number
}

export interface Recipient {
  dest_id: string
  email: string
  empresa_nombre?: string
  empresa_id?: number
  nombre?: string
  estado: "pendiente" | "enviado" | "exitoso" | "fallido"
  token_baja?: string
  error?: string
}

export interface RecipientResult {
  dest_id: string
  ok: boolean
  status: number
  provider_response?: any
  campana_id: string
}

export interface TemplateRenderRequest {
  campana_id: string
  unsubscribe_base: string
  allow_fallback: boolean
  dest: { dest_id: string }
  vars: {
    agenda_url?: string
    telefono?: string
    ciudad?: string
    [key: string]: any
  }
}

export interface TemplateRenderResponse {
  subject: string
  html: string
  text?: string
}

export interface EmailSendRequest {
  to: string
  to_name?: string
  subject: string
  html: string
  text?: string
  from_name: string
  from_email: string
  reply_to?: string
  campana_id?: string
  destinatario_id?: string
  token_baja?: string
  track_opens?: boolean
  track_clicks?: boolean
}

export interface ApiResponse<T = any> {
  ok: boolean
  data?: T
  error?: string
  message?: string
  campana_id?: string
  proximo_envio_at?: string
  insertados?: number
  actualizadas?: number
  audiencia_usada?: any
}

export interface Audiencia {
  politica_email_por_empresa: "uno" | "todos"
  excluir: {
    lista_supresion: boolean
    enviados_ultimos_dias?: number
  }
  limite_empresas?: number
  filtro?: {
    q?: string
    has_sitio_web?: boolean
    creadas_desde?: string
    categoria_ids?: number[]
    categoria_nombres?: string[]
  }
  muestreo?: {
    seed: number
  }
}

export type EventoTipo = "apertura" | "clic" | "rebote"

export interface Evento {
  id: number
  created_at: string
  tipo: EventoTipo
  proveedor_evento_id: string
  dest_id: number | null
  email: string | null
  estado: string | null
  actualizado_at?: string
  estado_dest: string | null
  aperturas: number
  clics: number
}

export interface LastRecipient {
  id: number
  email: string
  estado: string
  aperturas: number
  clics: number
  actualizado_at?: string | null
}

export type WorkerStage = "siguiente" | "render" | "enviar" | "ack" | "finalizar"

export interface WorkerActivity {
  id: number
  ts: string | null
  campana_id: number
  dest_id: number | null
  email?: string | null
  etapa: WorkerStage
  ok: boolean
  http_status?: number | null
  ms?: number | null
  error?: string | null
  endpoint?: string | null
}

export interface CampaignStatusData {
  ok: boolean
  campana: {
    id: number
    nombre: string
    proveedor: string
    estado: string
    created_at: string
    updated_at: string
    proximo_envio_at?: string
    // opcional: ritmo/audiencia ya parseados por el service
    ritmo?: any
    audiencia?: any
  }
  resumen: {
    en_cola: number
    procesando: number
    enviados: number
    rebotados: number
    bajas: number
    error?: number
    bloqueado?: number
  }
  metricas: {
    abiertos_unicos: number
    clic_unicos: number
    open_rate_uni_pct: number
    ctr_uni_pct: number
    bounce_rate_pct: number
  }
  progreso: {
    porcentaje: number
  }
  ultimos: LastRecipient[]
  worker: { alive: boolean; last_at?: string | null; seconds_since?: number | null } | null
  actividades: WorkerActivity[]
  llamadas: WorkerActivity[] // alias para compat
  next_cursor: number | null
}

export interface Destinatario {
  id: number
  email: string
  estado: string
  actualizado_at?: string
  intentos: number
  dest_id: number
}
