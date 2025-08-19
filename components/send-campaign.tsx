"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, Eye, Users, Mail, AlertTriangle, Rocket } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for existing campaigns
const existingCampaigns = [
  {
    id: 1,
    name: "Summer Sale 2024",
    status: "draft",
    subject: "¡Ofertas de verano increíbles!",
    fromName: "Mi Empresa",
    fromEmail: "noreply@miempresa.com",
    content: "Descubre nuestras ofertas especiales de verano...",
    audienceCount: 2450,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Product Launch Newsletter",
    status: "draft",
    subject: "Nuevo producto disponible",
    fromName: "Equipo de Producto",
    fromEmail: "producto@miempresa.com",
    content: "Te presentamos nuestro nuevo producto revolucionario...",
    audienceCount: 1890,
    createdAt: "2024-01-14",
  },
  {
    id: 3,
    name: "Newsletter Mensual #47",
    status: "draft",
    subject: "Novedades del mes",
    fromName: "Mi Empresa",
    fromEmail: "newsletter@miempresa.com",
    content: "Este mes hemos preparado contenido especial...",
    audienceCount: 3200,
    createdAt: "2024-01-10",
  },
]

const audienceLists = [
  { id: "all", name: "Todos los contactos", count: 2450 },
  { id: "subscribers", name: "Suscriptores activos", count: 1890 },
  { id: "customers", name: "Clientes", count: 560 },
  { id: "prospects", name: "Prospectos", count: 1200 },
]

export function SendCampaign() {
  const { toast } = useToast()

  const [selectedCampaign, setSelectedCampaign] = useState<string>("")
  const [selectedAudience, setSelectedAudience] = useState<string>("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const campaign = existingCampaigns.find((c) => c.id.toString() === selectedCampaign)
  const audience = audienceLists.find((a) => a.id === selectedAudience)

  const handleSendCampaign = () => {
    if (!campaign || !audience) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Debes seleccionar una campaña y una audiencia",
      })
      return
    }

    console.log("[v0] Sending campaign:", {
      campaignId: campaign.id,
      campaignName: campaign.name,
      audienceId: selectedAudience,
      audienceCount: audience.count,
    })

    // Show success toast
    toast({
      title: "Campaña enviada",
      description: `"${campaign.name}" se envió exitosamente a ${audience.count.toLocaleString()} contactos`,
      action: (
        <div className="flex items-center">
          <Rocket className="w-4 h-4 text-blue-600" />
        </div>
      ),
    })

    // Aquí integrarías con tu API del backend para enviar la campaña
  }

  const handlePreview = () => {
    setIsPreviewOpen(!isPreviewOpen)

    if (!isPreviewOpen && campaign) {
      toast({
        title: "Vista previa abierta",
        description: `Revisando la campaña "${campaign.name}"`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enviar Campaña</h2>
          <p className="text-muted-foreground">Selecciona una campaña existente y envíala a tu audiencia</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Seleccionar Campaña
              </CardTitle>
              <CardDescription>Elige la campaña que deseas enviar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una campaña" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingCampaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{campaign.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {campaign.status === "draft" ? "Borrador" : "Lista"}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {campaign && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold">{campaign.name}</h4>
                      <p className="text-sm text-muted-foreground">Creada el {campaign.createdAt}</p>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Asunto:</span>
                        <p className="text-muted-foreground">{campaign.subject}</p>
                      </div>
                      <div>
                        <span className="font-medium">Remitente:</span>
                        <p className="text-muted-foreground">{campaign.fromName}</p>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Vista previa del contenido:</span>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{campaign.content}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {campaign && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Seleccionar Audiencia
                </CardTitle>
                <CardDescription>Elige a quién enviar la campaña</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una lista de contactos" />
                  </SelectTrigger>
                  <SelectContent>
                    {audienceLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name} ({list.count.toLocaleString()} contactos)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {audience && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Esta campaña se enviará a <strong>{audience.count.toLocaleString()} contactos</strong> de la lista
                      "{audience.name}".
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {campaign && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent" onClick={handlePreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  Vista Previa
                </Button>

                <Button className="w-full" onClick={handleSendCampaign} disabled={!selectedAudience}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Ahora
                </Button>
              </CardContent>
            </Card>
          )}

          {campaign && audience && (
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Envío</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Campaña:</span>
                    <span className="font-medium">{campaign.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Destinatarios:</span>
                    <span className="font-medium">{audience.count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lista:</span>
                    <span className="font-medium">{audience.name}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Costo estimado:</span>
                    <span>$0.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Consejos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Revisa siempre la vista previa antes de enviar</p>
                <p>• Verifica que la audiencia sea correcta</p>
                <p>• Los mejores horarios son entre 10-11 AM y 2-3 PM</p>
                <p>• Evita enviar los lunes y viernes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && campaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vista Previa - {campaign.name}</CardTitle>
                <Button variant="outline" onClick={handlePreview}>
                  Cerrar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="text-sm space-y-2">
                    <div>
                      <strong>De:</strong> {campaign.fromName} &lt;{campaign.fromEmail}&gt;
                    </div>
                    <div>
                      <strong>Asunto:</strong> {campaign.subject}
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-white">
                  <div className="prose prose-sm max-w-none">{campaign.content}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
