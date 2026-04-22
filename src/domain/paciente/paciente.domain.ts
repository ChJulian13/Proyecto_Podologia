import { z } from 'zod';

export const CreatePacienteSchema = z.object({
  clinica_id: z.string().uuid("El ID de la clínica debe ser un UUID válido"),
  nombre: z.string().min(2, "El nombre es muy corto"),
  primer_apellido: z.string().min(2, "El primer apellido es obligatorio"),
  segundo_apellido: z.string().optional(),
  telefono: z.string().regex(/^\+?[\d\s\-]{7,20}$/, "Formato de teléfono inválido"), // Es NOT NULL en tu BD
  correo: z.preprocess((val) => (val === '' ? undefined : val), z.string().email().optional()),
  fecha_nacimiento: z.string().optional(),
  discapacidad: z.string().optional(),
  alergias: z.string().optional(),
  notas: z.string().optional(),
  codigoPostal: z.string().regex(/^\d{5}$/, "El código postal debe tener 5 dígitos").optional(),
  estado: z.string().optional(),
  municipio: z.string().optional(),
  ciudad: z.string().optional(),
  colonia: z.string().optional(),
  calleYNumero: z.string().optional(),
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
  discapacidad: string | null;
  alergias: string | null;
  notas: string | null;
  
  esta_activo: number;
  fecha_creacion: Date;

  clinica_nombre?: string;
  codigo_postal: string | null;
  estado: string | null;
  municipio: string | null;
  ciudad: string | null;
  colonia: string | null;
  calle_y_numero: string | null;
}

export interface PacienteEntity {
  id: string;
  clinica: {
    id: string;
    nombre: string;
  };
  nombre: string;
  primerApellido: string;
  segundoApellido: string | null;
  nombreCompleto: string;
  telefono: string;
  correo: string | null;
  fechaNacimiento: string | null;
  discapacidad: string | null;
  alergias: string | null;
  notas: string | null;
  estaActivo: boolean;
  fechaCreacion: Date;
  codigoPostal: string | null;
  estado: string | null;
  municipio: string | null;
  ciudad: string | null;
  colonia: string | null;
  calleYNumero: string | null;
}

export const mapPacienteRowToEntity = (row: PacienteRow): PacienteEntity => {
  const nombreCompleto = [row.nombre, row.primer_apellido, row.segundo_apellido].filter(Boolean).join(' ');
  return {
    id: row.id,
    clinica: {
      id: row.clinica_id,
      nombre: row.clinica_nombre || 'Clínica Desconocida'
    },
    nombre: row.nombre,
    primerApellido: row.primer_apellido,
    segundoApellido: row.segundo_apellido,
    nombreCompleto: nombreCompleto,
    telefono: row.telefono,
    correo: row.correo,
    fechaNacimiento: row.fecha_nacimiento ? new Date(row.fecha_nacimiento).toISOString().substring(0, 10) : null,
    discapacidad: row.discapacidad,
    alergias: row.alergias,
    notas: row.notas,
    estaActivo: row.esta_activo === 1,
    fechaCreacion: row.fecha_creacion,
    codigoPostal: row.codigo_postal,
    estado: row.estado,
    municipio: row.municipio,
    ciudad: row.ciudad,
    colonia: row.colonia,
    calleYNumero: row.calle_y_numero
  };
};