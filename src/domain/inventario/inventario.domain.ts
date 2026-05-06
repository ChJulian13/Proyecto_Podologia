import { z } from 'zod';

// ==========================================
// 1. CAPA DE VALIDACIÓN (DTOs)
// ==========================================
export const CreateInventarioSchema = z.object({
  clinica_id: z.string().uuid("El ID de la clínica debe ser un UUID válido"),
  categoria_id: z.string().uuid("El ID de la categoría debe ser un UUID válido"),
  nombre: z.string().min(2, "El nombre del artículo es obligatorio"),
  descripcion: z.string().optional().nullable(),
  stock_cantidad: z.number().int().min(0, "El stock no puede ser negativo").default(0),
  precio_compra: z.number().min(0, "El precio de compra no puede ser negativo").optional().nullable(),
  precio_venta: z.number().min(0, "El precio de venta no puede ser negativo").optional().nullable(),
  fecha_caducidad: z.string().optional().nullable(),
  ubicacion: z.string().max(255).optional().nullable(),
});

export const UpdateInventarioSchema = CreateInventarioSchema.omit({ clinica_id: true }).partial();

export const AjusteStockSchema = z.object({
  cantidad: z.number().int().positive("La cantidad de ajuste debe ser mayor a 0"),
  tipo: z.enum(['ENTRADA', 'SALIDA'] as const, { error: "El tipo debe ser ENTRADA o SALIDA" }),
  motivo: z.string().optional(),
});

export type CreateInventarioDTO = z.infer<typeof CreateInventarioSchema>;
export type UpdateInventarioDTO = z.infer<typeof UpdateInventarioSchema>;
export type AjusteStockDTO = z.infer<typeof AjusteStockSchema>;

// ==========================================
// 2. CAPA DE INFRAESTRUCTURA (MySQL)
// ==========================================
export interface InventarioRow {
  id: string;
  clinica_id: string;
  categoria_id: string;
  nombre: string;
  descripcion: string | null;
  stock_cantidad: number;
  precio_compra: string | null; // MySQL DECIMAL → string
  precio_venta: string | null;  // MySQL DECIMAL → string
  fecha_caducidad: Date | null;
  ubicacion: string | null;
  esta_activo: number;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  // Campos extraídos del JOIN
  categoria_nombre?: string;
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
  stockCantidad: number;
  precioCompra: number | null;
  precioVenta: number | null;
  fechaCaducidad: Date | null;
  ubicacion: string | null;
  estaActivo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// ==========================================
// 4. MAPPER
// ==========================================
export const mapInventarioRowToEntity = (row: InventarioRow): InventarioEntity => ({
  id: row.id,
  clinicaId: row.clinica_id,
  categoria: {
    id: row.categoria_id,
    nombre: row.categoria_nombre || 'Categoría Desconocida',
  },
  nombre: row.nombre,
  descripcion: row.descripcion,
  stockCantidad: row.stock_cantidad,
  precioCompra: row.precio_compra !== null ? parseFloat(row.precio_compra) : null,
  precioVenta: row.precio_venta !== null ? parseFloat(row.precio_venta) : null,
  fechaCaducidad: row.fecha_caducidad,
  ubicacion: row.ubicacion,
  estaActivo: row.esta_activo === 1,
  fechaCreacion: row.fecha_creacion,
  fechaActualizacion: row.fecha_actualizacion,
});
