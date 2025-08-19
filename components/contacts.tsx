"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Filter,
  Edit,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { empresaService } from "@/services/empresaService"
import type { Empresa, EmpresaFilters } from "@/types/empresa"

export function Contacts() {
  const { toast } = useToast()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [totalEmpresas, setTotalEmpresas] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const [filters, setFilters] = useState<EmpresaFilters>({
    page: 1,
    per_page: 50,
    order_by: "recientes",
  })

  const [editForm, setEditForm] = useState({
    estado: "",
    notas: "",
    telefono: "",
    sitio_web: "",
    contactada_manual: false,
  })

  useEffect(() => {
    loadEmpresas()
  }, [filters])

  const loadEmpresas = async () => {
    setLoading(true)
    try {
      const response = await empresaService.listarEmpresas(filters)
      if (response.ok) {
        setEmpresas(response.data)
        setTotalEmpresas(response.meta.total)
        setCurrentPage(response.meta.page)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las empresas",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error de conexión al cargar empresas",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, q: query, page: 1 }))
  }

  const handleFilterChange = (key: keyof EmpresaFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  const openEditDialog = (empresa: Empresa) => {
    setSelectedEmpresa(empresa)
    setEditForm({
      estado: empresa.crm.estado || "sin_contactar",
      notas: empresa.crm.notas || "",
      telefono: empresa.telefono || "",
      sitio_web: empresa.sitio_web || "",
      contactada_manual: empresa.resumen_contacto.contactada_manual,
    })
    setEditDialogOpen(true)
  }

  const openDetailDialog = (empresa: Empresa) => {
    setSelectedEmpresa(empresa)
    setDetailDialogOpen(true)
  }

  const handleUpdateEmpresa = async () => {
    if (!selectedEmpresa) return

    try {
      const response = await empresaService.actualizarEstado({
        empresa_id: selectedEmpresa.id,
        estado: editForm.estado as any,
        notas: editForm.notas || undefined,
        telefono: editForm.telefono || undefined,
        sitio_web: editForm.sitio_web || undefined,
        contactada_manual: editForm.contactada_manual,
      })

      if (response.ok) {
        toast({
          title: "Empresa actualizada",
          description: `Los datos de "${selectedEmpresa.titulo}" se actualizaron correctamente`,
          action: (
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          ),
        })
        setEditDialogOpen(false)
        loadEmpresas() // Recargar la lista
      } else {
        throw new Error(response.error || "Error al actualizar")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar empresa",
      })
    }
  }

  const getEstadoBadge = (empresa: Empresa) => {
    const { resumen_contacto, crm } = empresa

    if (crm.estado) {
      const estadoColors = {
        sin_contactar: "bg-gray-100 text-gray-800",
        contactada: "bg-blue-100 text-blue-800",
        interesada: "bg-green-100 text-green-800",
        no_interesada: "bg-red-100 text-red-800",
        pendiente: "bg-yellow-100 text-yellow-800",
        bloqueada: "bg-red-100 text-red-800",
      }
      return (
        <Badge className={estadoColors[crm.estado as keyof typeof estadoColors] || "bg-gray-100 text-gray-800"}>
          {crm.estado.replace("_", " ")}
        </Badge>
      )
    }

    if (resumen_contacto.contactada_por_campana) {
      return <Badge className="bg-blue-100 text-blue-800">Contactada por campaña</Badge>
    }

    return <Badge variant="outline">Sin contactar</Badge>
  }

  const totalPages = Math.ceil(totalEmpresas / (filters.per_page || 50))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contactos</h2>
          <p className="text-muted-foreground">Gestiona tu base de datos de empresas y su estado de contacto</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {totalEmpresas.toLocaleString()} empresas
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nombre, email, teléfono..."
                  className="pl-10"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contactada">Estado de Contacto</Label>
              <Select onValueChange={(value) => handleFilterChange("contactada", value === "all" ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="si">Contactadas</SelectItem>
                  <SelectItem value="no">No contactadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="order">Ordenar por</Label>
              <Select value={filters.order_by} onValueChange={(value) => handleFilterChange("order_by", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recientes">Más recientes</SelectItem>
                  <SelectItem value="antiguos">Más antiguos</SelectItem>
                  <SelectItem value="titulo">Nombre A-Z</SelectItem>
                  <SelectItem value="categoria">Por categoría</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="per_page">Resultados por página</Label>
              <Select
                value={filters.per_page?.toString()}
                onValueChange={(value) => handleFilterChange("per_page", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de empresas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Lista de Empresas
          </CardTitle>
          <CardDescription>
            Página {currentPage} de {totalPages} ({totalEmpresas.toLocaleString()} empresas total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Métricas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresas.map((empresa) => (
                    <TableRow key={empresa.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{empresa.titulo}</div>
                          <div className="text-sm text-muted-foreground">
                            {empresa.categoria.nombre && (
                              <span className="inline-flex items-center">
                                <Building2 className="w-3 h-3 mr-1" />
                                {empresa.categoria.nombre}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          {empresa.emails.length > 0 && (
                            <div className="flex items-center text-sm">
                              <Mail className="w-3 h-3 mr-1" />
                              {empresa.emails[0]}
                              {empresa.emails.length > 1 && (
                                <Badge variant="outline" className="ml-1 text-xs">
                                  +{empresa.emails.length - 1}
                                </Badge>
                              )}
                            </div>
                          )}
                          {empresa.telefono && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="w-3 h-3 mr-1" />
                              {empresa.telefono}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {getEstadoBadge(empresa)}
                        {empresa.crm.notas && (
                          <div className="text-xs text-muted-foreground mt-1 truncate max-w-32">
                            {empresa.crm.notas}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>Enviados: {empresa.resumen_contacto.enviados}</div>
                          <div>Aperturas: {empresa.resumen_contacto.aperturas}</div>
                          <div>Clics: {empresa.resumen_contacto.clics}</div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" onClick={() => openDetailDialog(empresa)}>
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(empresa)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * (filters.per_page || 50) + 1} a{" "}
                  {Math.min(currentPage * (filters.per_page || 50), totalEmpresas)} de {totalEmpresas.toLocaleString()}{" "}
                  empresas
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de edición */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
            <DialogDescription>Actualiza el estado y datos de contacto de {selectedEmpresa?.titulo}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={editForm.estado}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, estado: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin_contactar">Sin contactar</SelectItem>
                  <SelectItem value="contactada">Contactada</SelectItem>
                  <SelectItem value="interesada">Interesada</SelectItem>
                  <SelectItem value="no_interesada">No interesada</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="bloqueada">Bloqueada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={editForm.telefono}
                onChange={(e) => setEditForm((prev) => ({ ...prev, telefono: e.target.value }))}
                placeholder="Teléfono de contacto"
              />
            </div>

            <div>
              <Label htmlFor="sitio_web">Sitio Web</Label>
              <Input
                id="sitio_web"
                value={editForm.sitio_web}
                onChange={(e) => setEditForm((prev) => ({ ...prev, sitio_web: e.target.value }))}
                placeholder="https://ejemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={editForm.notas}
                onChange={(e) => setEditForm((prev) => ({ ...prev, notas: e.target.value }))}
                placeholder="Notas sobre el contacto..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateEmpresa}>Guardar Cambios</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de detalle */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEmpresa?.titulo}</DialogTitle>
            <DialogDescription>Información detallada de la empresa</DialogDescription>
          </DialogHeader>

          {selectedEmpresa && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Información de Contacto</h4>
                  <div className="space-y-2 text-sm">
                    {selectedEmpresa.emails.map((email, index) => (
                      <div key={index} className="flex items-center">
                        <Mail className="w-3 h-3 mr-2" />
                        {email}
                      </div>
                    ))}
                    {selectedEmpresa.telefono && (
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 mr-2" />
                        {selectedEmpresa.telefono}
                      </div>
                    )}
                    {selectedEmpresa.sitio_web && (
                      <div className="flex items-center">
                        <Globe className="w-3 h-3 mr-2" />
                        <a
                          href={selectedEmpresa.sitio_web}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {selectedEmpresa.sitio_web}
                        </a>
                      </div>
                    )}
                    {selectedEmpresa.direccion && (
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-2" />
                        {selectedEmpresa.direccion}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Métricas de Campaña</h4>
                  <div className="space-y-2 text-sm">
                    <div>Campañas: {selectedEmpresa.resumen_contacto.num_campanas}</div>
                    <div>Emails enviados: {selectedEmpresa.resumen_contacto.enviados}</div>
                    <div>Aperturas: {selectedEmpresa.resumen_contacto.aperturas}</div>
                    <div>Clics: {selectedEmpresa.resumen_contacto.clics}</div>
                    <div>Suprimidos: {selectedEmpresa.resumen_contacto.suprimidos}</div>
                    {selectedEmpresa.resumen_contacto.ultimo_evento && (
                      <div>Último evento: {selectedEmpresa.resumen_contacto.ultimo_evento}</div>
                    )}
                  </div>
                </div>
              </div>

              {selectedEmpresa.crm.notas && (
                <div>
                  <h4 className="font-medium mb-2">Notas CRM</h4>
                  <div className="p-3 bg-muted rounded-lg text-sm">{selectedEmpresa.crm.notas}</div>
                  {selectedEmpresa.crm.actualizado_en && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Actualizado: {new Date(selectedEmpresa.crm.actualizado_en).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
