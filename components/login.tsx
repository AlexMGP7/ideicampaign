"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, AlertCircle } from "lucide-react"

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
        action: (
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
        ),
      })
      return
    }

    if (!password.trim()) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "La contraseña es requerida",
        action: (
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
        ),
      })
      return
    }

    toast({
      title: "Inicio de sesión exitoso",
      description: `Bienvenido al panel de campañas de IDEI WEB`,
      action: (
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-600" />
        </div>
      ),
    })

    onLogin({
      name: "Usuario Demo",
      email: email || "demo@ideiweb.com",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-idei-blue/5 to-idei-light/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/images/ideiweb-logo.png"
              alt="IDEI WEB Logo"
              width={150}
              height={50}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Iniciar Sesión</CardTitle>
          <CardDescription>Accede a tu panel de campañas de IDEI WEB</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Iniciar Sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
