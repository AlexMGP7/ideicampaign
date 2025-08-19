export interface Empresa {
  id: number
  titulo: string
  direccion: string | null
  telefono: string | null
  sitio_web: string | null
  url_maps: string | null
  categoria: {
    id: number | null
    nombre: string | null
  }
  emails: string[]
  resumen_contacto: {
    contactada: boolean
    contactada_por_campana: boolean
    contactada_manual: boolean
    suprimidos: number
    enviados: number
    aperturas: number
    clics: number
    ultimo_evento: string | null
    ultima_interaccion: string | null
    num_campanas: number
  }
  crm: {
    estado: string | null
    notas: string | null
    actualizado_en: string | null
  }
}

export interface EmpresaListResponse {
  ok: boolean
  data: Empresa[]
  meta: {
    total: number
    page: number
    per_page: number
  }
}

export interface EmpresaUpdateRequest {
  empresa_id: number
  contactada_manual?: boolean
  estado?: "sin_contactar" | "contactada" | "interesada" | "no_interesada" | "pendiente" | "bloqueada"
  notas?: string
  telefono?: string
  sitio_web?: string
  categoria_id?: number | null
}

export interface EmpresaUpdateResponse {
  ok: boolean
  empresa_id: number
  crm: {
    contactada_manual: boolean
    estado: string
    notas: string
    actualizado_en: string
  } | null
  error?: string
}

export interface EmpresaFilters {
  page?: number
  per_page?: number
  q?: string
  categoria_id?: number
  contactada?: "si" | "no"
  order_by?: "recientes" | "antiguos" | "titulo" | "categoria"
}
