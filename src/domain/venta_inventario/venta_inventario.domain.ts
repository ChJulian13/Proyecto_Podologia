import { z } from 'zod';

// ==========================================
// 1. CAPA DE VALIDACIÓN (DTOs)
// ==========================================
export const ItemVentaSchema = z.object({
  inventario_item_id: z.string().uuid("El ID del artículo de inventario debe ser un UUID válido"),
  cantidad: z.number().int().positive("La cantidad debe ser mayor a 0"),
  precio_venta: z.number().min(0, "El precio de venta no puede ser negativo"),
});

export const CreateVentaInventarioSchema = z.object({
  clinica_id: z.string().uuid("El ID de la clínica debe ser un UUID válido"),
  paciente_id: z.string().uuid("UUID de paciente inválido").optional().nullable(),
  factura_id: z.string().uuid("UUID de factura inválido").optional().nullable(),
  productos: z.array(ItemVentaSchema).min(1, "Debe incluir al menos un producto en la venta"),
});

export type CreateVentaInventarioDTO = z.infer<typeof CreateVentaInventarioSchema>;

// ==========================================
// 2. CAPA DE INFRAESTRUCTURA (MySQL)
// ==========================================
export interface VentaInventarioRow {
  id: string;
  clinica_id: string;
  paciente_id: string | null;
  factura_id: string | null;
  inventario_item_id: string;
  cantidad: number;
  precio_venta: string; // MySQL DECIMAL → string
  fecha_venta: Date;
  esta_cancelada: number;
  // Campos extraídos del JOIN
  item_nombre?: string;
}

// ==========================================
// 3. CAPA DE DOMINIO PURA (Entity para Angular)
// ==========================================
export interface VentaInventarioEntity {
  id: string;
  clinicaId: string;
  pacienteId: string | null;
  facturaId: string | null;
  inventarioItem: {
    id: string;
    nombre: string;
  };
  cantidad: number;
  precioVenta: number;
  fechaVenta: Date;
  estaCancelada: boolean;
}

// ==========================================
// 4. MAPPER
// ==========================================
export const mapVentaInventarioRowToEntity = (row: VentaInventarioRow): VentaInventarioEntity => ({
  id: row.id,
  clinicaId: row.clinica_id,
  pacienteId: row.paciente_id,
  facturaId: row.factura_id,
  inventarioItem: {
    id: row.inventario_item_id,
    nombre: row.item_nombre || 'Artículo Desconocido',
  },
  cantidad: row.cantidad,
  precioVenta: parseFloat(row.precio_venta),
  fechaVenta: row.fecha_venta,
  estaCancelada: row.esta_cancelada === 1,
});
