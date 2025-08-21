"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Send, Save, Users, Mail, Info, Clock, Loader2, User, Globe } from "lucide-react"
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
        franjas: [["08:30", "21:00"]],
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
            variant: "success",
            title: "Borrador guardado",
            description: `La campaña "${formData.nombre}" se guardó como borrador exitosamente`,
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
            variant: "success",
            title: "Campaña creada exitosamente",
            description: `La campaña "${formData.nombre}" se creó con ${response.data?.insertados || 0} destinatarios`,
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Nueva Campaña
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-base">
            Configura tu campaña - el contenido será generado automáticamente por IA
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={() => handleSubmit("save")} disabled={isLoading} className="icon-button">
            <Save className="w-4 h-4" />
            Guardar Borrador
          </Button>
          <Button onClick={() => handleSubmit("send")} disabled={isLoading} className="button-primary icon-button">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isLoading ? "Procesando..." : "Crear y Ejecutar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="card-gradient border-0 shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="icon-text text-xl">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                Información Básica
              </CardTitle>
              <CardDescription className="text-base">Configura los detalles principales de tu campaña</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="form-group">
                <Label htmlFor="nombre" className="text-sm font-medium">
                  Nombre de la Campaña
                </Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Prospección 2025-08-12"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  className="h-11 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <Label htmlFor="remitente_nombre" className="text-sm font-medium icon-text">
                    <User className="w-4 h-4" />
                    Nombre del Remitente
                  </Label>
                  <Input
                    id="remitente_nombre"
                    placeholder="Luis García"
                    value={formData.remitente_nombre}
                    onChange={(e) => handleInputChange("remitente_nombre", e.target.value)}
                    className="h-11 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="remitente_email" className="text-sm font-medium icon-text">
                    <Mail className="w-4 h-4" />
                    Email del Remitente
                  </Label>
                  <Input
                    id="remitente_email"
                    type="email"
                    placeholder="info@ideidev.com"
                    value={formData.remitente_email}
                    onChange={(e) => handleInputChange("remitente_email", e.target.value)}
                    className="h-11 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <Label htmlFor="proveedor" className="text-sm font-medium">
                    Proveedor de Email
                  </Label>
                  <Select value={formData.proveedor} onValueChange={(value) => handleInputChange("proveedor", value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zeptomail">Zeptomail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-group">
                  <Label htmlFor="tz" className="text-sm font-medium icon-text">
                    <Globe className="w-4 h-4" />
                    Zona Horaria
                  </Label>
                  <Select value={formData.tz} onValueChange={(value) => handleInputChange("tz", value)}>
                    <SelectTrigger className="h-11">
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

          <Card className="card-gradient border-0 shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="icon-text text-xl">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                Configuración de Ritmo
              </CardTitle>
              <CardDescription className="text-base">
                Controla cuándo y cómo se envían los emails para evitar ser marcado como spam
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="form-row-2">
                <div className="form-group">
                  <Label htmlFor="quota_emails" className="text-sm font-medium">
                    Emails por Cuota
                  </Label>
                  <Input
                    id="quota_emails"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.ritmo.quota.emails}
                    onChange={(e) => handleRitmoChange("quota", "emails", Number.parseInt(e.target.value))}
                    className="h-11 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="quota_horas" className="text-sm font-medium">
                    Horas por Cuota
                  </Label>
                  <Input
                    id="quota_horas"
                    type="number"
                    min="1"
                    max="24"
                    value={formData.ritmo.quota.horas}
                    onChange={(e) => handleRitmoChange("quota", "horas", Number.parseInt(e.target.value))}
                    className="h-11 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="form-group">
                <Label className="text-sm font-medium mb-4 block">Días Activos</Label>
                <div className="grid grid-cols-7 gap-3">
                  {diasSemana.map((dia) => (
                    <div
                      key={dia.value}
                      className="flex flex-col items-center space-y-2 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Checkbox
                        id={`dia-${dia.value}`}
                        checked={formData.ritmo.activo.dias.includes(dia.value)}
                        onCheckedChange={(checked) => handleDiasChange(dia.value, checked as boolean)}
                        className="w-5 h-5"
                      />
                      <Label htmlFor={`dia-${dia.value}`} className="text-sm font-medium cursor-pointer">
                        {dia.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <Label htmlFor="jitter_min" className="text-sm font-medium">
                    Jitter Mínimo (seg)
                  </Label>
                  <Input
                    id="jitter_min"
                    type="number"
                    min="0"
                    value={formData.ritmo.jitter_seg.min}
                    onChange={(e) => handleRitmoChange("jitter_seg", "min", Number.parseInt(e.target.value))}
                    className="h-11 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="jitter_max" className="text-sm font-medium">
                    Jitter Máximo (seg)
                  </Label>
                  <Input
                    id="jitter_max"
                    type="number"
                    min="0"
                    value={formData.ritmo.jitter_seg.max}
                    onChange={(e) => handleRitmoChange("jitter_seg", "max", Number.parseInt(e.target.value))}
                    className="h-11 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Configuración de Ritmo</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
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
        <div className="space-y-8">
          <Card className="card-gradient border-0 shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="icon-text text-xl">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                Configuración de Audiencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="form-group">
                  <Label htmlFor="politica_email" className="text-sm font-medium">
                    Política de Email por Empresa
                  </Label>
                  <Select
                    value={formData.audiencia.politica_email_por_empresa}
                    onValueChange={(value: "uno" | "todos") =>
                      handleAudienciaChange("politica_email_por_empresa", value)
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uno">Un email por empresa</SelectItem>
                      <SelectItem value="todos">Todos los emails</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-group">
                  <Label htmlFor="limite_empresas" className="text-sm font-medium">
                    Límite de Empresas
                  </Label>
                  <Input
                    id="limite_empresas"
                    type="number"
                    min="1"
                    value={formData.audiencia.limite_empresas || ""}
                    onChange={(e) => handleAudienciaChange("limite_empresas", Number.parseInt(e.target.value) || null)}
                    className="h-11 focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="lista_supresion" className="text-sm font-medium cursor-pointer">
                      Excluir lista de supresión
                    </Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Evita enviar a contactos que se han dado de baja
                    </p>
                  </div>
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
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Vista Previa de Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Empresas objetivo:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {formData.audiencia.limite_empresas?.toLocaleString() || "Sin límite"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ritmo:</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {formData.ritmo.quota.emails}/{formData.ritmo.quota.horas}h
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Días activos:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formData.ritmo.activo.dias.length} días
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Zona horaria:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formData.tz}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
