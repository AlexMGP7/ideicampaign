import { apiService } from "./api"
import type { EmpresaListResponse, EmpresaUpdateRequest, EmpresaUpdateResponse, EmpresaFilters } from "@/types/empresa"

class EmpresaService {
  async listarEmpresas(filters: EmpresaFilters = {}): Promise<EmpresaListResponse> {
    const params = new URLSearchParams()

    if (filters.page) params.append("page", filters.page.toString())
    if (filters.per_page) params.append("per_page", filters.per_page.toString())
    if (filters.q) params.append("q", filters.q)
    if (filters.categoria_id) params.append("categoria_id", filters.categoria_id.toString())
    if (filters.contactada) params.append("contactada", filters.contactada)
    if (filters.order_by) params.append("order_by", filters.order_by)

    const queryString = params.toString()
    const url = `/campana/empresas.listar.php${queryString ? `?${queryString}` : ""}`

    return apiService.get<EmpresaListResponse>(url)
  }

  async actualizarEstado(data: EmpresaUpdateRequest): Promise<EmpresaUpdateResponse> {
    return apiService.post<EmpresaUpdateResponse>("/campana/empresas.actualizar_estado.php", data)
  }
}

export const empresaService = new EmpresaService()
