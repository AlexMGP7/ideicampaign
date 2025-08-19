"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { User, Database, Key, Save, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function Settings() {
  const { toast } = useToast()

  const [settings, setSettings] = useState({
    // Company Settings
    companyName: "Mi Empresa",
    companyEmail: "contacto@miempresa.com",
    companyPhone: "+1 234 567 8900",
    companyAddress: "123 Calle Principal, Ciudad",

    // API Settings
    apiEndpoint: "https://api.miempresa.com/v1",
    apiKey: "sk_test_...",
    webhookUrl: "https://miempresa.com/webhooks/campaigns",
  })

  const handleSave = () => {
    console.log("[v0] Saving settings:", settings)

    toast({
      title: "Configuración guardada",
      description: "Todos los cambios se guardaron exitosamente",
      action: (
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-600" />
        </div>
      ),
    })

    // Aquí integrarías con tu API del backend
  }

  const handleInputChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuración</h2>
          <p className="text-muted-foreground">Gestiona la configuración de tu cuenta y campañas</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Información de la Empresa
            </CardTitle>
            <CardDescription>Datos básicos de tu organización</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Nombre de la Empresa</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="companyEmail">Email Principal</Label>
              <Input
                id="companyEmail"
                type="email"
                value={settings.companyEmail}
                onChange={(e) => handleInputChange("companyEmail", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="companyPhone">Teléfono</Label>
              <Input
                id="companyPhone"
                value={settings.companyPhone}
                onChange={(e) => handleInputChange("companyPhone", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="companyAddress">Dirección</Label>
              <Textarea
                id="companyAddress"
                value={settings.companyAddress}
                onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Configuración de API
            </CardTitle>
            <CardDescription>Conexión con tu backend y servicios externos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiEndpoint">Endpoint de API</Label>
              <Input
                id="apiEndpoint"
                value={settings.apiEndpoint}
                onChange={(e) => handleInputChange("apiEndpoint", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={settings.apiKey}
                onChange={(e) => handleInputChange("apiKey", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Tu clave API se mantiene segura y encriptada</p>
            </div>
            <div>
              <Label htmlFor="webhookUrl">URL de Webhook</Label>
              <Input
                id="webhookUrl"
                value={settings.webhookUrl}
                onChange={(e) => handleInputChange("webhookUrl", e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-600">
                <Database className="w-3 h-3 mr-1" />
                Conectado
              </Badge>
              <span className="text-sm text-muted-foreground">Última sincronización: hace 2 minutos</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
