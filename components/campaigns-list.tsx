"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Mail,
  Activity,
  Pause,
  CheckCircle,
  Clock,
  Filter,
  Play,
  Square,
  RotateCcw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCampaigns } from "@/hooks/useCampaigns"
import type { Campaign } from "@/types/campaign"

interface CampaignListItem extends Campaign {
  id: number
  estado: "borrador" | "en_ejecucion" | "pausada" | "finalizada"
  proveedor: "ses" | "sendgrid" | "postmark" | "smtp" | "zeptomail"
  created_at: string
  updated_at: string
  totales: {
    total: number
    en_cola: number
    procesando: number
    enviado: number
    rebotado: number
    baja: number
    bloqueado: number
    error: number
  }
  progreso: number
}

interface CampaignDetail {
  id: number
  nombre: string
  remitente_nombre: string
  remitente_email: string
  estado: string
  proveedor: string
  proximo_envio_at: string | null
  tz: string
  created_at: string
  updated_at: string
  ritmo: any
  audiencia: any
}

export function CampaignsList() {
  const { toast } = useToast()
  const { campaigns: hookCampaigns, loading: hookLoading, error: hookError, changeStatus } = useCampaigns()

  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDetail | null>(null)
  const [editingCampaign, setEditingCampaign] = useState<CampaignDetail | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [changingStatus, setChangingStatus] = useState<number | null>(null)
  const [filters, setFilters] = useState({
    q: "",
    estado: [] as string[],
    proveedor: [] as string[],
    fecha_desde: "",
    fecha_hasta: "",
    order_by: "updated_at",
    order_dir: "desc",
  })

  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
  })

  useEffect(() => {
    loadCampaigns()
  }, [filters, pagination])

  const loadCampaigns = async () => {
    setLoading(true)
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const apiKey = process.env.NEXT_PUBLIC_API_KEY

      if (!apiBaseUrl || !apiKey) {
        throw new Error("Configuración de API faltante")
      }

      const requestBody = {
        ...filters,
        estado: filters.estado.length > 0 ? filters.estado : undefined,
        proveedor: filters.proveedor.length > 0 ? filters.proveedor : undefined,
        fecha_desde: filters.fecha_desde || undefined,
        fecha_hasta: filters.fecha_hasta || undefined,
        q: filters.q || undefined,
        ...pagination,
      }

      const response = await fetch(`${apiBaseUrl}/campana/campanas.listar.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (data.ok) {
        setCampaigns(data.items || [])
        setTotal(data.total || 0)
      } else {
        throw new Error(data.error || "Error al cargar campañas")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar campañas",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCampaignDetail = async (campaignId: number) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const apiKey = process.env.NEXT_PUBLIC_API_KEY

      if (!apiBaseUrl || !apiKey) {
        throw new Error("Configuración de API faltante")
      }

      const response = await fetch(`${apiBaseUrl}/campana/campanas.ver.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify({
          campana_id: campaignId,
          incluir_json: true,
        }),
      })

      const data = await response.json()

      if (data.ok) {
        setSelectedCampaign(data.campana)
      } else {
        throw new Error(data.error || "Error al cargar detalles")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar detalles",
      })
    }
  }

  const updateCampaign = async (campaignId: number, updates: Partial<CampaignDetail>) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const apiKey = process.env.NEXT_PUBLIC_API_KEY

      if (!apiBaseUrl || !apiKey) {
        throw new Error("Configuración de API faltante")
      }

      const response = await fetch(`${apiBaseUrl}/campana/campanas.actualizar.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify({
          campana_id: campaignId,
          ...updates,
        }),
      })

      const data = await response.json()

      if (data.ok) {
        toast({
          title: "Campaña actualizada",
          description: "Los cambios se guardaron exitosamente",
        })
        loadCampaigns()
        setEditingCampaign(null)
      } else {
        throw new Error(data.error || "Error al actualizar")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar campaña",
      })
    }
  }

  const deleteCampaign = async (campaignId: number, force = false) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const apiKey = process.env.NEXT_PUBLIC_API_KEY

      if (!apiBaseUrl || !apiKey) {
        throw new Error("Configuración de API faltante")
      }

      const response = await fetch(`${apiBaseUrl}/campana/campanas.eliminar.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify({
          campana_id: campaignId,
          force,
        }),
      })

      const data = await response.json()

      if (data.ok) {
        toast({
          title: "Campaña eliminada",
          description: "La campaña se eliminó exitosamente",
        })
        loadCampaigns()
      } else if (response.status === 409) {
        const shouldForce = confirm("La campaña está en ejecución. ¿Deseas eliminarla de todas formas?")
        if (shouldForce) {
          await deleteCampaign(campaignId, true)
        }
      } else {
        throw new Error(data.error || "Error al eliminar")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar campaña",
      })
    }
  }

  const changeCampaignStatus = async (campaignId: number, newStatus: string) => {
    setChangingStatus(campaignId)
    try {
      if (!campaignId) {
        throw new Error("ID de campaña requerido")
      }

      const success = await changeStatus(
        campaignId.toString(),
        newStatus as "borrador" | "en_ejecucion" | "pausada" | "finalizada",
      )
      if (success) {
        toast({
          title: "Estado actualizado",
          description: `La campaña ahora está ${newStatus.replace("_", " ")}`,
        })
        loadCampaigns()
      }
    } catch (error) {
      console.error("Error changing campaign status:", error)
    } finally {
      setChangingStatus(null)
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "en_ejecucion":
        return <Activity className="w-4 h-4 text-green-600" />
      case "pausada":
        return <Pause className="w-4 h-4 text-yellow-600" />
      case "finalizada":
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      case "borrador":
        return <Clock className="w-4 h-4 text-gray-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "en_ejecucion":
        return "bg-green-100 text-green-800"
      case "pausada":
        return "bg-yellow-100 text-yellow-800"
      case "finalizada":
        return "bg-blue-100 text-blue-800"
      case "borrador":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusActionButtons = (campaign: Campaign) => {
    const isChanging = changingStatus === campaign.id

    if (!campaign.estado || !campaign.id) return null

    switch (campaign.estado) {
      case "borrador":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeCampaignStatus(campaign.id!, "en_ejecucion")}
            disabled={isChanging}
            className="text-green-600 hover:text-green-700"
          >
            {isChanging ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
        )

      case "en_ejecucion":
        return (
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeCampaignStatus(campaign.id!, "pausada")}
              disabled={isChanging}
              className="text-yellow-600 hover:text-yellow-700"
            >
              {isChanging ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeCampaignStatus(campaign.id!, "finalizada")}
              disabled={isChanging}
              className="text-red-600 hover:text-red-700"
            >
              {isChanging ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Square className="w-4 h-4" />
              )}
            </Button>
          </div>
        )

      case "pausada":
        return (
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeCampaignStatus(campaign.id!, "en_ejecucion")}
              disabled={isChanging}
              className="text-green-600 hover:text-green-700"
            >
              {isChanging ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeCampaignStatus(campaign.id!, "finalizada")}
              disabled={isChanging}
              className="text-red-600 hover:text-red-700"
            >
              {isChanging ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Square className="w-4 h-4" />
              )}
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Campañas</h2>
          <p className="text-muted-foreground">Administra todas tus campañas de email marketing</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" onClick={loadCampaigns}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Campaña
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filtros de Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Nombre o email..."
                  value={filters.q}
                  onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={filters.estado[0] || "all"}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      estado: value === "all" ? [] : [value],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="borrador">Borrador</SelectItem>
                    <SelectItem value="en_ejecucion">En Ejecución</SelectItem>
                    <SelectItem value="pausada">Pausada</SelectItem>
                    <SelectItem value="finalizada">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="proveedor">Proveedor</Label>
                <Select
                  value={filters.proveedor[0] || "all"}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      proveedor: value === "all" ? [] : [value],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="zeptomail">Zeptomail</SelectItem>
                    <SelectItem value="ses">Amazon SES</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="postmark">Postmark</SelectItem>
                    <SelectItem value="smtp">SMTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fecha_desde">Desde</Label>
                <Input
                  id="fecha_desde"
                  type="date"
                  value={filters.fecha_desde}
                  onChange={(e) => setFilters((prev) => ({ ...prev, fecha_desde: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="fecha_hasta">Hasta</Label>
                <Input
                  id="fecha_hasta"
                  type="date"
                  value={filters.fecha_hasta}
                  onChange={(e) => setFilters((prev) => ({ ...prev, fecha_hasta: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Campañas ({total})</span>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Ordenar por:</span>
              <Select
                value={filters.order_by}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, order_by: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated_at">Actualización</SelectItem>
                  <SelectItem value="created_at">Creación</SelectItem>
                  <SelectItem value="nombre">Nombre</SelectItem>
                  <SelectItem value="proximo_envio_at">Próximo Envío</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay campañas</h3>
              <p className="text-muted-foreground">Crea tu primera campaña para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(campaign.estado || "borrador")}
                        <h3 className="font-semibold">{campaign.nombre || "Sin nombre"}</h3>
                        <Badge className={getStatusColor(campaign.estado || "borrador")}>
                          {(campaign.estado || "borrador").replace("_", " ")}
                        </Badge>
                        <Badge variant="outline">{campaign.proveedor || "Sin proveedor"}</Badge>
                      </div>

                      {campaign.totales && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-medium ml-1">{campaign.totales.total.toLocaleString()}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Enviados:</span>
                            <span className="font-medium ml-1 text-green-600">
                              {campaign.totales.enviado.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">En Cola:</span>
                            <span className="font-medium ml-1 text-blue-600">
                              {campaign.totales.en_cola.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Errores:</span>
                            <span className="font-medium ml-1 text-red-600">
                              {(campaign.totales.rebotado + campaign.totales.error).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {typeof campaign.progreso === "number" && (
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progreso</span>
                              <span>{Math.round(campaign.progreso)}%</span>
                            </div>
                            <Progress value={campaign.progreso} className="h-2" />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {campaign.created_at && (
                          <span>Creada: {new Date(campaign.created_at).toLocaleDateString()}</span>
                        )}
                        {campaign.updated_at && (
                          <span>Actualizada: {new Date(campaign.updated_at).toLocaleDateString()}</span>
                        )}
                        {campaign.proximo_envio_at && (
                          <span>Próximo envío: {new Date(campaign.proximo_envio_at).toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusActionButtons(campaign)}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => campaign.id && loadCampaignDetail(campaign.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalles de Campaña</DialogTitle>
                            <DialogDescription>Información completa de la campaña</DialogDescription>
                          </DialogHeader>
                          {selectedCampaign && (
                            <ScrollArea className="max-h-96">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Nombre</Label>
                                    <p className="font-medium">{selectedCampaign.nombre}</p>
                                  </div>
                                  <div>
                                    <Label>Estado</Label>
                                    <Badge className={getStatusColor(selectedCampaign.estado)}>
                                      {selectedCampaign.estado}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label>Remitente</Label>
                                    <p className="font-medium">{selectedCampaign.remitente_nombre}</p>
                                    <p className="text-sm text-muted-foreground">{selectedCampaign.remitente_email}</p>
                                  </div>
                                  <div>
                                    <Label>Proveedor</Label>
                                    <p className="font-medium">{selectedCampaign.proveedor}</p>
                                  </div>
                                </div>
                                {selectedCampaign.ritmo && (
                                  <div>
                                    <Label>Configuración de Ritmo</Label>
                                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                                      {JSON.stringify(selectedCampaign.ritmo, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (campaign.id) {
                                loadCampaignDetail(campaign.id)
                                setEditingCampaign(selectedCampaign)
                              }
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Campaña</DialogTitle>
                            <DialogDescription>Modifica los detalles de la campaña</DialogDescription>
                          </DialogHeader>
                          {editingCampaign && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-nombre">Nombre</Label>
                                <Input
                                  id="edit-nombre"
                                  value={editingCampaign.nombre}
                                  onChange={(e) =>
                                    setEditingCampaign((prev) => (prev ? { ...prev, nombre: e.target.value } : null))
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-remitente-nombre">Nombre del Remitente</Label>
                                <Input
                                  id="edit-remitente-nombre"
                                  value={editingCampaign.remitente_nombre}
                                  onChange={(e) =>
                                    setEditingCampaign((prev) =>
                                      prev ? { ...prev, remitente_nombre: e.target.value } : null,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-remitente-email">Email del Remitente</Label>
                                <Input
                                  id="edit-remitente-email"
                                  type="email"
                                  value={editingCampaign.remitente_email}
                                  onChange={(e) =>
                                    setEditingCampaign((prev) =>
                                      prev ? { ...prev, remitente_email: e.target.value } : null,
                                    )
                                  }
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setEditingCampaign(null)}>
                                  Cancelar
                                </Button>
                                <Button onClick={() => updateCampaign(editingCampaign.id, editingCampaign)}>
                                  Guardar Cambios
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar campaña?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente la campaña "
                              {campaign.nombre}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => campaign.id && deleteCampaign(campaign.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {pagination.offset + 1} a {Math.min(pagination.offset + pagination.limit, total)} de {total}{" "}
            campañas
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.offset === 0}
              onClick={() => setPagination((prev) => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.offset + pagination.limit >= total}
              onClick={() => setPagination((prev) => ({ ...prev, offset: prev.offset + prev.limit }))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
