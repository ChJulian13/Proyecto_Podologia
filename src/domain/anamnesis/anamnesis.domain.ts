import { z } from 'zod';
import { buildNombreCompleto } from '../../common/utils/name.utils.js';
import { mapDireccionRowToFields, type DireccionFields, type DireccionRow } from '../../common/types/direccion.types.js';

// ────────────────────────────────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────────────────────────────────

const ComoNosEncontroEnum = z.enum([
  'EVENTO', 'INSTAGRAM', 'INTERNET', 'RECOMENDACION', 'OTRO'
]);

// ────────────────────────────────────────────────────────────────────────────
// Schemas de validación Zod
// ────────────────────────────────────────────────────────────────────────────

/**
 * Schema para el PASO 2 del registro.
 * Payload híbrido: datos del paciente + datos médicos de anamnesis.
 */
export const CreateAnamnesisSchema = z.object({
  // ── IDs ──
  clinica_id: z.string().uuid('UUID de clínica inválido'),
  paciente_id: z.string().uuid('UUID de paciente inválido'),

  // ── Datos del Paciente (para completar la tabla pacientes) ──
  correo: z.preprocess((val) => (val === '' ? null : val), z.string().email().optional().nullable()),
  fecha_nacimiento: z.string().optional().nullable(),
  codigoPostal: z.string().regex(/^\d{5}$/, 'El código postal debe tener 5 dígitos').optional().nullable(),
  estado: z.string().optional().nullable(),
  municipio: z.string().optional().nullable(),
  ciudad: z.string().optional().nullable(),
  colonia: z.string().optional().nullable(),
  calleYNumero: z.string().optional().nullable(),

  // ── Datos de Anamnesis ──
  profesion: z.string().max(150).optional().nullable(),
  contacto_emergencia_nombre: z.string().max(150).optional().nullable(),
  contacto_emergencia_telefono: z.string().max(20).optional().nullable(),
  como_nos_encontro: ComoNosEncontroEnum.optional().nullable(),

  // Medicamentos
  toma_medicamentos: z.boolean().default(false),
  lista_medicamentos: z.string().optional().nullable(),

  // Embarazo
  esta_embarazada: z.boolean().default(false),
  semana_embarazo: z.number().int().min(1).max(42).optional().nullable(),
  embarazo_alto_riesgo: z.boolean().default(false),
  embarazo_detalles: z.string().optional().nullable(),

  // Cirugías / Lesiones
  tuvo_cirugias_lesiones: z.boolean().default(false),
  lista_cirugias_lesiones: z.string().optional().nullable(),

  // Reflexología previa
  ha_recibido_reflexologia: z.boolean().default(false),

  // Motivo y objetivos
  motivo_consulta: z.string().optional().nullable(),
  objetivos_sesion: z.string().optional().nullable(),

  // Condiciones médicas (booleanos)
  condicion_cancer: z.boolean().default(false),
  condicion_dolor_cabeza: z.boolean().default(false),
  condicion_artritis: z.boolean().default(false),
  condicion_diabetes: z.boolean().default(false),
  condicion_presion_alterada: z.boolean().default(false),
  condicion_neuropatia: z.boolean().default(false),
  condicion_fibromialgia: z.boolean().default(false),
  condicion_infarto: z.boolean().default(false),
  condicion_enfermedad_renal: z.boolean().default(false),
  condicion_trombosis: z.boolean().default(false),
  condicion_entumecimiento: z.boolean().default(false),
  condicion_esguinces: z.boolean().default(false),
  condicion_explicacion: z.string().optional().nullable(),

  // Mapa corporal
  mapa_corporal_url: z.string().max(255).optional().nullable(),

  // Escalas 1-5
  escala_sueno: z.number().int().min(1).max(5).optional().nullable(),
  escala_energia: z.number().int().min(1).max(5).optional().nullable(),
  escala_estres: z.number().int().min(1).max(5).optional().nullable(),
  escala_nutricion: z.number().int().min(1).max(5).optional().nullable(),
  escala_ejercicio: z.number().int().min(1).max(5).optional().nullable(),

  // Términos y firma
  acepta_terminos: z.boolean().default(false),
  lugar_firma: z.string().max(150).optional().nullable(),
});

export type CreateAnamnesisDTO = z.infer<typeof CreateAnamnesisSchema>;

/**
 * Schema para actualización parcial (híbrido: paciente + anamnesis).
 */
export const UpdateAnamnesisSchema = CreateAnamnesisSchema.partial().omit({
  clinica_id: true,
  paciente_id: true,
});

export type UpdateAnamnesisDTO = z.infer<typeof UpdateAnamnesisSchema>;

// ────────────────────────────────────────────────────────────────────────────
// Row — representación directa de la fila SQL (snake_case)
// ────────────────────────────────────────────────────────────────────────────

export interface AnamnesisRow {
  // Campos de anamnesis_paciente
  id: string;
  clinica_id: string;
  paciente_id: string;
  podologo_verificador_id: string | null;
  fecha_verificacion: Date | null;
  profesion: string | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  como_nos_encontro: 'EVENTO' | 'INSTAGRAM' | 'INTERNET' | 'RECOMENDACION' | 'OTRO' | null;
  toma_medicamentos: number;
  lista_medicamentos: string | null;
  esta_embarazada: number;
  semana_embarazo: number | null;
  embarazo_alto_riesgo: number;
  embarazo_detalles: string | null;
  tuvo_cirugias_lesiones: number;
  lista_cirugias_lesiones: string | null;
  ha_recibido_reflexologia: number;
  motivo_consulta: string | null;
  objetivos_sesion: string | null;
  condicion_cancer: number;
  condicion_dolor_cabeza: number;
  condicion_artritis: number;
  condicion_diabetes: number;
  condicion_presion_alterada: number;
  condicion_neuropatia: number;
  condicion_fibromialgia: number;
  condicion_infarto: number;
  condicion_enfermedad_renal: number;
  condicion_trombosis: number;
  condicion_entumecimiento: number;
  condicion_esguinces: number;
  condicion_explicacion: string | null;
  mapa_corporal_url: string | null;
  escala_sueno: number | null;
  escala_energia: number | null;
  escala_estres: number | null;
  escala_nutricion: number | null;
  escala_ejercicio: number | null;
  acepta_terminos: number;
  lugar_firma: string | null;
  fecha_creacion: Date;
  fecha_actualizacion: Date;

  // Campos del paciente (JOIN)
  paciente_nombre: string;
  paciente_primer_apellido: string;
  paciente_segundo_apellido: string | null;
  paciente_telefono: string;
  paciente_correo: string | null;
  paciente_fecha_nacimiento: string | null;
  paciente_discapacidad: string | null;
  paciente_alergias: string | null;
  paciente_notas: string | null;

  // Dirección del paciente (JOIN)
  codigo_postal: string | null;
  estado: string | null;
  municipio: string | null;
  ciudad: string | null;
  colonia: string | null;
  calle_y_numero: string | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Entity — representación de dominio (camelCase, combinada)
// ────────────────────────────────────────────────────────────────────────────

export interface AnamnesisEntity {
  id: string;
  clinicaId: string;
  pacienteId: string;

  // Datos del paciente fusionados
  paciente: {
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
    direccion: DireccionFields;
  };

  // Datos de anamnesis
  podologoVerificadorId: string | null;
  fechaVerificacion: Date | null;
  profesion: string | null;
  contactoEmergenciaNombre: string | null;
  contactoEmergenciaTelefono: string | null;
  comoNosEncontro: 'EVENTO' | 'INSTAGRAM' | 'INTERNET' | 'RECOMENDACION' | 'OTRO' | null;
  tomaMedicamentos: boolean;
  listaMedicamentos: string | null;
  estaEmbarazada: boolean;
  semanaEmbarazo: number | null;
  embarazoAltoRiesgo: boolean;
  embarazoDetalles: string | null;
  tuvoCirugiasLesiones: boolean;
  listaCirugiasLesiones: string | null;
  haRecibidoReflexologia: boolean;
  motivoConsulta: string | null;
  objetivosSesion: string | null;
  condicionCancer: boolean;
  condicionDolorCabeza: boolean;
  condicionArtritis: boolean;
  condicionDiabetes: boolean;
  condicionPresionAlterada: boolean;
  condicionNeuropatia: boolean;
  condicionFibromialgia: boolean;
  condicionInfarto: boolean;
  condicionEnfermedadRenal: boolean;
  condicionTrombosis: boolean;
  condicionEntumecimiento: boolean;
  condicionEsguinces: boolean;
  condicionExplicacion: string | null;
  mapaCorporalUrl: string | null;
  escalaSueno: number | null;
  escalaEnergia: number | null;
  escalaEstres: number | null;
  escalaNutricion: number | null;
  escalaEjercicio: number | null;
  aceptaTerminos: boolean;
  lugarFirma: string | null;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// ────────────────────────────────────────────────────────────────────────────
// Mapper
// ────────────────────────────────────────────────────────────────────────────

export const mapAnamnesisRowToEntity = (row: AnamnesisRow): AnamnesisEntity => ({
  id: row.id,
  clinicaId: row.clinica_id,
  pacienteId: row.paciente_id,

  paciente: {
    nombre: row.paciente_nombre,
    primerApellido: row.paciente_primer_apellido,
    segundoApellido: row.paciente_segundo_apellido,
    nombreCompleto: buildNombreCompleto(
      row.paciente_nombre,
      row.paciente_primer_apellido,
      row.paciente_segundo_apellido
    ),
    telefono: row.paciente_telefono,
    correo: row.paciente_correo,
    fechaNacimiento: row.paciente_fecha_nacimiento
      ? new Date(row.paciente_fecha_nacimiento).toISOString().substring(0, 10)
      : null,
    discapacidad: row.paciente_discapacidad,
    alergias: row.paciente_alergias,
    notas: row.paciente_notas,
    direccion: mapDireccionRowToFields(row),
  },

  podologoVerificadorId: row.podologo_verificador_id,
  fechaVerificacion: row.fecha_verificacion,
  profesion: row.profesion,
  contactoEmergenciaNombre: row.contacto_emergencia_nombre,
  contactoEmergenciaTelefono: row.contacto_emergencia_telefono,
  comoNosEncontro: row.como_nos_encontro,
  tomaMedicamentos: row.toma_medicamentos === 1,
  listaMedicamentos: row.lista_medicamentos,
  estaEmbarazada: row.esta_embarazada === 1,
  semanaEmbarazo: row.semana_embarazo,
  embarazoAltoRiesgo: row.embarazo_alto_riesgo === 1,
  embarazoDetalles: row.embarazo_detalles,
  tuvoCirugiasLesiones: row.tuvo_cirugias_lesiones === 1,
  listaCirugiasLesiones: row.lista_cirugias_lesiones,
  haRecibidoReflexologia: row.ha_recibido_reflexologia === 1,
  motivoConsulta: row.motivo_consulta,
  objetivosSesion: row.objetivos_sesion,
  condicionCancer: row.condicion_cancer === 1,
  condicionDolorCabeza: row.condicion_dolor_cabeza === 1,
  condicionArtritis: row.condicion_artritis === 1,
  condicionDiabetes: row.condicion_diabetes === 1,
  condicionPresionAlterada: row.condicion_presion_alterada === 1,
  condicionNeuropatia: row.condicion_neuropatia === 1,
  condicionFibromialgia: row.condicion_fibromialgia === 1,
  condicionInfarto: row.condicion_infarto === 1,
  condicionEnfermedadRenal: row.condicion_enfermedad_renal === 1,
  condicionTrombosis: row.condicion_trombosis === 1,
  condicionEntumecimiento: row.condicion_entumecimiento === 1,
  condicionEsguinces: row.condicion_esguinces === 1,
  condicionExplicacion: row.condicion_explicacion,
  mapaCorporalUrl: row.mapa_corporal_url,
  escalaSueno: row.escala_sueno,
  escalaEnergia: row.escala_energia,
  escalaEstres: row.escala_estres,
  escalaNutricion: row.escala_nutricion,
  escalaEjercicio: row.escala_ejercicio,
  aceptaTerminos: row.acepta_terminos === 1,
  lugarFirma: row.lugar_firma,
  fechaCreacion: row.fecha_creacion,
  fechaActualizacion: row.fecha_actualizacion,
});