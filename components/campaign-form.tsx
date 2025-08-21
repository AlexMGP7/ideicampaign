"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Send, Save, Users, Mail, Info, CheckCircle, Clock, Loader2 } from "lucide-react"
import type { Campaign } from "@/types/campaign"
import { useToast } from "@/hooks/use-toast"
import { campaignService } from "@/services/campaignService"

export function CampaignForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<Omit<Campaign, "id" | "created_at" | "updated_at">>({
    nombre: "",
    remitente_nombre: "Luis García",
    remitente_email: "info@ideidev.com",
    proveedor: "zeptomail",
    tz: "Europe/Amsterdam",
    ritmo: {
      quota: { emails: 12, horas: 6 },
      activo: {
        dias: [1, 2, 3, 4, 5], // Lunes a Viernes por defecto
        franjas: [
          ["08:30", "21:00"],
        ],
      },
      jitter_seg: { min: 30, max: 240 },
    },
    audiencia: {
      politica_email_por_empresa: "uno",
      excluir: {
        lista_supresion: true,
      },
      limite_empresas: 1000,
      muestreo: {
        seed: Math.floor(Math.random() * 1000),
      },
    },
  })

  const handleSubmit = async (action: "save" | "send") => {
    // Basic validation
    if (!formData.nombre.trim()) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "El nombre de la campaña es requerido",
      })
      return
    }

    if (!formData.remitente_nombre.trim() || !formData.remitente_email.trim()) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Los datos del remitente son requeridos",
      })
      return
    }

    setIsLoading(true)

    try {
      if (action === "save") {
        // Crear como borrador
        const response = await campaignService.createCampaign({
          ...formData,
          estado: "borrador",
        })

        if (response.ok) {
          toast({
            title: "Borrador guardado",
            description: `La campaña "${formData.nombre}" se guardó como borrador exitosamente`,
            action: (
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            ),
          })
        } else {
          throw new Error(response.error || "Error al guardar borrador")
        }
      } else {
        const response = await campaignService.createAndStartCampaign({
          ...formData,
          estado: "borrador",
        })

        if (response.ok) {
          toast({
            title: "Campaña creada exitosamente",
            description: `La campaña "${formData.nombre}" se creó con ${response.data?.insertados || 0} destinatarios`,
            action: (
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            ),
          })
        } else {
          throw new Error(response.error || "Error al crear y ejecutar campaña")
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRitmoChange = (section: keyof Campaign["ritmo"], field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      ritmo: {
        ...prev.ritmo,
        [section]: {
          ...prev.ritmo[section],
          [field]: value,
        },
      },
    }))
  }

  const handleAudienciaChange = (field: keyof Campaign["audiencia"], value: any) => {
    setFormData((prev) => ({
      ...prev,
      audiencia: {
        ...prev.audiencia,
        [field]: value,
      },
    }))
  }

  const handleDiasChange = (dia: number, checked: boolean) => {
    const newDias = checked
      ? [...formData.ritmo.activo.dias, dia].sort()
      : formData.ritmo.activo.dias.filter((d) => d !== dia)

    handleRitmoChange("activo", "dias", newDias)
  }

  const diasSemana = [
    { value: 1, label: "Lun" },
    { value: 2, label: "Mar" },
    { value: 3, label: "Mié" },
    { value: 4, label: "Jue" },
    { value: 5, label: "Vie" },
    { value: 6, label: "Sáb" },
    { value: 7, label: "Dom" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Nueva Campaña</h2>
          <p className="text-muted-foreground">
            Configura tu campaña - el contenido será generado automáticamente por IA
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleSubmit("save")} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Borrador
          </Button>
          <Button onClick={() => handleSubmit("send")} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            {isLoading ? "Procesando..." : "Crear y Ejecutar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Información Básica
              </CardTitle>
              <CardDescription>Configura los detalles principales de tu campaña</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre de la Campaña</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Prospección 2025-08-12"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="remitente_nombre">Nombre del Remitente</Label>
                  <Input
                    id="remitente_nombre"
                    placeholder="Luis García"
                    value={formData.remitente_nombre}
                    onChange={(e) => handleInputChange("remitente_nombre", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="remitente_email">Email del Remitente</Label>
                  <Input
                    id="remitente_email"
                    type="email"
                    placeholder="info@ideidev.com"
                    value={formData.remitente_email}
                    onChange={(e) => handleInputChange("remitente_email", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="proveedor">Proveedor de Email</Label>
                  <Select value={formData.proveedor} onValueChange={(value) => handleInputChange("proveedor", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zeptomail">Zeptomail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tz">Zona Horaria</Label>
                  <Select value={formData.tz} onValueChange={(value) => handleInputChange("tz", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Amsterdam">Europe/Amsterdam</SelectItem>
                      <SelectItem value="Europe/Madrid">Europe/Madrid</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Configuración de Ritmo
              </CardTitle>
              <CardDescription>
                Controla cuándo y cómo se envían los emails para evitar ser marcado como spam
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quota_emails">Emails por Cuota</Label>
                  <Input
                    id="quota_emails"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.ritmo.quota.emails}
                    onChange={(e) => handleRitmoChange("quota", "emails", Number.parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="quota_horas">Horas por Cuota</Label>
                  <Input
                    id="quota_horas"
                    type="number"
                    min="1"
                    max="24"
                    value={formData.ritmo.quota.horas}
                    onChange={(e) => handleRitmoChange("quota", "horas", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label>Días Activos</Label>
                <div className="flex space-x-2 mt-2">
                  {diasSemana.map((dia) => (
                    <div key={dia.value} className="flex items-center space-x-1">
                      <Checkbox
                        id={`dia-${dia.value}`}
                        checked={formData.ritmo.activo.dias.includes(dia.value)}
                        onCheckedChange={(checked) => handleDiasChange(dia.value, checked as boolean)}
                      />
                      <Label htmlFor={`dia-${dia.value}`} className="text-sm">
                        {dia.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jitter_min">Jitter Mínimo (seg)</Label>
                  <Input
                    id="jitter_min"
                    type="number"
                    min="0"
                    value={formData.ritmo.jitter_seg.min}
                    onChange={(e) => handleRitmoChange("jitter_seg", "min", Number.parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="jitter_max">Jitter Máximo (seg)</Label>
                  <Input
                    id="jitter_max"
                    type="number"
                    min="0"
                    value={formData.ritmo.jitter_seg.max}
                    onChange={(e) => handleRitmoChange("jitter_seg", "max", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Configuración de Ritmo</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Se enviarán {formData.ritmo.quota.emails} emails cada {formData.ritmo.quota.horas} horas, con una
                      pausa aleatoria de {formData.ritmo.jitter_seg.min}-{formData.ritmo.jitter_seg.max} segundos entre
                      envíos.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Configuración de Audiencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="politica_email">Política de Email por Empresa</Label>
                  <Select
                    value={formData.audiencia.politica_email_por_empresa}
                    onValueChange={(value: "uno" | "todos") =>
                      handleAudienciaChange("politica_email_por_empresa", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uno">Un email por empresa</SelectItem>
                      <SelectItem value="todos">Todos los emails</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="limite_empresas">Límite de Empresas</Label>
                  <Input
                    id="limite_empresas"
                    type="number"
                    min="1"
                    value={formData.audiencia.limite_empresas || ""}
                    onChange={(e) => handleAudienciaChange("limite_empresas", Number.parseInt(e.target.value) || null)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="lista_supresion"
                    checked={formData.audiencia.excluir.lista_supresion}
                    onCheckedChange={(checked) =>
                      handleAudienciaChange("excluir", {
                        ...formData.audiencia.excluir,
                        lista_supresion: checked,
                      })
                    }
                  />
                  <Label htmlFor="lista_supresion">Excluir lista de supresión</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Vista Previa de Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Empresas objetivo:</span>
                <span className="font-medium">
                  {formData.audiencia.limite_empresas?.toLocaleString() || "Sin límite"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ritmo:</span>
                <span className="font-medium">
                  {formData.ritmo.quota.emails}/{formData.ritmo.quota.horas}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Días activos:</span>
                <span className="font-medium">{formData.ritmo.activo.dias.length} días</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zona horaria:</span>
                <span className="font-medium">{formData.tz}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}