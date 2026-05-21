import { z } from 'zod';

export const EstadoFirma = z.enum(['PENDIENTE', 'FIRMADO', 'RECHAZADO', 'VENCIDO']);
export type EstadoFirmaType = z.infer<typeof EstadoFirma>;

export const CreateConsentimientoSchema = z.object({
  clinica_id: z.string().uuid(),
  paciente_id: z.string().uuid(),
  consulta_id: z.string().uuid().optional().nullable(),
  tipo_documento: z.string().min(1),
  estado_firma: EstadoFirma.default('PENDIENTE'),
  url_documento: z.string().url().optional().nullable(),
});

export const UpdateConsentimientoSchema = z.object({
  estado_firma: EstadoFirma.optional(),
  url_documento: z.string().url().optional().nullable(),
  fecha_firma: z.string().datetime().optional().nullable(),
  ip_firma: z.string().optional().nullable(),
});

export type CreateConsentimientoDTO = z.infer<typeof CreateConsentimientoSchema>;
export type UpdateConsentimientoDTO = z.infer<typeof UpdateConsentimientoSchema>;

export interface ConsentimientoRow {
  id: string;
  clinica_id: string;
  paciente_id: string;
  consulta_id: string | null;
  tipo_documento: string;
  estado_firma: EstadoFirmaType;
  url_documento: string | null;
  fecha_firma: Date | null;
  ip_firma: string | null;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface ConsentimientoEntity {
  id: string;
  clinicaId: string;
  pacienteId: string;
  consultaId: string | null;
  tipoDocumento: string;
  estadoFirma: EstadoFirmaType;
  urlDocumento: string | null;
  fechaFirma: Date | null;
  ipFirma: string | null;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export const mapConsentimientoRowToEntity = (row: ConsentimientoRow): ConsentimientoEntity => ({
  id: row.id,
  clinicaId: row.clinica_id,
  pacienteId: row.paciente_id,
  consultaId: row.consulta_id,
  tipoDocumento: row.tipo_documento,
  estadoFirma: row.estado_firma,
  urlDocumento: row.url_documento,
  fechaFirma: row.fecha_firma,
  ipFirma: row.ip_firma,
  fechaCreacion: row.fecha_creacion,
  fechaActualizacion: row.fecha_actualizacion,
});
