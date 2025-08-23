"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Home, Plus, Mail, Users, LogOut, User, Eye } from "lucide-react"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  user?: { name: string; email: string }
  onLogout?: () => void
}

export function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "Dashboard", icon: Home },
    { id: "create", label: "Nueva Campaña", icon: Plus },
    { id: "send", label: "Ver Envío", icon: Eye },
    // { id: "analytics", label: "Análisis", icon: BarChart3 },
    { id: "campaigns", label: "Campañas", icon: Mail },
    { id: "contacts", label: "Contactos", icon: Users },
    // { id: "settings", label: "Configuración", icon: Settings },
  ]

  return (
    <div className="w-full md:w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/images/ideiweb-logo.png"
              alt="IDEI WEB Logo"
              width={140}
              height={45}
              className="object-contain"
            />
          </div>
          {/* Toggle visible solo en escritorio */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm text-sidebar-foreground/70">Campaign Manager</p>
        </div>
      </div>

      <nav className="px-4 space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start transition-colors",
                activeTab === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              onClick={() => setActiveTab(item.id)}
              aria-current={activeTab === item.id ? "page" : undefined}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              onClick={onLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      )}

      {/* Footer tema solo móvil (abajo) */}
      <div className="md:hidden p-4 border-t border-sidebar-border mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-sm text-sidebar-foreground/70">Tema</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
