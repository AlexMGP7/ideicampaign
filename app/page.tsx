"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Mail, Send, Eye, TrendingUp } from "lucide-react"
import { AuthWrapper } from "@/components/auth-wrapper"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"

const campaignStats = {
  total: 24,
  active: 8,
  completed: 16,
}

const emailStats = {
  sent: 15420,
  opened: 8234,
  clicked: 2156,
  bounced: 234,
}

const chartData = [
  { name: "Ene", sent: 2400, opened: 1398, clicked: 480 },
  { name: "Feb", sent: 1398, opened: 800, clicked: 300 },
  { name: "Mar", sent: 9800, opened: 5200, clicked: 1200 },
  { name: "Abr", sent: 3908, opened: 2100, clicked: 600 },
  { name: "May", sent: 4800, opened: 2600, clicked: 800 },
  { name: "Jun", sent: 3800, opened: 2000, clicked: 550 },
]

const pieData = [
  { name: "Abiertos", value: emailStats.opened, color: "#10b981" },
  { name: "Clicks", value: emailStats.clicked, color: "#f59e0b" },
  { name: "No Abiertos", value: emailStats.sent - emailStats.opened, color: "#6b7280" },
]

const recentCampaigns = [
  {
    id: 1,
    name: "Newsletter Semanal - Ofertas Especiales",
    date: "2024-01-15",
    status: "sent",
    sent: 1250,
    opened: 680,
    clicked: 145,
  },
  {
    id: 2,
    name: "Campaña de Bienvenida - Nuevos Usuarios",
    date: "2024-01-14",
    status: "sent",
    sent: 890,
    opened: 520,
    clicked: 89,
  },
  {
    id: 3,
    name: "Promoción Flash - 24 Horas",
    date: "2024-01-13",
    status: "sent",
    sent: 2100,
    opened: 1200,
    clicked: 340,
  },
  {
    id: 4,
    name: "Encuesta de Satisfacción",
    date: "2024-01-12",
    status: "draft",
    sent: 0,
    opened: 0,
    clicked: 0,
  },
]

export default function Dashboard() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
            Enviada
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            Borrador
          </Badge>
        )
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Programada
          </Badge>
        )
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  return (
    <AuthWrapper>
      <AppLayout>
        <PageHeader
          title="IDEI WEB Campaign Manager"
          description="Plataforma profesional de email marketing desarrollada por IDEI WEB"
        />

        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="bg-card border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Campañas</CardTitle>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Mail className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{campaignStats.total}</div>
                <p className="text-xs text-muted-foreground">+2 desde el mes pasado</p>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Emails Enviados</CardTitle>
                <div className="p-2 bg-green-500 rounded-lg">
                  <Send className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{emailStats.sent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Tasa de Apertura</CardTitle>
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Eye className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">
                  {((emailStats.opened / emailStats.sent) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">+2.1% desde el mes pasado</p>
              </CardContent>
            </Card>

            {/* Agregando cuarta card de estadísticas para completar la grilla */}
            <Card className="bg-card border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Tasa de Click</CardTitle>
                <div className="p-2 bg-orange-500 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">
                  {((emailStats.clicked / emailStats.sent) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">+0.8% desde el mes pasado</p>
              </CardContent>
            </Card>
          </div>

          {/* Separando los gráficos en una grilla independiente */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            <Card className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Rendimiento Mensual
                </CardTitle>
                <CardDescription>Emails enviados, abiertos y clicks por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        color: "hsl(var(--popover-foreground))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar dataKey="sent" fill="#3b82f6" name="Enviados" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="opened" fill="#10b981" name="Abiertos" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="clicked" fill="#f59e0b" name="Clicks" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Distribución de Engagement
                </CardTitle>
                <CardDescription>Distribución de interacciones con emails</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : "N/A"}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        color: "hsl(var(--popover-foreground))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Campaigns */}
          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Campañas Recientes
              </CardTitle>
              <CardDescription>Últimas campañas creadas y su rendimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-muted/30 hover:bg-muted/50"
                  >
                    <div className="flex items-start sm:items-center space-x-4 min-w-0 flex-1">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-card-foreground text-sm sm:text-base break-words">
                          {campaign.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{campaign.date}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      {getStatusBadge(campaign.status)}
                      {campaign.status === "sent" && (
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            <span className="text-blue-600 font-medium">{campaign.sent}</span>
                            <span>enviados •</span>
                            <span className="text-green-600 font-medium">{campaign.opened}</span>
                            <span>abiertos •</span>
                            <span className="text-orange-600 font-medium">{campaign.clicked}</span>
                            <span>clicks</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </AuthWrapper>
  )
}
