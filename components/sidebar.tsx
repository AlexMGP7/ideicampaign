"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Home, Plus, Mail, Users, LogOut, User, Eye } from "lucide-react"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const menuItems = [
    { id: "/", label: "Dashboard", icon: Home },
    { id: "/campaigns/create", label: "Nueva Campaña", icon: Plus },
    { id: "/campaigns/send", label: "Ver Envío", icon: Eye },
    { id: "/campaigns", label: "Campañas", icon: Mail },
    { id: "/contacts", label: "Contactos", icon: Users },
  ]

  return (
    <div className="w-full h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <Image
              src="/images/ideiweb-logo.png"
              alt="IDEI WEB Logo"
              width={140}
              height={45}
              className="object-contain transition-opacity group-hover:opacity-80"
              priority
            />
          </Link>
          {/* Toggle visible solo en escritorio */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm text-sidebar-foreground/70">Campaign Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-4 space-y-2 flex-1" role="navigation" aria-label="Menú principal">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.id
          return (
            <Link key={item.id} href={item.id} className="block">
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start transition-all duration-200 h-11",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      {user && (
        <div className="p-4 border-t border-sidebar-border bg-sidebar/50">
          <div className="flex items-center space-x-3 mb-3 p-2 rounded-lg bg-sidebar-accent/30">
            <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 h-9"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      )}

      {/* Footer tema solo móvil */}
      <div className="md:hidden p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-sidebar-foreground/70">Tema</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
