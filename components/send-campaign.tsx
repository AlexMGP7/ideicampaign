"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Send,
  Mail,
  AlertTriangle,
  Rocket,
  RefreshCw,
  Play,
  CheckCircle,
  Clock,
  ArrowRight,
  Users,
  FileText,
  Zap,
  Target,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { campaignService } from "@/services/campaignService"
import { emailService } from "@/services/emailService"
import type { Campaign, Recipient } from "@/types/campaign"

interface WorkflowStep {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: "pending" | "running" | "completed" | "error"
  progress?: number
  result?: any
  error?: string
}

interface WorkflowFlowProps {
  steps: WorkflowStep[]
  isRunning: boolean
}

function WorkflowFlow({ steps, isRunning }: WorkflowFlowProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Flujo de Envío de Campaña</h3>
        <div className="flex items-center space-x-2">
          {isRunning ? (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Procesando...
            </div>
          ) : (
            <div className="flex items-center text-muted-foreground">
              <Clock className="w-4 h-4 mr-2" />
              Listo para ejecutar
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        {/* Workflow Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && <div className="absolute left-6 top-16 w-0.5 h-8 bg-border"></div>}

              {/* Step Card */}
              <div
                className={`flex items-start space-x-4 p-4 rounded-lg border transition-all duration-300 ${
                  step.status === "running"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    : step.status === "completed"
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : step.status === "error"
                        ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                        : "border-border bg-card"
                }`}
              >
                {/* Step Icon */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step.status === "running"
                      ? "bg-blue-500 text-white animate-pulse"
                      : step.status === "completed"
                        ? "bg-green-500 text-white"
                        : step.status === "error"
                          ? "bg-red-500 text-white"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.status === "completed" ? <CheckCircle className="w-6 h-6" /> : step.icon}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{step.name}</h4>
                    <div className="flex items-center space-x-2">
                      {step.status === "running" && step.progress !== undefined && (
                        <div className="w-24">
                          <Progress value={step.progress} className="h-2" />
                        </div>
                      )}
                      <Badge
                        variant={
                          step.status === "completed"
                            ? "default"
                            : step.status === "running"
                              ? "secondary"
                              : step.status === "error"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {step.status === "pending"
                          ? "Pendiente"
                          : step.status === "running"
                            ? "Ejecutando"
                            : step.status === "completed"
                              ? "Completado"
                              : "Error"}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">{step.description}</p>

                  {/* Step Results */}
                  {step.result && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-md">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Resultado:</div>
                      <div className="text-sm">
                        {typeof step.result === "object" ? (
                          <div className="space-y-1">
                            {Object.entries(step.result).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key.replace("_", " ")}:</span>
                                <span className="font-medium">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>{String(step.result)}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {step.error && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                      <div className="text-xs font-medium text-red-600 mb-1">Error:</div>
                      <div className="text-sm text-red-700 dark:text-red-400">{step.error}</div>
                    </div>
                  )}
                </div>

                {/* Arrow to next step */}
                {index < steps.length - 1 && (
                  <div className="flex-shrink-0 text-muted-foreground">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SendCampaign() {
  const { toast } = useToast()
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [campaignStats, setCampaignStats] = useState<any>(null)

  const [workflowRunning, setWorkflowRunning] = useState(false)
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      id: "get-recipient",
      name: "Obtener Destinatario",
      description: "Buscar el siguiente destinatario pendiente de la campaña",
      icon: <Users className="w-6 h-6" />,
      status: "pending",
    },
    {
      id: "render-template",
      name: "Renderizar Plantilla",
      description: "Generar el contenido personalizado del email",
      icon: <FileText className="w-6 h-6" />,
      status: "pending",
    },
    {
      id: "send-email",
      name: "Enviar Email",
      description: "Enviar el email a través del proveedor configurado",
      icon: <Zap className="w-6 h-6" />,
      status: "pending",
    },
    {
      id: "mark-result",
      name: "Marcar Resultado",
      description: "Registrar el resultado del envío en la base de datos",
      icon: <Target className="w-6 h-6" />,
      status: "pending",
    },
  ])

  useEffect(() => {
    loadActiveCampaign()
  }, [])

  const loadActiveCampaign = async () => {
    setLoading(true)
    try {
      const response = await campaignService.getActiveCampaign()
      if (response.ok && response.data) {
        setActiveCampaign(response.data)
        // Load campaign stats
        loadCampaignStats(response.data.id!)
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

  const loadCampaignStats = async (campaignId: string) => {
    try {
      const response = await campaignService.getStatusSummary(campaignId)
      if (response.ok) {
        setCampaignStats(response.data)
      }
    } catch (error) {
      console.error("Error loading campaign stats:", error)
    }
  }

  const handleSendNext = async () => {
    if (!activeCampaign?.id) return

    setWorkflowRunning(true)

    // Reset workflow steps
    setWorkflowSteps((prev) =>
      prev.map((step) => ({
        ...step,
        status: "pending" as const,
        result: undefined,
        error: undefined,
        progress: undefined,
      })),
    )

    try {
      // Step 1: Get next recipient
      setWorkflowSteps((prev) =>
        prev.map((step) =>
          step.id === "get-recipient" ? { ...step, status: "running" as const, progress: 50 } : step,
        ),
      )

      const recipientResponse = await campaignService.getNextRecipient(activeCampaign.id)

      if (!recipientResponse.ok || !recipientResponse.data) {
        setWorkflowSteps((prev) =>
          prev.map((step) =>
            step.id === "get-recipient"
              ? { ...step, status: "error" as const, error: "No hay más destinatarios pendientes" }
              : step,
          ),
        )
        toast({
          title: "No hay más destinatarios",
          description: "La campaña no tiene más emails pendientes por enviar",
        })
        return
      }

      const recipient = recipientResponse.data as Recipient
      setWorkflowSteps((prev) =>
        prev.map((step) =>
          step.id === "get-recipient"
            ? {
                ...step,
                status: "completed" as const,
                result: {
                  email: recipient.email,
                  empresa: recipient.empresa_nombre,
                  dest_id: recipient.dest_id,
                },
              }
            : step,
        ),
      )

      // Step 2: Render email template
      setWorkflowSteps((prev) =>
        prev.map((step) =>
          step.id === "render-template" ? { ...step, status: "running" as const, progress: 30 } : step,
        ),
      )

      const templateResponse = await emailService.renderTemplate({
        campana_id: activeCampaign.id,
        unsubscribe_base: window.location.origin + "/unsubscribe",
        allow_fallback: true,
        dest: { dest_id: recipient.dest_id },
        vars: {
          agenda_url: "https://cal.example.com/agenda",
          telefono: "+34 600 000 000",
          ciudad: "",
        },
      })

      if (!templateResponse.ok || !templateResponse.data) {
        setWorkflowSteps((prev) =>
          prev.map((step) =>
            step.id === "render-template"
              ? { ...step, status: "error" as const, error: "No se pudo generar el contenido del email" }
              : step,
          ),
        )
        throw new Error("No se pudo generar el contenido del email")
      }

      const templateData = templateResponse.data
      if (!templateData) {
        throw new Error("Respuesta de plantilla vacía")
      }

      setWorkflowSteps((prev) =>
        prev.map((step) =>
          step.id === "render-template"
            ? {
                ...step,
                status: "completed" as const,
                result: {
                  subject: templateData.subject || "Sin asunto",
                  html_length: templateData.html?.length || 0,
                  text_length: templateData.text?.length || 0,
                },
              }
            : step,
        ),
      )

      // Step 3: Send email
      setWorkflowSteps((prev) =>
        prev.map((step) => (step.id === "send-email" ? { ...step, status: "running" as const, progress: 70 } : step)),
      )

      const sendResponse = await emailService.sendEmail({
        to: recipient.email,
        to_name: recipient.empresa_nombre,
        subject: templateData.subject,
        html: templateData.html,
        text: templateData.text || "",
        from_name: activeCampaign.remitente_nombre,
        from_email: activeCampaign.remitente_email,
        reply_to: activeCampaign.remitente_email,
        campana_id: activeCampaign.id,
        destinatario_id: recipient.dest_id,
        token_baja: recipient.token_baja,
        track_opens: true,
        track_clicks: true,
      })

      setWorkflowSteps((prev) =>
        prev.map((step) =>
          step.id === "send-email"
            ? {
                ...step,
                status: sendResponse.ok ? ("completed" as const) : ("error" as const),
                result: sendResponse.ok
                  ? {
                      status: "Enviado exitosamente",
                      provider: activeCampaign.proveedor,
                    }
                  : undefined,
                error: sendResponse.ok ? undefined : sendResponse.error || "Error al enviar email",
              }
            : step,
        ),
      )

      // Step 4: Mark result
      setWorkflowSteps((prev) =>
        prev.map((step) => (step.id === "mark-result" ? { ...step, status: "running" as const, progress: 90 } : step)),
      )

      await campaignService.markRecipientResult([
        {
          dest_id: recipient.dest_id,
          ok: sendResponse.ok,
          status: sendResponse.ok ? 200 : 400,
          provider_response: sendResponse,
          campana_id: activeCampaign.id,
        },
      ])

      setWorkflowSteps((prev) =>
        prev.map((step) =>
          step.id === "mark-result"
            ? {
                ...step,
                status: "completed" as const,
                result: {
                  marked: "Resultado registrado",
                  status_code: sendResponse.ok ? 200 : 400,
                },
              }
            : step,
        ),
      )

      if (sendResponse.ok) {
        toast({
          title: "Email enviado exitosamente",
          description: `Email enviado a ${recipient.empresa_nombre}`,
          action: (
            <div className="flex items-center">
              <Rocket className="w-4 h-4 text-green-600" />
            </div>
          ),
        })
        // Reload stats
        loadCampaignStats(activeCampaign.id)
      } else {
        throw new Error(sendResponse.error || "Error al enviar email")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error en el flujo de envío",
        description: error instanceof Error ? error.message : "Error desconocido",
      })
    } finally {
      setWorkflowRunning(false)
    }
  }

  const handleChangeStatus = async (newStatus: string) => {
    if (!activeCampaign?.id || !newStatus) return

    // Type assertion to ensure newStatus is valid Campaign estado
    const validStatus = newStatus as Campaign["estado"]

    try {
      const response = await campaignService.changeStatus(activeCampaign.id, validStatus)
      if (response.ok) {
        toast({
          title: "Estado actualizado",
          description: `La campaña ahora está ${validStatus}`,
        })
        loadActiveCampaign() // Reload campaign
      } else {
        throw new Error(response.error || "Error al cambiar estado")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cambiar estado",
      })
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
          <h2 className="text-2xl font-bold">Enviar Campaña</h2>
          <p className="text-muted-foreground">Gestiona el envío de tu campaña activa</p>
        </div>
        <Button onClick={loadActiveCampaign} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Flujo de Envío Visual
              </CardTitle>
              <CardDescription>Visualización en tiempo real del proceso de envío de emails</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowFlow steps={workflowSteps} isRunning={workflowRunning} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Campaña Activa: {activeCampaign.nombre}
              </CardTitle>
              <CardDescription>
                Estado: <Badge variant="outline">{activeCampaign.estado}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Remitente:</span>
                      <p className="text-muted-foreground">{activeCampaign.remitente_nombre}</p>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-muted-foreground">{activeCampaign.remitente_email}</p>
                    </div>
                    <div>
                      <span className="font-medium">Proveedor:</span>
                      <p className="text-muted-foreground">{activeCampaign.proveedor}</p>
                    </div>
                    <div>
                      <span className="font-medium">Zona horaria:</span>
                      <p className="text-muted-foreground">{activeCampaign.tz}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <span className="font-medium">Configuración de ritmo:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activeCampaign.ritmo.quota.emails} emails cada {activeCampaign.ritmo.quota.horas} horas
                    </p>
                  </div>
                </div>
              </div>

              {campaignStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{campaignStats.total_destinatarios || 0}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{campaignStats.pendientes || 0}</div>
                    <div className="text-sm text-muted-foreground">Pendientes</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{campaignStats.exitosos || 0}</div>
                    <div className="text-sm text-muted-foreground">Enviados</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{campaignStats.fallidos || 0}</div>
                    <div className="text-sm text-muted-foreground">Fallidos</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="w-5 h-5 mr-2" />
                Control de Envío
              </CardTitle>
              <CardDescription>Ejecuta el flujo completo de envío de email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  onClick={handleSendNext}
                  disabled={workflowRunning || activeCampaign.estado !== "en_ejecucion"}
                  className="flex-1"
                  size="lg"
                >
                  {workflowRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Ejecutando Flujo...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Ejecutar Flujo de Envío
                    </>
                  )}
                </Button>

                <Select onValueChange={handleChangeStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Cambiar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_ejecucion">En ejecución</SelectItem>
                    <SelectItem value="pausada">Pausar</SelectItem>
                    <SelectItem value="finalizada">Finalizar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {activeCampaign.estado !== "en_ejecucion" && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    La campaña está <strong>{activeCampaign.estado}</strong>. Cambia el estado a "En ejecución" para
                    poder enviar emails.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
              <CardTitle>Flujo de Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-mono text-xs">destinatarios.siguiente.php</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-mono text-xs">plantillas.render.php</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="font-mono text-xs">email.enviar.php</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="font-mono text-xs">destinatarios.marcar_resultado.php</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consejos de Envío</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Respeta los límites de ritmo configurados</p>
                <p>• Monitorea las métricas de entrega</p>
                <p>• Pausa la campaña si hay muchos rebotes</p>
                <p>• Revisa los horarios activos configurados</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
