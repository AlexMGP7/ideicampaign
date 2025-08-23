"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
/* ⭐️ NUEVO: AlertDialog para confirmar borrado */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Edit,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Trash2,        // ⭐️ NUEVO: ícono eliminar
  Loader2,       // ⭐️ NUEVO: spinner
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { empresaService } from "@/services/empresaService";
import type { Empresa, EmpresaFilters } from "@/types/empresa";

export function Contacts() {
  const { toast } = useToast();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEmpresas, setTotalEmpresas] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  /* ⭐️ NUEVO: estado para eliminar */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [empresaAEliminar, setEmpresaAEliminar] = useState<Empresa | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [filters, setFilters] = useState<EmpresaFilters>({
    page: 1,
    per_page: 50,
    order_by: "recientes",
  });

  const [editForm, setEditForm] = useState({
    estado: "",
    notas: "",
    telefono: "",
    sitio_web: "",
    contactada_manual: false,
  });

  useEffect(() => {
    loadEmpresas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadEmpresas = async () => {
    setLoading(true);
    try {
      const response = await empresaService.listarEmpresas(filters);
      if (response.ok) {
        setEmpresas(response.data);
        setTotalEmpresas(response.meta.total);
        setCurrentPage(response.meta.page);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las empresas",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error de conexión al cargar empresas",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, q: query, page: 1 }));
  };

  const handleFilterChange = (key: keyof EmpresaFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const openEditDialog = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setEditForm({
      estado: empresa.crm?.estado ?? "sin_contactar",
      notas: empresa.crm?.notas ?? "",
      telefono: empresa.telefono || "",
      sitio_web: empresa.sitio_web || "",
      contactada_manual: empresa.resumen_contacto.contactada_manual,
    });
    setEditDialogOpen(true);
  };

  const openDetailDialog = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setDetailDialogOpen(true);
  };

  /* ⭐️ NUEVO: abrir diálogo de eliminar */
  const openDeleteDialog = (empresa: Empresa) => {
    setEmpresaAEliminar(empresa);
    setDeleteDialogOpen(true);
  };

  /* ⭐️ NUEVO: confirmar eliminación */
  const handleDeleteEmpresa = async () => {
    if (!empresaAEliminar) return;
    setDeleting(true);
    try {
      const res = await empresaService.eliminarEmpresa(empresaAEliminar.id);

      if (!res.ok) {
        throw new Error(res.error || "No se pudo eliminar la empresa");
      }

      // Actualización optimista del listado y contadores
      setEmpresas((prev) => prev.filter((e) => e.id !== empresaAEliminar.id));
      setTotalEmpresas((prev) => Math.max(0, prev - 1));

      // Feedback con detalles de impacto (si vienen)
      const imp = res.impacto;
      const detalle =
        imp
          ? `Se borraron ${imp.emails_borrados} emails y ${imp.destinatarios_borrados} destinatarios. ` +
            `${imp.eventos_que_quedan_con_destinatario_null} eventos quedaron sin destinatario.`
          : undefined;

      toast({
        variant: "success",
        title: "Empresa eliminada",
        description:
          `“${empresaAEliminar.titulo}” fue eliminada correctamente.` +
          (detalle ? ` ${detalle}` : ""),
      });

      setDeleteDialogOpen(false);
      setEmpresaAEliminar(null);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof Error ? err.message : "No se pudo eliminar la empresa",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateEmpresa = async () => {
    if (!selectedEmpresa) return;

    try {
      const response = await empresaService.actualizarEstado({
        empresa_id: selectedEmpresa.id,
        estado: editForm.estado as any,
        notas: editForm.notas || undefined,
        telefono: editForm.telefono || undefined,
        sitio_web: editForm.sitio_web || undefined,
        contactada_manual: editForm.contactada_manual,
      });

      if (response.ok) {
        toast({
          variant: "success",
          title: "Empresa actualizada",
          description: `Los datos de "${selectedEmpresa.titulo}" se actualizaron correctamente`,
        });
        setEditDialogOpen(false);
        loadEmpresas(); // Recargar la lista
      } else {
        throw new Error(response.error || "Error al actualizar");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al actualizar empresa",
      });
    }
  };

  const getEstadoBadge = (empresa: Empresa) => {
    const { resumen_contacto, crm } = empresa;

    if (crm?.estado) {
      const estadoColors = {
        sin_contactar:
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
        contactada:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        interesada:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        no_interesada:
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        pendiente:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        bloqueada: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
      return (
        <Badge
          className={
            estadoColors[(crm?.estado as keyof typeof estadoColors) ?? "sin_contactar"] ||
            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          }
        >
          {(crm?.estado ?? "sin_contactar").replace("_", " ")}
        </Badge>
      );
    }

    if (resumen_contacto.contactada_por_campana) {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Contactada por campaña
        </Badge>
      );
    }

    return <Badge variant="outline">Sin contactar</Badge>;
  };

  const totalPages = Math.ceil(totalEmpresas / (filters.per_page || 50));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Contactos
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-base">
            Gestiona tu base de datos de empresas y su estado de contacto
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="text-sm px-3 py-1 bg-white dark:bg-gray-800"
          >
            <Building2 className="w-4 h-4 mr-2" />
            {totalEmpresas.toLocaleString()} empresas
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <Card className="card-gradient border-0 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="icon-text text-xl">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="form-group">
              <Label htmlFor="search" className="text-sm font-medium">
                Buscar
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nombre, email, teléfono..."
                  className="pl-11 h-11 focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <Label htmlFor="contactada" className="text-sm font-medium">
                Estado de Contacto
              </Label>
              <Select
                onValueChange={(value) =>
                  handleFilterChange(
                    "contactada",
                    value === "all" ? undefined : value
                  )
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="si">Contactadas</SelectItem>
                  <SelectItem value="no">No contactadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="form-group">
              <Label htmlFor="order" className="text-sm font-medium">
                Ordenar por
              </Label>
              <Select
                value={filters.order_by}
                onValueChange={(value) => handleFilterChange("order_by", value)}
              >
                <SelectTrigger className="h-11">
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

            <div className="form-group">
              <Label htmlFor="per_page" className="text-sm font-medium">
                Resultados por página
              </Label>
              <Select
                value={filters.per_page?.toString()}
                onValueChange={(value) =>
                  handleFilterChange("per_page", Number.parseInt(value))
                }
              >
                <SelectTrigger className="h-11">
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
      <Card className="card-gradient border-0 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="icon-text text-xl">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            Lista de Empresas
          </CardTitle>
          <CardDescription className="text-base">
            Página {currentPage} de {totalPages} (
            {totalEmpresas.toLocaleString()} empresas total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="w-full overflow-hidden rounded-lg border">
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold w-[28%]">
                        Empresa
                      </TableHead>
                      <TableHead className="font-semibold w-[32%]">
                        Contacto
                      </TableHead>
                      <TableHead className="font-semibold w-[15%]">
                        Estado
                      </TableHead>
                      <TableHead className="font-semibold w-[15%]">
                        Métricas
                      </TableHead>
                      <TableHead className="font-semibold w-[10%]">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresas.map((empresa) => (
                      <TableRow
                        key={empresa.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="w-[28%] p-4">
                          <div className="space-y-1 min-w-0">
                            <div
                              className="font-semibold text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-blue-600 transition-colors"
                              title={empresa.titulo}
                              onClick={() => openDetailDialog(empresa)}
                            >
                              {empresa.titulo}
                            </div>
                            {empresa.categoria.nombre && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 min-w-0">
                                <Building2 className="w-3 h-3 flex-shrink-0" />
                                <span
                                  className="truncate"
                                  title={empresa.categoria.nombre}
                                >
                                  {empresa.categoria.nombre}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="w-[32%] p-4">
                          <div className="space-y-2 min-w-0">
                            {empresa.emails.length > 0 && (
                              <div className="flex items-start gap-1 text-sm min-w-0">
                                <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <span
                                  className="flex-1 whitespace-normal break-words leading-tight"
                                  title={empresa.emails[0]}
                                >
                                  {empresa.emails[0]}
                                </span>
                                {empresa.emails.length > 1 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-0.5 flex-shrink-0 self-start"
                                  >
                                    +{empresa.emails.length - 1}
                                  </Badge>
                                )}
                              </div>
                            )}
                            {empresa.telefono && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 min-w-0">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span
                                  className="truncate"
                                  title={empresa.telefono}
                                >
                                  {empresa.telefono}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="w-[15%] p-4">
                          <div className="space-y-2 min-w-0">
                            {getEstadoBadge(empresa)}
                            {empresa.crm?.notas && (
                              <div
                                className="text-xs text-gray-600 dark:text-gray-400 truncate cursor-help"
                                title={empresa.crm?.notas ?? ""}
                              >
                                {empresa.crm?.notas}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="w-[15%] p-4">
                          <div className="text-sm space-y-1 min-w-0">
                            <div className="text-blue-600 dark:text-blue-400 truncate">
                              Env: {empresa.resumen_contacto.enviados}
                            </div>
                            <div className="text-green-600 dark:text-green-400 truncate">
                              Apt: {(empresa.resumen_contacto as any)?.aperturas ?? empresa.resumen_contacto.abiertos}
                            </div>
                            <div className="text-orange-600 dark:text-orange-400 truncate">
                              Clc: {empresa.resumen_contacto.clics}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="w-[10%] p-4">
                          <div className="flex gap-1 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetailDialog(empresa)}
                              className="p-2 h-8 w-8"
                              title="Ver detalles"
                              aria-label="Ver detalles"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(empresa)}
                              className="p-2 h-8 w-8"
                              title="Editar"
                              aria-label="Editar"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            {/* ⭐️ NUEVO: botón eliminar */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(empresa)}
                              className="p-2 h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/50"
                              title="Eliminar"
                              aria-label="Eliminar"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 pt-6 border-t">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {(currentPage - 1) * (filters.per_page || 50) + 1} a{" "}
                  {Math.min(
                    currentPage * (filters.per_page || 50),
                    totalEmpresas
                  )}{" "}
                  de {totalEmpresas.toLocaleString()} empresas
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="icon-button"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="icon-button"
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
        <DialogContent className="max-w-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl">Editar Empresa</DialogTitle>
            <DialogDescription className="text-base">
              Actualiza el estado y datos de contacto de{" "}
              {selectedEmpresa?.titulo}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="form-group">
              <Label htmlFor="estado" className="text-sm font-medium">
                Estado
              </Label>
              <Select
                value={editForm.estado}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, estado: value }))
                }
              >
                <SelectTrigger className="h-11">
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

            <div className="form-row-2">
              <div className="form-group">
                <Label
                  htmlFor="telefono"
                  className="text-sm font-medium icon-text"
                >
                  <Phone className="w-4 h-4" />
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  value={editForm.telefono}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      telefono: e.target.value,
                    }))
                  }
                  placeholder="Teléfono de contacto"
                  className="h-11"
                />
              </div>
              <div className="form-group">
                <Label
                  htmlFor="sitio_web"
                  className="text-sm font-medium icon-text"
                >
                  <Globe className="w-4 h-4" />
                  Sitio Web
                </Label>
                <Input
                  id="sitio_web"
                  value={editForm.sitio_web}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      sitio_web: e.target.value,
                    }))
                  }
                  placeholder="https://ejemplo.com"
                  className="h-11"
                />
              </div>
            </div>

            <div className="form-group">
              <Label htmlFor="notas" className="text-sm font-medium">
                Notas
              </Label>
              <Textarea
                id="notas"
                value={editForm.notas}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, notas: e.target.value }))
                }
                placeholder="Notas sobre el contacto..."
                rows={4}
                className="resize-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateEmpresa}
                className="button-primary px-6"
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ⭐️ NUEVO: AlertDialog de confirmación de borrado */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar empresa</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar{" "}
              <span className="font-medium">
                “{empresaAEliminar?.titulo ?? ""}”
              </span>
              . Esta acción no se puede deshacer y eliminará contactos y
              destinatarios asociados. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmpresa}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Eliminando...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de detalle */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEmpresa?.titulo}</DialogTitle>
            <DialogDescription>
              Información detallada de la empresa
            </DialogDescription>
          </DialogHeader>

          {selectedEmpresa && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Información de Contacto</h4>
                  <div className="space-y-2 text-sm">
                    {selectedEmpresa.emails.map((email, index) => (
                      <div key={index} className="flex items-center min-w-0">
                        <Mail className="w-3 h-3 mr-2 flex-shrink-0" />
                        <span className="truncate" title={email}>
                          {email}
                        </span>
                      </div>
                    ))}
                    {selectedEmpresa.telefono && (
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
                        {selectedEmpresa.telefono}
                      </div>
                    )}
                    {selectedEmpresa.sitio_web && (
                      <div className="flex items-center min-w-0">
                        <Globe className="w-3 h-3 mr-2 flex-shrink-0" />
                        <a
                          href={selectedEmpresa.sitio_web}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate block min-w-0"
                          title={selectedEmpresa.sitio_web}
                        >
                          {selectedEmpresa.sitio_web}
                        </a>
                      </div>
                    )}
                    {selectedEmpresa.direccion && (
                      <div className="flex items-center min-w-0">
                        <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
                        <span
                          className="truncate"
                          title={selectedEmpresa.direccion}
                        >
                          {selectedEmpresa.direccion}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Métricas de Campaña</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      Campañas: {(selectedEmpresa.resumen_contacto as any)?.num_campanas ?? 0}
                    </div>
                    <div>
                      Emails enviados: {selectedEmpresa.resumen_contacto.enviados}
                    </div>
                    <div>
                      Aperturas: {(selectedEmpresa.resumen_contacto as any)?.aperturas ?? selectedEmpresa.resumen_contacto.abiertos}
                    </div>
                    <div>Clics: {selectedEmpresa.resumen_contacto.clics}</div>
                    <div>
                      Suprimidos: {(selectedEmpresa.resumen_contacto as any)?.suprimidos ?? 0}
                    </div>
                    {(selectedEmpresa.resumen_contacto as any)?.ultimo_evento && (
                      <div>
                        Último evento: {(selectedEmpresa.resumen_contacto as any)?.ultimo_evento}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedEmpresa?.crm?.notas && (
                <div>
                  <h4 className="font-medium mb-2">Notas CRM</h4>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    {selectedEmpresa?.crm?.notas}
                  </div>
                  {selectedEmpresa?.crm?.actualizado_en && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Actualizado:{" "}
                      {new Date(
                        selectedEmpresa.crm.actualizado_en
                      ).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
