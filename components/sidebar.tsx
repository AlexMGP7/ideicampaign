"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Home, Plus, BarChart3, Settings, Mail, Users, Send, LogOut, User, Eye } from "lucide-react"
import Image from "next/image"

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
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Image
            src="/images/ideiweb-logo.png"
            alt="IDEI WEB Logo"
            width={140}
            height={45}
            className="object-contain"
          />
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-600">Campaign Manager</p>
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
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      )}
    </div>
  )
}
