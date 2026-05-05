import { pool } from '../../config/database.js';
import type { PoolConnection } from 'mysql2/promise';
import type { AnamnesisRow } from '../../domain/anamnesis/anamnesis.domain.js';

export class AnamnesisRepository {

  /**
   * Query base que une anamnesis_paciente con pacientes para devolver
   * el payload combinado (datos médicos + datos del paciente).
   */
  private selectQuery = `
    SELECT 
      a.*,
      p.nombre          AS paciente_nombre,
      p.primer_apellido AS paciente_primer_apellido,
      p.segundo_apellido AS paciente_segundo_apellido,
      p.telefono        AS paciente_telefono,
      p.correo          AS paciente_correo,
      p.fecha_nacimiento AS paciente_fecha_nacimiento,
      p.discapacidad    AS paciente_discapacidad,
      p.alergias        AS paciente_alergias,
      p.notas           AS paciente_notas,
      p.codigo_postal,
      p.estado,
      p.municipio,
      p.ciudad,
      p.colonia,
      p.calle_y_numero
    FROM anamnesis_paciente a
    INNER JOIN pacientes p ON a.paciente_id = p.id
  `;

  // ── Queries de lectura ──

  async findByPacienteId(pacienteId: string): Promise<AnamnesisRow | null> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} WHERE a.paciente_id = ? LIMIT 1`,
      [pacienteId]
    );
    return rows[0] ?? null;
  }

  async findById(id: string): Promise<AnamnesisRow | null> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} WHERE a.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  // ── Queries transaccionales (CREATE) ──

  async updatePacienteWithTransaction(
    connection: PoolConnection,
    pacienteId: string,
    data: {
      correo?: string | null;
      fecha_nacimiento?: string | null;
      codigo_postal?: string | null;
      estado?: string | null;
      municipio?: string | null;
      ciudad?: string | null;
      colonia?: string | null;
      calle_y_numero?: string | null;
    }
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.correo !== undefined)           { fields.push('correo = ?');           values.push(data.correo); }
    if (data.fecha_nacimiento !== undefined)  { fields.push('fecha_nacimiento = ?'); values.push(data.fecha_nacimiento); }
    if (data.codigo_postal !== undefined)     { fields.push('codigo_postal = ?');    values.push(data.codigo_postal); }
    if (data.estado !== undefined)            { fields.push('estado = ?');           values.push(data.estado); }
    if (data.municipio !== undefined)         { fields.push('municipio = ?');        values.push(data.municipio); }
    if (data.ciudad !== undefined)            { fields.push('ciudad = ?');           values.push(data.ciudad); }
    if (data.colonia !== undefined)           { fields.push('colonia = ?');          values.push(data.colonia); }
    if (data.calle_y_numero !== undefined)    { fields.push('calle_y_numero = ?');   values.push(data.calle_y_numero); }

    if (fields.length === 0) return;

    values.push(pacienteId);
    await connection.execute(
      `UPDATE pacientes SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async createWithTransaction(
    connection: PoolConnection,
    id: string,
    data: {
      clinica_id: string;
      paciente_id: string;
      profesion?: string | null;
      contacto_emergencia_nombre?: string | null;
      contacto_emergencia_telefono?: string | null;
      como_nos_encontro?: string | null;
      toma_medicamentos: boolean;
      lista_medicamentos?: string | null;
      esta_embarazada: boolean;
      semana_embarazo?: number | null;
      embarazo_alto_riesgo: boolean;
      embarazo_detalles?: string | null;
      tuvo_cirugias_lesiones: boolean;
      lista_cirugias_lesiones?: string | null;
      ha_recibido_reflexologia: boolean;
      motivo_consulta?: string | null;
      objetivos_sesion?: string | null;
      condicion_cancer: boolean;
      condicion_dolor_cabeza: boolean;
      condicion_artritis: boolean;
      condicion_diabetes: boolean;
      condicion_presion_alterada: boolean;
      condicion_neuropatia: boolean;
      condicion_fibromialgia: boolean;
      condicion_infarto: boolean;
      condicion_enfermedad_renal: boolean;
      condicion_trombosis: boolean;
      condicion_entumecimiento: boolean;
      condicion_esguinces: boolean;
      condicion_explicacion?: string | null;
      mapa_corporal_url?: string | null;
      escala_sueno?: number | null;
      escala_energia?: number | null;
      escala_estres?: number | null;
      escala_nutricion?: number | null;
      escala_ejercicio?: number | null;
      acepta_terminos: boolean;
      lugar_firma?: string | null;
    }
  ): Promise<void> {
    await connection.execute(
      `INSERT INTO anamnesis_paciente (
        id, clinica_id, paciente_id, profesion,
        contacto_emergencia_nombre, contacto_emergencia_telefono,
        como_nos_encontro, toma_medicamentos, lista_medicamentos,
        esta_embarazada, semana_embarazo, embarazo_alto_riesgo, embarazo_detalles,
        tuvo_cirugias_lesiones, lista_cirugias_lesiones,
        ha_recibido_reflexologia, motivo_consulta, objetivos_sesion,
        condicion_cancer, condicion_dolor_cabeza, condicion_artritis,
        condicion_diabetes, condicion_presion_alterada, condicion_neuropatia,
        condicion_fibromialgia, condicion_infarto, condicion_enfermedad_renal,
        condicion_trombosis, condicion_entumecimiento, condicion_esguinces,
        condicion_explicacion, mapa_corporal_url,
        escala_sueno, escala_energia, escala_estres, escala_nutricion, escala_ejercicio,
        acepta_terminos, lugar_firma
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?
      )`,
      [
        id, data.clinica_id, data.paciente_id, data.profesion ?? null,
        data.contacto_emergencia_nombre ?? null, data.contacto_emergencia_telefono ?? null,
        data.como_nos_encontro ?? null, data.toma_medicamentos ? 1 : 0, data.lista_medicamentos ?? null,
        data.esta_embarazada ? 1 : 0, data.semana_embarazo ?? null, data.embarazo_alto_riesgo ? 1 : 0, data.embarazo_detalles ?? null,
        data.tuvo_cirugias_lesiones ? 1 : 0, data.lista_cirugias_lesiones ?? null,
        data.ha_recibido_reflexologia ? 1 : 0, data.motivo_consulta ?? null, data.objetivos_sesion ?? null,
        data.condicion_cancer ? 1 : 0, data.condicion_dolor_cabeza ? 1 : 0, data.condicion_artritis ? 1 : 0,
        data.condicion_diabetes ? 1 : 0, data.condicion_presion_alterada ? 1 : 0, data.condicion_neuropatia ? 1 : 0,
        data.condicion_fibromialgia ? 1 : 0, data.condicion_infarto ? 1 : 0, data.condicion_enfermedad_renal ? 1 : 0,
        data.condicion_trombosis ? 1 : 0, data.condicion_entumecimiento ? 1 : 0, data.condicion_esguinces ? 1 : 0,
        data.condicion_explicacion ?? null, data.mapa_corporal_url ?? null,
        data.escala_sueno ?? null, data.escala_energia ?? null, data.escala_estres ?? null,
        data.escala_nutricion ?? null, data.escala_ejercicio ?? null,
        data.acepta_terminos ? 1 : 0, data.lugar_firma ?? null
      ] as any[]
    );
  }

  // ── Query transaccional (UPDATE) ──

  async updateWithTransaction(
    connection: PoolConnection,
    id: string,
    data: Record<string, any>
  ): Promise<void> {
    const allowedFields = [
      'profesion', 'contacto_emergencia_nombre', 'contacto_emergencia_telefono',
      'como_nos_encontro', 'toma_medicamentos', 'lista_medicamentos',
      'esta_embarazada', 'semana_embarazo', 'embarazo_alto_riesgo', 'embarazo_detalles',
      'tuvo_cirugias_lesiones', 'lista_cirugias_lesiones',
      'ha_recibido_reflexologia', 'motivo_consulta', 'objetivos_sesion',
      'condicion_cancer', 'condicion_dolor_cabeza', 'condicion_artritis',
      'condicion_diabetes', 'condicion_presion_alterada', 'condicion_neuropatia',
      'condicion_fibromialgia', 'condicion_infarto', 'condicion_enfermedad_renal',
      'condicion_trombosis', 'condicion_entumecimiento', 'condicion_esguinces',
      'condicion_explicacion', 'mapa_corporal_url',
      'escala_sueno', 'escala_energia', 'escala_estres', 'escala_nutricion', 'escala_ejercicio',
      'acepta_terminos', 'lugar_firma'
    ];

    // Campos booleanos que deben convertirse a 0/1
    const booleanFields = new Set([
      'toma_medicamentos', 'esta_embarazada', 'embarazo_alto_riesgo',
      'tuvo_cirugias_lesiones', 'ha_recibido_reflexologia',
      'condicion_cancer', 'condicion_dolor_cabeza', 'condicion_artritis',
      'condicion_diabetes', 'condicion_presion_alterada', 'condicion_neuropatia',
      'condicion_fibromialgia', 'condicion_infarto', 'condicion_enfermedad_renal',
      'condicion_trombosis', 'condicion_entumecimiento', 'condicion_esguinces',
      'acepta_terminos'
    ]);

    const fields: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(booleanFields.has(field) ? (data[field] ? 1 : 0) : (data[field] ?? null));
      }
    }

    if (fields.length === 0) return;

    values.push(id);
    await connection.execute(
      `UPDATE anamnesis_paciente SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }
}
