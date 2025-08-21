"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { User, Database, Key, Save, Building, Mail, Phone, MapPin, Globe } from "lucide-react"
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
      variant: "success", // Agregada variante success
      title: "Configuración guardada",
      description: "Todos los cambios se guardaron exitosamente",
    })

    // Aquí integrarías con tu API del backend
  }

  const handleInputChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Configuración
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-base">
            Gestiona la configuración de tu cuenta y campañas
          </p>
        </div>
        <Button onClick={handleSave} className="button-primary icon-button">
          <Save className="w-4 h-4" />
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Company Information */}
        <Card className="card-gradient border-0 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="icon-text text-xl">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              Información de la Empresa
            </CardTitle>
            <CardDescription className="text-base">Datos básicos de tu organización</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="form-group">
              <Label htmlFor="companyName" className="text-sm font-medium icon-text">
                <Building className="w-4 h-4" />
                Nombre de la Empresa
              </Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                className="h-11 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="form-group">
              <Label htmlFor="companyEmail" className="text-sm font-medium icon-text">
                <Mail className="w-4 h-4" />
                Email Principal
              </Label>
              <Input
                id="companyEmail"
                type="email"
                value={settings.companyEmail}
                onChange={(e) => handleInputChange("companyEmail", e.target.value)}
                className="h-11 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="form-group">
              <Label htmlFor="companyPhone" className="text-sm font-medium icon-text">
                <Phone className="w-4 h-4" />
                Teléfono
              </Label>
              <Input
                id="companyPhone"
                value={settings.companyPhone}
                onChange={(e) => handleInputChange("companyPhone", e.target.value)}
                className="h-11 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="form-group">
              <Label htmlFor="companyAddress" className="text-sm font-medium icon-text">
                <MapPin className="w-4 h-4" />
                Dirección
              </Label>
              <Textarea
                id="companyAddress"
                value={settings.companyAddress}
                onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                rows={4}
                className="resize-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card className="card-gradient border-0 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="icon-text text-xl">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Key className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              Configuración de API
            </CardTitle>
            <CardDescription className="text-base">Conexión con tu backend y servicios externos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="form-group">
              <Label htmlFor="apiEndpoint" className="text-sm font-medium icon-text">
                <Globe className="w-4 h-4" />
                Endpoint de API
              </Label>
              <Input
                id="apiEndpoint"
                value={settings.apiEndpoint}
                onChange={(e) => handleInputChange("apiEndpoint", e.target.value)}
                className="h-11 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="form-group">
              <Label htmlFor="apiKey" className="text-sm font-medium icon-text">
                <Key className="w-4 h-4" />
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={settings.apiKey}
                onChange={(e) => handleInputChange("apiKey", e.target.value)}
                className="h-11 focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Tu clave API se mantiene segura y encriptada
              </p>
            </div>
            <div className="form-group">
              <Label htmlFor="webhookUrl" className="text-sm font-medium icon-text">
                <Globe className="w-4 h-4" />
                URL de Webhook
              </Label>
              <Input
                id="webhookUrl"
                value={settings.webhookUrl}
                onChange={(e) => handleInputChange("webhookUrl", e.target.value)}
                className="h-11 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Database className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-300">
                    Conectado
                  </Badge>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Última sincronización: hace 2 minutos
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
