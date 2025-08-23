"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    setIsSheetOpen(false)
  }, [pathname])

  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "Dashboard"
      case "/campaigns":
        return "Campañas"
      case "/campaigns/create":
        return "Nueva Campaña"
      case "/campaigns/send":
        return "Ver Envío"
      case "/contacts":
        return "Contactos"
      default:
        return "IDEI WEB Campaign Manager"
    }
  }

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex h-14 items-center gap-2 px-4">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú de navegación">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Menú de navegación</SheetTitle>
              </SheetHeader>
              <Sidebar />
            </SheetContent>
          </Sheet>
          <span className="font-semibold truncate">{getPageTitle()}</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex min-h-screen bg-background">
        {/* Desktop sidebar */}
        <aside
          className="hidden md:block w-64 border-r border-border bg-sidebar"
          role="navigation"
          aria-label="Navegación principal"
        >
          <div className="sticky top-0 h-screen overflow-y-auto">
            <Sidebar />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden" role="main">
          <div className="container max-w-none p-4 md:p-8">{children}</div>
        </main>
      </div>
    </>
  )
}
