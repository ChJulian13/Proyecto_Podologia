import { z } from 'zod';

export const CreateFacturaSchema = z.object({
  clinica_id: z.string().uuid("UUID de clínica inválido"),
  paciente_id: z.string().uuid("UUID de paciente inválido"),
  consulta_id: z.string().uuid("UUID de consulta inválido").optional().nullable(),
  numero_factura: z.string().min(1, "El número de factura es obligatorio"),
  descripcion_servicio: z.string().min(1, "Debe incluir una descripción"),
  monto: z.number().min(0, "El monto no puede ser negativo"),
  creado_por_id: z.string().uuid("UUID de usuario inválido"),
  es_nota_credito: z.boolean().default(false),
  factura_original_id: z.string().uuid("UUID de factura original inválido").optional().nullable(),
}).refine(data => !data.es_nota_credito || data.factura_original_id, {
  message: "La factura original es requerida si es una nota de crédito",
  path: ["factura_original_id"]
});

export type CreateFacturaDTO = z.infer<typeof CreateFacturaSchema>;

export const UpdateEstadoFacturaSchema = z.object({
  estado_pago: z.literal('PAGADO'),
  metodo_pago: z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CHEQUE', 'CREDITO_CLINICA'])
});

export type UpdateEstadoFacturaDTO = z.infer<typeof UpdateEstadoFacturaSchema>;

export interface FacturaRow {
  id: string; clinica_id: string; paciente_id: string; consulta_id: string | null;
  numero_factura: string; fecha_emision: Date; descripcion_servicio: string;
  monto: number; estado_pago: 'PENDIENTE' | 'PAGADO';
  metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CHEQUE' | 'CREDITO_CLINICA' | null; fecha_pago: Date | null;
  creado_por_id: string;
  es_nota_credito: number;
  factura_original_id: string | null;
}

export interface FacturaEntity {
  id: string; clinicaId: string; pacienteId: string; consultaId: string | null;
  numeroFactura: string; fechaEmision: Date; descripcionServicio: string;
  monto: number; estadoPago: 'PENDIENTE' | 'PAGADO';
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CHEQUE' | 'CREDITO_CLINICA' | null; fechaPago: Date | null;
  creadoPorId: string;
  esNotaCredito: boolean;
  facturaOriginalId: string | null;
}

export const mapFacturaRowToEntity = (row: FacturaRow): FacturaEntity => ({
  id: row.id, clinicaId: row.clinica_id, pacienteId: row.paciente_id, consultaId: row.consulta_id,
  numeroFactura: row.numero_factura, fechaEmision: row.fecha_emision,
  descripcionServicio: row.descripcion_servicio, monto: Number(row.monto),
  estadoPago: row.estado_pago, metodoPago: row.metodo_pago, fechaPago: row.fecha_pago,
  creadoPorId: row.creado_por_id,
  esNotaCredito: row.es_nota_credito === 1,
  facturaOriginalId: row.factura_original_id
});