import { z } from 'zod';

export const CreateFacturaSchema = z.object({
  clinica_id: z.string().uuid("UUID de clínica inválido"),
  paciente_id: z.string().uuid("UUID de paciente inválido"),
  cita_id: z.string().uuid("UUID de cita inválido").optional().nullable(),
  numero_factura: z.string().min(1, "El número de factura es obligatorio"),
  descripcion_servicio: z.string().min(1, "Debe incluir una descripción"),
  monto: z.number().min(0, "El monto no puede ser negativo"),
});

export type CreateFacturaDTO = z.infer<typeof CreateFacturaSchema>;

// Al actualizar a PAGADO, obligamos a enviar el método de pago
export const UpdateEstadoFacturaSchema = z.object({
  estado_pago: z.literal('PAGADO'),
  metodo_pago: z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'])
});

export type UpdateEstadoFacturaDTO = z.infer<typeof UpdateEstadoFacturaSchema>;

export interface FacturaRow {
  id: string; clinica_id: string; paciente_id: string; cita_id: string | null;
  numero_factura: string; fecha_emision: Date; descripcion_servicio: string;
  monto: number; estado_pago: 'PENDIENTE' | 'PAGADO';
  metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | null; fecha_pago: Date | null;
}

export interface FacturaEntity {
  id: string; clinicaId: string; pacienteId: string; citaId: string | null;
  numeroFactura: string; fechaEmision: Date; descripcionServicio: string;
  monto: number; estadoPago: 'PENDIENTE' | 'PAGADO';
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | null; fechaPago: Date | null;
}

export const mapFacturaRowToEntity = (row: FacturaRow): FacturaEntity => ({
  id: row.id, clinicaId: row.clinica_id, pacienteId: row.paciente_id, citaId: row.cita_id,
  numeroFactura: row.numero_factura, fechaEmision: row.fecha_emision,
  descripcionServicio: row.descripcion_servicio, monto: Number(row.monto),
  estadoPago: row.estado_pago, metodoPago: row.metodo_pago, fechaPago: row.fecha_pago
});