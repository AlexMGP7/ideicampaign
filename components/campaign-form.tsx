"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Send, Save, Mail, Info, Clock, User, Globe } from "lucide-react"
import type { Campaign } from "@/types/campaign"
import { useCampaigns } from "@/hooks/queries/use-campaigns"

export function CampaignForm() {
  const { createCampaign, createAndStartCampaign, isCreating } = useCampaigns()

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
      return
    }

    if (!formData.remitente_nombre.trim() || !formData.remitente_email.trim()) {
      return
    }

    if (action === "save") {
      createCampaign({
        ...formData,
        estado: "borrador",
      })
    } else {
      createAndStartCampaign({
        ...formData,
        estado: "borrador",
      })
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

  const handleFranjaChange = (index: number, field: "inicio" | "fin", value: string) => {
    const newFranjas = [...formData.ritmo.activo.franjas]
    if (field === "inicio") {
      newFranjas[index] = [value, newFranjas[index][1]]
    } else {
      newFranjas[index] = [newFranjas[index][0], value]
    }
    handleRitmoChange("activo", "franjas", newFranjas)
  }

  const agregarFranja = () => {
    const newFranjas = [...formData.ritmo.activo.franjas, ["09:00", "17:00"]]
    handleRitmoChange("activo", "franjas", newFranjas)
  }

  const eliminarFranja = (index: number) => {
    if (formData.ritmo.activo.franjas.length > 1) {
      const newFranjas = formData.ritmo.activo.franjas.filter((_, i) => i !== index)
      handleRitmoChange("activo", "franjas", newFranjas)
    }
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
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-4 p-4 md:p-6 bg-muted/50 rounded-xl border">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Nueva Campaña
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Configura tu campaña - el contenido será generado automáticamente por IA
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={() => handleSubmit("save")} disabled={isCreating} className="icon-button">
            <Save className="icon-md" />
            Guardar Borrador
          </Button>
          <Button onClick={() => handleSubmit("send")} disabled={isCreating} className="btn-primary icon-button">
            {isCreating ? (
              <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-current" />
            ) : (
              <Send className="icon-md" />
            )}
            {isCreating ? "Procesando..." : "Crear y Ejecutar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Main Form */}
        <div className="xl:col-span-2 space-y-6 md:space-y-8">
          <Card className="bg-card border shadow-sm">
            <CardHeader className="pb-6">
              <CardTitle className="icon-text text-lg md:text-xl">
                <div className="p-2 bg-muted rounded-lg">
                  <Mail className="icon-lg text-[var(--status-info)]" />
                </div>
                Información Básica
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Configura los detalles principales de tu campaña
              </CardDescription>
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
                  className="input-standard"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="remitente_nombre" className="text-sm font-medium icon-text">
                    <User className="icon-md" />
                    Nombre del Remitente
                  </Label>
                  <Input
                    id="remitente_nombre"
                    placeholder="Luis García"
                    value={formData.remitente_nombre}
                    onChange={(e) => handleInputChange("remitente_nombre", e.target.value)}
                    className="input-standard"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="remitente_email" className="text-sm font-medium icon-text">
                    <Mail className="icon-md" />
                    Email del Remitente
                  </Label>
                  <Input
                    id="remitente_email"
                    type="email"
                    placeholder="info@ideidev.com"
                    value={formData.remitente_email}
                    onChange={(e) => handleInputChange("remitente_email", e.target.value)}
                    className="input-standard"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="proveedor" className="text-sm font-medium">
                    Proveedor de Email
                  </Label>
                  <Select value={formData.proveedor} onValueChange={(value) => handleInputChange("proveedor", value)}>
                    <SelectTrigger className="input-standard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zeptomail">Zeptomail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-group">
                  <Label htmlFor="tz" className="text-sm font-medium icon-text">
                    <Globe className="icon-md" />
                    Zona Horaria
                  </Label>
                  <Select value={formData.tz} onValueChange={(value) => handleInputChange("tz", value)}>
                    <SelectTrigger className="input-standard">
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

          <Card className="bg-card border shadow-sm">
            <CardHeader className="pb-6">
              <CardTitle className="icon-text text-lg md:text-xl">
                <div className="p-2 bg-muted rounded-lg">
                  <Clock className="icon-lg text-[var(--status-warning)]" />
                </div>
                Configuración de Ritmo
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Controla cuándo y cómo se envían los emails para evitar ser marcado como spam
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="input-standard focus:ring-[var(--status-warning)]"
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
                    className="input-standard focus:ring-[var(--status-warning)]"
                  />
                </div>
              </div>

              <div className="form-group">
                <Label className="text-sm font-medium mb-4 block">Días Activos</Label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 md:gap-3">
                  {diasSemana.map((dia) => (
                    <div
                      key={dia.value}
                      className="flex flex-col items-center space-y-2 p-2 md:p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`dia-${dia.value}`}
                        checked={formData.ritmo.activo.dias.includes(dia.value)}
                        onCheckedChange={(checked) => handleDiasChange(dia.value, checked as boolean)}
                        className="w-4 h-4 md:w-5 md:h-5"
                      />
                      <Label htmlFor={`dia-${dia.value}`} className="text-xs md:text-sm font-medium cursor-pointer">
                        {dia.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <Label className="text-sm font-medium">Franjas Horarias de Envío</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={agregarFranja}
                    className="text-xs bg-transparent self-start sm:self-auto"
                  >
                    + Agregar Franja
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.ritmo.activo.franjas.map((franja, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded-lg bg-muted/20"
                    >
                      <div className="flex items-center gap-2 w-full sm:flex-1">
                        <Label className="text-sm text-muted-foreground min-w-[50px]">Desde:</Label>
                        <Input
                          type="time"
                          value={franja[0]}
                          onChange={(e) => handleFranjaChange(index, "inicio", e.target.value)}
                          className="h-9 flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2 w-full sm:flex-1">
                        <Label className="text-sm text-muted-foreground min-w-[50px]">Hasta:</Label>
                        <Input
                          type="time"
                          value={franja[1]}
                          onChange={(e) => handleFranjaChange(index, "fin", e.target.value)}
                          className="h-9 flex-1"
                        />
                      </div>
                      {formData.ritmo.activo.franjas.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarFranja(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 px-2 self-end sm:self-auto"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Los emails solo se enviarán durante estas franjas horarias en los días seleccionados.
                </p>
              </div>

              <div className="bg-muted/50 border rounded-xl p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                    <Info className="icon-lg text-[var(--status-info)]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-card-foreground">Configuración de Ritmo</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Se enviarán {formData.ritmo.quota.emails} emails cada {formData.ritmo.quota.horas} horas, con una
                      pausa aleatoria de {formData.ritmo.jitter_seg.min}-{formData.ritmo.jitter_seg.max} segundos entre
                      envíos.
                      {formData.ritmo.activo.franjas.length > 0 && (
                        <>
                          {" "}
                          Horarios de envío: {formData.ritmo.activo.franjas.map((f) => `${f[0]}-${f[1]}`).join(", ")}.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 md:space-y-8">
          <Card className="bg-card border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Vista Previa de Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Empresas objetivo:</span>
                  <span className="font-semibold text-[var(--status-info)]">
                    {formData.audiencia.limite_empresas?.toLocaleString() || "Sin límite"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Ritmo:</span>
                  <span className="font-semibold text-[var(--status-warning)]">
                    {formData.ritmo.quota.emails}/{formData.ritmo.quota.horas}h
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Días activos:</span>
                  <span className="font-semibold text-[var(--status-success)]">
                    {formData.ritmo.activo.dias.length} días
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Horarios:</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400 text-xs">
                    {formData.ritmo.activo.franjas.map((f) => `${f[0]}-${f[1]}`).join(", ")}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Zona horaria:</span>
                  <span className="font-semibold text-card-foreground">{formData.tz}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
