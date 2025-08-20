"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Mail,
  Rocket,
  RefreshCw,
  CheckCircle,
  Clock,
  Pause,
  Activity,
  Heart,
  AlertCircle,
  Send,
  Eye,
  Settings,
  CheckSquare,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { campaignService } from "@/services/campaignService"
import { useCampaignStatus } from "@/hooks/useCampaignStatus"
import type { Campaign } from "@/types/campaign"

interface CampaignStatusData {
  campana: {
    id: number
    nombre: string
    estado: string
    tz: string
    proximo_envio_at: string | null
    created_at: string
    started_at: string | null
    finished_at: string | null
  } | null
  resumen: {
    en_cola: number
    bloqueado: number
    procesando: number
    enviado: number
    rebote: number
    baja: number
    error: number
  }
  progreso: number
  ultimos: Array<{
    id: number
    email: string
    estado: string
    actualizado_at: string
    intentos: number
  }>
  worker: {
    alive: boolean
    last_at: string | null
    seconds_since: number
  }
  llamadas: Array<{
    id: number
    ts: string
    etapa: string
    ok: number
    http_status: number
    ms: number
    error: string | null
    dest_id: number
  }>
  next_cursor: number
}

interface CampaignStatusProps {
  campaign: Campaign
  statusData: CampaignStatusData | null
}

function CampaignStatus({ campaign, statusData }: CampaignStatusProps) {
  const getStatusIcon = (estado: Campaign["estado"]) => {
    switch (estado) {
      case "en_ejecucion":
        return <Activity className="w-5 h-5 text-green-600 animate-pulse" />
      case "pausada":
        return <Pause className="w-5 h-5 text-yellow-600" />
      case "finalizada":
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case "borrador":
        return <Clock className="w-5 h-5 text-gray-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (estado: Campaign["estado"]) => {
    switch (estado) {
      case "en_ejecucion":
        return "border-green-500 bg-green-50 dark:bg-green-950/20"
      case "pausada":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
      case "finalizada":
        return "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
      case "borrador":
        return "border-gray-500 bg-gray-50 dark:bg-gray-950/20"
      default:
        return "border-border bg-card"
    }
  }

  const getStatusDescription = (estado: Campaign["estado"]) => {
    switch (estado) {
      case "en_ejecucion":
        return "El worker del backend está procesando automáticamente los envíos según el ritmo configurado"
      case "pausada":
        return "La campaña está pausada. El worker no procesará nuevos envíos"
      case "finalizada":
        return "La campaña ha terminado. No se procesarán más envíos"
      case "borrador":
        return "La campaña está en borrador. Cambia a 'En ejecución' para iniciar el procesamiento automático"
      default:
        return "Estado desconocido"
    }
  }

  const progressPercentage = statusData?.progreso || 0

  return (
    <Card className={`border-2 ${getStatusColor(campaign.estado)}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon(campaign.estado)}
            <span className="ml-3">Estado de la Campaña</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={campaign.estado === "en_ejecucion" ? "default" : "secondary"} className="text-sm">
              {campaign.estado?.replace("_", " ").toUpperCase()}
            </Badge>
            {statusData?.worker && (
              <Badge variant={statusData.worker.alive ? "default" : "destructive"} className="text-xs">
                <Heart className={`w-3 h-3 mr-1 ${statusData.worker.alive ? "animate-pulse" : ""}`} />
                {statusData.worker.alive ? "Worker OK" : "Sin latido"}
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>{getStatusDescription(campaign.estado)}</CardDescription>
      </CardHeader>
      <CardContent>
        {statusData && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso de envío</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {statusData.resumen.en_cola +
                    statusData.resumen.procesando +
                    statusData.resumen.enviado +
                    statusData.resumen.rebote +
                    statusData.resumen.baja +
                    statusData.resumen.error}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {statusData.resumen.en_cola + statusData.resumen.procesando}
                </div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{statusData.resumen.enviado}</div>
                <div className="text-sm text-muted-foreground">Enviados</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {statusData.resumen.rebote + statusData.resumen.error}
                </div>
                <div className="text-sm text-muted-foreground">Fallidos</div>
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
              <div className="text-center p-2 bg-gray-100 rounded">
                <div className="font-bold">{statusData.resumen.en_cola}</div>
                <div className="text-muted-foreground">En cola</div>
              </div>
              <div className="text-center p-2 bg-blue-100 rounded">
                <div className="font-bold">{statusData.resumen.procesando}</div>
                <div className="text-muted-foreground">Procesando</div>
              </div>
              <div className="text-center p-2 bg-green-100 rounded">
                <div className="font-bold">{statusData.resumen.enviado}</div>
                <div className="text-muted-foreground">Enviado</div>
              </div>
              <div className="text-center p-2 bg-yellow-100 rounded">
                <div className="font-bold">{statusData.resumen.rebote}</div>
                <div className="text-muted-foreground">Rebote</div>
              </div>
              <div className="text-center p-2 bg-purple-100 rounded">
                <div className="font-bold">{statusData.resumen.baja}</div>
                <div className="text-muted-foreground">Baja</div>
              </div>
              <div className="text-center p-2 bg-red-100 rounded">
                <div className="font-bold">{statusData.resumen.error}</div>
                <div className="text-muted-foreground">Error</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EventTimeline({ llamadas }: { llamadas: CampaignStatusData["llamadas"] }) {
  const getStageIcon = (etapa: string) => {
    switch (etapa) {
      case "siguiente":
        return <Eye className="w-4 h-4 text-blue-500" />
      case "render":
        return <Settings className="w-4 h-4 text-purple-500" />
      case "enviar":
        return <Send className="w-4 h-4 text-green-500" />
      case "ack":
        return <CheckSquare className="w-4 h-4 text-orange-500" />
      case "finalizar":
        return <CheckCircle className="w-4 h-4 text-gray-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getStageDescription = (etapa: string) => {
    switch (etapa) {
      case "siguiente":
        return "Obteniendo destinatario"
      case "render":
        return "Renderizando plantilla"
      case "enviar":
        return "Enviando email"
      case "ack":
        return "Marcando resultado"
      case "finalizar":
        return "Intentando cerrar campaña"
      default:
        return etapa
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Timeline de Eventos
        </CardTitle>
        <CardDescription>Últimas actividades del worker</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {llamadas.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">No hay eventos recientes</div>
            ) : (
              llamadas.map((llamada) => (
                <div
                  key={llamada.id}
                  className={`flex items-center space-x-3 p-2 rounded-lg border ${
                    llamada.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  {getStageIcon(llamada.etapa)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{getStageDescription(llamada.etapa)}</span>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{new Date(llamada.ts).toLocaleTimeString()}</span>
                        <span>•</span>
                        <span>{llamada.ms}ms</span>
                        {llamada.http_status && (
                          <>
                            <span>•</span>
                            <span className={llamada.http_status === 200 ? "text-green-600" : "text-red-600"}>
                              {llamada.http_status}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>Destinatario ID {llamada.dest_id}</span>
                      {!llamada.ok && (
                        <>
                          <span>•</span>
                          <span className="text-red-600">Error</span>
                        </>
                      )}
                    </div>
                    {llamada.error && <div className="text-xs text-red-600 mt-1">{llamada.error}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function RecentRecipients({ ultimos }: { ultimos: CampaignStatusData["ultimos"] }) {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "enviado":
        return "text-green-600 bg-green-100"
      case "rebote":
        return "text-yellow-600 bg-yellow-100"
      case "error":
        return "text-red-600 bg-red-100"
      case "baja":
        return "text-purple-600 bg-purple-100"
      case "en_cola":
        return "text-blue-600 bg-blue-100"
      case "procesando":
        return "text-orange-600 bg-orange-100"
      case "bloqueado":
        return "text-gray-600 bg-gray-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Destinatarios Recientes
        </CardTitle>
        <CardDescription>Lista de destinatarios y su estado actual</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {ultimos.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">No hay destinatarios</div>
            ) : (
              ultimos.map((destinatario) => (
                <div key={destinatario.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{destinatario.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {destinatario.actualizado_at
                        ? new Date(destinatario.actualizado_at).toLocaleString()
                        : "En cola - sin procesar"}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`text-xs ${getEstadoColor(destinatario.estado)}`}>
                      {destinatario.estado.replace("_", " ")}
                    </Badge>
                    {destinatario.intentos > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {destinatario.intentos} intentos
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export function SendCampaign() {
  const { toast } = useToast()
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusChanging, setStatusChanging] = useState(false)

  const {
    data: statusData,
    loading: statusLoading,
    error: statusError,
    refetch,
  } = useCampaignStatus(activeCampaign?.id || null)

  useEffect(() => {
    loadActiveCampaign()
  }, [])

  const loadActiveCampaign = async () => {
    setLoading(true)
    try {
      const response = await campaignService.getActiveCampaign()
      if (response.ok && response.data) {
        setActiveCampaign(response.data)
      } else {
        setActiveCampaign(null)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar la campaña activa",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangeStatus = async (newStatus: string) => {
    if (!activeCampaign?.id || !newStatus) return

    const validStatus = newStatus as Campaign["estado"]
    setStatusChanging(true)

    try {
      const response = await campaignService.changeStatus(activeCampaign.id, validStatus)
      if (response.ok) {
        const statusMessages = {
          en_ejecucion:
            "La campaña está ahora en ejecución. El worker del backend comenzará a procesar los envíos automáticamente.",
          pausada: "La campaña ha sido pausada. El worker detendrá el procesamiento de nuevos envíos.",
          finalizada: "La campaña ha sido finalizada. No se procesarán más envíos.",
          borrador: "La campaña volvió a estado borrador.",
        }

        toast({
          title: "Estado actualizado",
          description: statusMessages[validStatus] || `La campaña ahora está ${validStatus}`,
          action:
            validStatus === "en_ejecucion" ? (
              <div className="flex items-center">
                <Rocket className="w-4 h-4 text-green-600" />
              </div>
            ) : undefined,
        })
        loadActiveCampaign()
        refetch()
      } else {
        throw new Error(response.error || "Error al cambiar estado")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cambiar estado",
      })
    } finally {
      setStatusChanging(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!activeCampaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Enviar Campaña</h2>
            <p className="text-muted-foreground">No hay campañas activas para enviar</p>
          </div>
          <Button onClick={loadActiveCampaign} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay campañas activas</h3>
              <p className="text-muted-foreground mb-4">Crea una nueva campaña para comenzar a enviar emails</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Campaña</h2>
          <p className="text-muted-foreground">Monitorea y controla el envío automático de tu campaña</p>
        </div>
        <Button
          onClick={() => {
            loadActiveCampaign()
            refetch()
          }}
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {statusData?.campana?.proximo_envio_at && activeCampaign.estado === "en_ejecucion" && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Próximo envío programado para: {new Date(statusData.campana.proximo_envio_at).toLocaleString()}
            {statusData.resumen.en_cola > 0 && (
              <span className="ml-2 font-medium">({statusData.resumen.en_cola} emails en cola esperando)</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <CampaignStatus campaign={activeCampaign} statusData={statusData} />

          {statusData?.worker && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart
                    className={`w-5 h-5 mr-2 ${statusData.worker.alive ? "text-green-500 animate-pulse" : "text-red-500"}`}
                  />
                  Estado del Worker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={statusData.worker.alive ? "default" : "destructive"}>
                        {statusData.worker.alive ? "Operativo" : "Sin latido"}
                      </Badge>
                      {statusData.worker.last_at && (
                        <span className="text-sm text-muted-foreground">
                          Último latido: {new Date(statusData.worker.last_at).toLocaleTimeString()}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">({statusData.worker.seconds_since}s ago)</span>
                    </div>
                    {!statusData.worker.alive && (
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          El worker no ha enviado latidos recientemente. Verifica que el cron esté funcionando.
                        </AlertDescription>
                      </Alert>
                    )}
                    {statusData.worker.alive &&
                      statusData.resumen.en_cola > 0 &&
                      statusData.resumen.procesando === 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Worker operativo - esperando horario programado para procesar {statusData.resumen.en_cola}{" "}
                          emails en cola
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {statusData && <EventTimeline llamadas={statusData.llamadas} />}

          {statusData && <RecentRecipients ultimos={statusData.ultimos} />}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Control de Campaña</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeCampaign.estado === "borrador" && (
                <Button onClick={() => handleChangeStatus("en_ejecucion")} disabled={statusChanging} className="w-full">
                  <Rocket className="w-4 h-4 mr-2" />
                  Iniciar Campaña
                </Button>
              )}

              {activeCampaign.estado === "en_ejecucion" && (
                <Button
                  onClick={() => handleChangeStatus("pausada")}
                  disabled={statusChanging}
                  variant="outline"
                  className="w-full"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar Campaña
                </Button>
              )}

              {activeCampaign.estado === "pausada" && (
                <>
                  <Button
                    onClick={() => handleChangeStatus("en_ejecucion")}
                    disabled={statusChanging}
                    className="w-full"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Reanudar Campaña
                  </Button>
                  <Button
                    onClick={() => handleChangeStatus("finalizada")}
                    disabled={statusChanging}
                    variant="destructive"
                    className="w-full"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finalizar Campaña
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información de Ritmo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Emails por cuota:</span>
                  <span className="font-medium">{activeCampaign.ritmo.quota.emails}</span>
                </div>
                <div className="flex justify-between">
                  <span>Horas por cuota:</span>
                  <span className="font-medium">{activeCampaign.ritmo.quota.horas}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jitter:</span>
                  <span className="font-medium">
                    {activeCampaign.ritmo.jitter_seg.min}-{activeCampaign.ritmo.jitter_seg.max}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Días activos:</span>
                  <span className="font-medium">{activeCampaign.ritmo.activo.dias.length} días</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Worker Automático</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Cron ejecutándose cada minuto</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Procesamiento automático</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Respeta ritmo configurado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Registro automático de resultados</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funcionamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• El worker se ejecuta automáticamente cada minuto</p>
                <p>• Procesa campañas en estado "en_ejecucion"</p>
                <p>• Respeta los horarios y ritmo configurados</p>
                <p>• Registra automáticamente los resultados</p>
                <p>• No requiere intervención manual</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
