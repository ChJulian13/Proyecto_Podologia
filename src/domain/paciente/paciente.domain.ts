import { z } from 'zod';

export const CreatePacienteSchema = z.object({
  clinica_id: z.string().uuid("El ID de la clínica debe ser un UUID válido"),
  nombre: z.string().min(2, "El nombre es muy corto"),
  primer_apellido: z.string().min(2, "El primer apellido es obligatorio"),
  segundo_apellido: z.string().optional(),
  telefono: z.string().regex(/^\+?[\d\s\-]{7,20}$/, "Formato de teléfono inválido"), // Es NOT NULL en tu BD
  correo: z.preprocess((val) => (val === '' ? undefined : val), z.string().email().optional()),
  fecha_nacimiento: z.string().optional(),
  direccion: z.string().optional(),
  discapacidad: z.string().optional(),
  alergias: z.string().optional(),
  notas: z.string().optional(),
});

export const UpdatePacienteSchema = CreatePacienteSchema.partial();

export type CreatePacienteDTO = z.infer<typeof CreatePacienteSchema>;
export type UpdatePacienteDTO = z.infer<typeof UpdatePacienteSchema>;

export interface PacienteRow {
  id: string;
  clinica_id: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string | null;
  telefono: string;
  correo: string | null;
  fecha_nacimiento: string | null;
  direccion: string | null;
  discapacidad: string | null;
  alergias: string | null;
  notas: string | null;
  
  esta_activo: number;
  fecha_creacion: Date;
}

export interface PacienteEntity {
  id: string;
  clinicaId: string;
  nombre: string;
  primerApellido: string;
  segundoApellido: string | null;
  telefono: string;
  correo: string | null;
  fechaNacimiento: string | null;
  direccion: string | null;
  discapacidad: string | null;
  alergias: string | null;
  notas: string | null;
  estaActivo: boolean;
  fechaCreacion: Date;
}

export const mapPacienteRowToEntity = (row: PacienteRow): PacienteEntity => {
  return {
    id: row.id,
    clinicaId: row.clinica_id,
    nombre: row.nombre,
    primerApellido: row.primer_apellido,
    segundoApellido: row.segundo_apellido,
    telefono: row.telefono,
    correo: row.correo,
    fechaNacimiento: row.fecha_nacimiento ? new Date(row.fecha_nacimiento).toISOString().substring(0, 10) : null,
    direccion: row.direccion,
    discapacidad: row.discapacidad,
    alergias: row.alergias,
    notas: row.notas,
    estaActivo: row.esta_activo === 1,
    fechaCreacion: row.fecha_creacion,
  };
};