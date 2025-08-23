"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Mail, Send, TrendingUp, Eye, Clock, CheckCircle } from "lucide-react"
import { CampaignForm } from "@/components/campaign-form"
import { Sidebar } from "@/components/sidebar"
import { SendCampaign } from "@/components/view-campaign"
import { Settings } from "@/components/settings"
import { Login } from "@/components/login"
import { Contacts } from "@/components/contacts"
import { CampaignsList } from "@/components/campaigns-list"

// Mock data for demonstration
const campaignStats = {
  total: 24,
  sent: 18,
  draft: 4,
  scheduled: 2,
}

const emailStats = {
  sent: 45280,
  delivered: 43156,
  opened: 18947,
  clicked: 3789,
}

const recentCampaigns = [
  { id: 1, name: "Summer Sale 2024", status: "sent", sent: 5420, opened: 2341, clicked: 456, date: "2024-01-15" },
  { id: 2, name: "Product Launch", status: "scheduled", sent: 0, opened: 0, clicked: 0, date: "2024-01-20" },
  { id: 3, name: "Newsletter #47", status: "draft", sent: 0, opened: 0, clicked: 0, date: "2024-01-10" },
  { id: 4, name: "Black Friday", status: "sent", sent: 8930, opened: 4521, clicked: 892, date: "2024-01-12" },
]

const chartData = [
  { name: "Ene", sent: 4000, opened: 2400, clicked: 400 },
  { name: "Feb", sent: 3000, opened: 1398, clicked: 300 },
  { name: "Mar", sent: 2000, opened: 9800, clicked: 200 },
  { name: "Abr", sent: 2780, opened: 3908, clicked: 278 },
  { name: "May", sent: 1890, opened: 4800, clicked: 189 },
  { name: "Jun", sent: 2390, opened: 3800, clicked: 239 },
]

const pieData = [
  { name: "Entregados", value: 43156, color: "#10b981" },
  { name: "Abiertos", value: 18947, color: "#3b82f6" },
  { name: "Clicks", value: 3789, color: "#f59e0b" },
  { name: "Rebotes", value: 2124, color: "#ef4444" },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Enviada
          </Badge>
        )
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="w-3 h-3 mr-1" />
            Programada
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="secondary">
            <Eye className="w-3 h-3 mr-1" />
            Borrador
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (

    <><div className="md:hidden sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex h-14 items-center gap-2 px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Abrir menú">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menú</SheetTitle>
            </SheetHeader>
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => { setActiveTab(tab) }}
              user={user}
              onLogout={handleLogout} />
          </SheetContent>
        </Sheet>
        <span className="font-semibold">IDEI WEB Campaign Manager</span>
      </div>
    </div><div className="flex min-h-screen bg-background">
        <div className="hidden md:block">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />
        </div>

        <main className="flex-1 overflow-x-hidden">

          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">IDEI WEB Campaign Manager</h1>
              <p className="text-muted-foreground">Plataforma profesional de email marketing desarrollada por IDEI WEB</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      <p className="text-xs text-muted-foreground">+0.5% desde el mes pasado</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-card border shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Rendimiento Mensual
                      </CardTitle>
                      <CardDescription>Emails enviados, abiertos y clicks por mes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              color: "hsl(var(--popover-foreground))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }} />
                          <Bar dataKey="sent" fill="#3b82f6" name="Enviados" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="opened" fill="#10b981" name="Abiertos" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="clicked" fill="#f59e0b" name="Clicks" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        Distribución de Engagement
                      </CardTitle>
                      <CardDescription>Distribución de interacciones con emails</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : "N/A"}%`}
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
                            }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Campaigns */}
                <Card className="bg-card border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Campañas Recientes
                    </CardTitle>
                    <CardDescription>Últimas campañas creadas y su rendimiento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentCampaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow bg-muted/30 hover:bg-muted/50"
                        >
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="font-semibold text-card-foreground">{campaign.name}</h4>
                              <p className="text-sm text-muted-foreground">{campaign.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {getStatusBadge(campaign.status)}
                            {campaign.status === "sent" && (
                              <div className="text-sm text-muted-foreground">
                                <span className="text-blue-600 font-medium">{campaign.sent}</span> enviados •
                                <span className="text-green-600 font-medium"> {campaign.opened}</span> abiertos •
                                <span className="text-orange-600 font-medium"> {campaign.clicked}</span> clicks
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="create">
                <CampaignForm />
              </TabsContent>

              <TabsContent value="send">
                <SendCampaign />
              </TabsContent>

              <TabsContent value="analytics">
                <div className="space-y-6">
                  <Card className="bg-card border shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Análisis Detallado
                      </CardTitle>
                      <CardDescription>Métricas avanzadas de rendimiento de campañas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              color: "hsl(var(--popover-foreground))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }} />
                          <Line
                            type="monotone"
                            dataKey="sent"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            name="Enviados"
                            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }} />
                          <Line
                            type="monotone"
                            dataKey="opened"
                            stroke="#10b981"
                            strokeWidth={3}
                            name="Abiertos"
                            dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }} />
                          <Line
                            type="monotone"
                            dataKey="clicked"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            name="Clicks"
                            dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="campaigns">
                <CampaignsList />
              </TabsContent>

              <TabsContent value="contacts">
                <Contacts />
              </TabsContent>

              <TabsContent value="settings">
                <Settings />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div></>

  )
}
