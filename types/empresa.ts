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
    enviados: number
    abiertos: number
    clics: number
    ultimo_envio_at: string | null
  }
  crm: {
    estado: "nuevo" | "en_proceso" | "interesado" | "no_interesado" | "contactado" | "cliente" | "descartado"
    notas: string
    actualizado_en: string
  } | null
  error?: string
}

export interface EmpresaListResponse {
  ok: boolean
  data: Empresa[]
  meta: {
    total: number
    page: number
    per_page: number
  }
  message?: string
  error?: string
}

export interface EmpresaUpdateRequest {
  empresa_id: number
  estado?: string
  notas?: string
  telefono?: string
  sitio_web?: string
  contactada_manual?: boolean
}

export interface EmpresaUpdateResponse {
  ok: boolean
  message?: string
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