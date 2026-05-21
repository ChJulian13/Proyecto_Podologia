import { z } from 'zod';

// ────────────────────────────────────────────────────────────────────────────
// Sub-schema de receta
// ────────────────────────────────────────────────────────────────────────────

export const CreateConsultaRecetaSchema = z.object({
  producto_id:           z.string().uuid('UUID de producto inválido'),
  cantidad:              z.number().int().positive('La cantidad debe ser un entero positivo'),
  precio_unitario_venta: z.number().positive('El precio debe ser positivo'),
  indicaciones_uso:      z.string().max(500).optional().nullable(),
});

export type CreateConsultaRecetaDTO = z.infer<typeof CreateConsultaRecetaSchema>;

// ────────────────────────────────────────────────────────────────────────────
// Schemas principales (Consulta)
// ────────────────────────────────────────────────────────────────────────────

export const CreateConsultaSchema = z.object({
  // IDs vinculados (obligatorios)
  clinica_id:  z.string().uuid('UUID de clínica inválido'),
  cita_id:     z.string().uuid('UUID de cita inválido'),
  paciente_id: z.string().uuid('UUID de paciente inválido'),
  podologo_id: z.string().uuid('UUID de podólogo inválido'),

  // IDs opcionales
  servicio_id: z.string().uuid('UUID de servicio inválido').optional().nullable(),

  // Datos clínicos (mapean 1:1 con columnas de la tabla `consultas`)
  diagnostico:             z.string().max(2000).optional().nullable(),
  procedimiento_detallado: z.string().max(2000).optional().nullable(),
  indicaciones_cuidado:    z.string().max(2000).optional().nullable(),
  fecha_proxima_consulta:  z.string().optional().nullable(), // ISO date string YYYY-MM-DD
  monto_procedimiento:     z.number().nonnegative().optional().nullable(),

  // Recetas opcionales (se crean en la misma transacción)
  recetas: z.array(CreateConsultaRecetaSchema).optional().default([]),
});

export type CreateConsultaDTO = z.infer<typeof CreateConsultaSchema>;

export const UpdateConsultaSchema = z.object({
  // Solo campos clínicos editables; se prohíbe modificar cita_id / paciente_id / podologo_id
  diagnostico:             z.string().max(2000).optional().nullable(),
  procedimiento_detallado: z.string().max(2000).optional().nullable(),
  indicaciones_cuidado:    z.string().max(2000).optional().nullable(),
  fecha_proxima_consulta:  z.string().optional().nullable(),
  monto_procedimiento:     z.number().nonnegative().optional().nullable(),
  modificado_por_id:       z.string().uuid('UUID de usuario inválido').optional(),
});

export type UpdateConsultaDTO = z.infer<typeof UpdateConsultaSchema>;

// ────────────────────────────────────────────────────────────────────────────
// Row — representación directa de la fila SQL
// ────────────────────────────────────────────────────────────────────────────

export interface ConsultaRecetaRow {
  id: string;
  consulta_id: string;
  producto_id: string;
  producto_nombre?: string;
  cantidad: number;
  precio_unitario_venta: number | null;
  indicaciones_uso: string | null;
}

export interface ConsultaRow {
  id: string;
  clinica_id: string;
  cita_id: string;
  paciente_id: string;
  podologo_id: string;
  servicio_id: string | null;
  diagnostico: string | null;
  procedimiento_detallado: string | null;
  indicaciones_cuidado: string | null;
  fecha_proxima_consulta: string | null;
  monto_procedimiento: number | null;
  modificado_por_id: string | null;
  fecha_registro: Date;
}

// ────────────────────────────────────────────────────────────────────────────
// Entity — representación de dominio (camelCase para el cliente)
// ────────────────────────────────────────────────────────────────────────────

export interface ConsultaRecetaEntity {
  id: string;
  consultaId: string;
  productoId: string;
  productoNombre?: string | undefined;
  cantidad: number;
  precioUnitarioVenta: number | null;
  indicacionesUso: string | null;
}

export interface ConsultaEntity {
  id: string;
  clinicaId: string;
  citaId: string;
  pacienteId: string;
  podologoId: string;
  servicioId: string | null;
  diagnostico: string | null;
  procedimientoDetallado: string | null;
  indicacionesCuidado: string | null;
  fechaProximaConsulta: string | null;
  montoProcedimiento: number | null;
  modificadoPorId: string | null;
  fechaRegistro: Date;
  recetas: ConsultaRecetaEntity[];
}

// ────────────────────────────────────────────────────────────────────────────
// Mappers
// ────────────────────────────────────────────────────────────────────────────

export const mapRecetaRowToEntity = (row: ConsultaRecetaRow): ConsultaRecetaEntity => ({
  id: row.id,
  consultaId: row.consulta_id,
  productoId: row.producto_id,
  productoNombre: row.producto_nombre,
  cantidad: row.cantidad,
  precioUnitarioVenta: row.precio_unitario_venta !== null ? Number(row.precio_unitario_venta) : null,
  indicacionesUso: row.indicaciones_uso,
});

export const mapConsultaRowToEntity = (
  row: ConsultaRow,
  recetas: ConsultaRecetaRow[] = []
): ConsultaEntity => ({
  id: row.id,
  clinicaId: row.clinica_id,
  citaId: row.cita_id,
  pacienteId: row.paciente_id,
  podologoId: row.podologo_id,
  servicioId: row.servicio_id,
  diagnostico: row.diagnostico,
  procedimientoDetallado: row.procedimiento_detallado,
  indicacionesCuidado: row.indicaciones_cuidado,
  fechaProximaConsulta: row.fecha_proxima_consulta
    ? new Date(row.fecha_proxima_consulta).toISOString().substring(0, 10)
    : null,
  montoProcedimiento: row.monto_procedimiento !== null ? Number(row.monto_procedimiento) : null,
  modificadoPorId: row.modificado_por_id,
  fechaRegistro: row.fecha_registro,
  recetas: recetas.map(mapRecetaRowToEntity),
});
