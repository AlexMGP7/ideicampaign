"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { Mail, Lock } from "lucide-react"

interface LoginProps {
  onLogin: (userData: { name: string; email: string }) => void
}

export function Login({ onLogin }: LoginProps) {
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "El email es requerido",
      })
      return
    }

    if (!password.trim()) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "La contraseña es requerida",
      })
      return
    }

    toast({
      variant: "success",
      title: "Inicio de sesión exitoso",
      description: `Bienvenido al panel de campañas de IDEI WEB`,
    })

    onLogin({
      name: "Usuario Demo",
      email: email || "demo@ideiweb.com",
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-card border shadow-2xl">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex justify-center">
            <div className="p-4 bg-muted rounded-2xl">
              <Image
                src="/images/ideiweb-logo.png"
                alt="IDEI WEB Logo"
                width={120}
                height={40}
                className="object-contain"
              />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Accede a tu panel de campañas de IDEI WEB
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 border-input focus:border-ring focus:ring-ring rounded-lg"
                />
              </div>
            </div>
            <div className="form-group">
              <Label htmlFor="password" className="text-sm font-medium text-card-foreground">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12 border-input focus:border-ring focus:ring-ring rounded-lg"
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 button-primary text-base font-medium rounded-lg">
              Iniciar Sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
