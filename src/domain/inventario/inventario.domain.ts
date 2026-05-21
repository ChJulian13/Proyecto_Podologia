import { z } from 'zod';

// ==========================================
// 1. CAPA DE VALIDACIÓN (DTOs)
// ==========================================
export const CreateInventarioSchema = z.object({
  clinica_id: z.string().uuid("El ID de la clínica debe ser un UUID válido"),
  categoria_id: z.string().uuid("El ID de la categoría debe ser un UUID válido"),
  nombre: z.string().min(2, "El nombre del artículo es obligatorio"),
  descripcion: z.string().optional().nullable(),
  precio_compra: z.number().min(0, "El precio de compra no puede ser negativo").optional().nullable(),
  precio_venta: z.number().min(0, "El precio de venta no puede ser negativo").optional().nullable(),
  requiere_lote: z.boolean().default(false),
  requiere_caducidad: z.boolean().default(false),
  ubicacion: z.string().max(255).optional().nullable(),
});

export const UpdateInventarioSchema = CreateInventarioSchema.omit({ clinica_id: true }).partial();

export const CreateLoteSchema = z.object({
  numero_lote: z.string().min(1, "El número de lote es obligatorio").max(50),
  fecha_caducidad: z.string().optional().nullable(),
  stock_cantidad: z.number().int().min(1, "La cantidad debe ser al menos 1"),
});

export const CreateCodigoBarrasSchema = z.object({
  codigo_barra: z.string().min(1, "El código de barras es obligatorio").max(100),
});

export type CreateInventarioDTO = z.infer<typeof CreateInventarioSchema>;
export type UpdateInventarioDTO = z.infer<typeof UpdateInventarioSchema>;
export type CreateLoteDTO = z.infer<typeof CreateLoteSchema>;
export type CreateCodigoBarrasDTO = z.infer<typeof CreateCodigoBarrasSchema>;

// ==========================================
// 2. CAPA DE INFRAESTRUCTURA (MySQL)
// ==========================================
export interface InventarioRow {
  id: string;
  clinica_id: string;
  categoria_id: string;
  nombre: string;
  descripcion: string | null;
  precio_compra: string | null; // MySQL DECIMAL → string
  precio_venta: string | null;  // MySQL DECIMAL → string
  requiere_lote: number;        // tinyint → 0 | 1
  requiere_caducidad: number;   // tinyint → 0 | 1
  ubicacion: string | null;
  esta_activo: number;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  // Campos extraídos del JOIN
  categoria_nombre?: string;
  // Campo calculado del SUM sobre inventario_lotes
  stock_total?: number;
}

export interface InventarioLoteRow {
  id: string;
  inventario_id: string;
  numero_lote: string;
  fecha_caducidad: Date | null;
  stock_cantidad: number;
  fecha_ingreso: Date;
}

export interface InventarioCodigoBarrasRow {
  id: string;
  clinica_id: string;
  inventario_id: string;
  codigo_barra: string;
  fecha_creacion: Date;
}

// ==========================================
// 3. CAPA DE DOMINIO PURA (Entity para Angular)
// ==========================================
export interface InventarioEntity {
  id: string;
  clinicaId: string;
  categoria: {
    id: string;
    nombre: string;
  };
  nombre: string;
  descripcion: string | null;
  precioCompra?: number | null;
  precioVenta: number | null;
  requiereLote: boolean;
  requiereCaducidad: boolean;
  ubicacion: string | null;
  estaActivo: boolean;
  stockTotal: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface InventarioLoteEntity {
  id: string;
  inventarioId: string;
  numeroLote: string;
  fechaCaducidad: String | null;
  stockCantidad: number;
  fechaIngreso: Date;
}

export interface InventarioCodigoBarrasEntity {
  id: string;
  clinicaId: string;
  inventarioId: string;
  codigoBarra: string;
  fechaCreacion: Date;
}

export interface InventarioAutocompleteResult {
  id: string;
  nombre: string;
  precioVenta: number;
  stockTotal: number;
}

// ==========================================
// 4. MAPPERS
// ==========================================
export const mapInventarioRowToEntity = (row: InventarioRow, rol?: string): InventarioEntity => {
  const entity: InventarioEntity = {
    id: row.id,
    clinicaId: row.clinica_id,
    categoria: {
      id: row.categoria_id,
      nombre: row.categoria_nombre || 'Categoría Desconocida',
    },
    nombre: row.nombre,
    descripcion: row.descripcion,
    precioCompra: row.precio_compra !== null ? parseFloat(row.precio_compra) : null,
    precioVenta: row.precio_venta !== null ? parseFloat(row.precio_venta) : null,
    requiereLote: row.requiere_lote === 1,
    requiereCaducidad: row.requiere_caducidad === 1,
    ubicacion: row.ubicacion,
    estaActivo: row.esta_activo === 1,
    stockTotal: row.stock_total ?? 0,
    fechaCreacion: row.fecha_creacion,
    fechaActualizacion: row.fecha_actualizacion,
  };

  if (rol === 'PODOLOGO' || rol === 'RECEPCIONISTA') {
    delete entity.precioCompra;
  }

  return entity;
};

export const mapLoteRowToEntity = (row: InventarioLoteRow): InventarioLoteEntity => ({
  id: row.id,
  inventarioId: row.inventario_id,
  numeroLote: row.numero_lote,
  fechaCaducidad: row.fecha_caducidad
    ? String(row.fecha_caducidad).substring(0, 10)
    : null,
  stockCantidad: row.stock_cantidad,
  fechaIngreso: row.fecha_ingreso,
});

export const mapCodigoBarrasRowToEntity = (row: InventarioCodigoBarrasRow): InventarioCodigoBarrasEntity => ({
  id: row.id,
  clinicaId: row.clinica_id,
  inventarioId: row.inventario_id,
  codigoBarra: row.codigo_barra,
  fechaCreacion: row.fecha_creacion,
});
