import crypto from 'crypto';
import { pool } from '../../config/database.js';
import { AnamnesisRepository } from '../../repositories/anamnesis/anamnesis.repository.js';
import { PacienteRepository } from '../../repositories/paciente/paciente.repository.js';
import { NotFoundError, ConflictError } from '../../common/errors/domain.errors.js';
import {
  mapAnamnesisRowToEntity,
  type CreateAnamnesisDTO,
  type UpdateAnamnesisDTO,
  type AnamnesisEntity
} from '../../domain/anamnesis/anamnesis.domain.js';

export class AnamnesisService {
  private anamnesisRepository = new AnamnesisRepository();
  private pacienteRepository = new PacienteRepository();

  // ── GET — Datos combinados paciente + anamnesis ──

  async getByPaciente(pacienteId: string): Promise<AnamnesisEntity> {
    const paciente = await this.pacienteRepository.findById(pacienteId);
    if (!paciente) throw new NotFoundError('Paciente');

    const row = await this.anamnesisRepository.findByPacienteId(pacienteId);
    if (!row) throw new NotFoundError('Anamnesis');

    return mapAnamnesisRowToEntity(row);
  }

  // ── CREATE — Transacción: UPDATE paciente + INSERT anamnesis ──

  async create(data: CreateAnamnesisDTO): Promise<AnamnesisEntity> {
    // 1. Validar que el paciente existe
    const paciente = await this.pacienteRepository.findById(data.paciente_id);
    if (!paciente) throw new NotFoundError('Paciente');

    // 2. Verificar que no exista ya una anamnesis para este paciente (UNIQUE KEY)
    const existente = await this.anamnesisRepository.findByPacienteId(data.paciente_id);
    if (existente) {
      throw new ConflictError('Este paciente ya tiene una anamnesis registrada');
    }

    // 3. Ejecutar transacción
    const connection = await pool.getConnection();
    const newId = crypto.randomUUID();

    try {
      await connection.beginTransaction();

      // 3a. Actualizar datos del paciente (Paso 2 del registro)
      await this.anamnesisRepository.updatePacienteWithTransaction(connection, data.paciente_id, {
        correo: data.correo ?? null,
        fecha_nacimiento: data.fecha_nacimiento ?? null,
        codigo_postal: data.codigoPostal ?? null,
        estado: data.estado ?? null,
        municipio: data.municipio ?? null,
        ciudad: data.ciudad ?? null,
        colonia: data.colonia ?? null,
        calle_y_numero: data.calleYNumero ?? null,
      });

      // 3b. Insertar anamnesis
      await this.anamnesisRepository.createWithTransaction(connection, newId, {
        clinica_id: data.clinica_id,
        paciente_id: data.paciente_id,
        profesion: data.profesion ?? null,
        contacto_emergencia_nombre: data.contacto_emergencia_nombre ?? null,
        contacto_emergencia_telefono: data.contacto_emergencia_telefono ?? null,
        como_nos_encontro: data.como_nos_encontro ?? null,
        toma_medicamentos: data.toma_medicamentos,
        lista_medicamentos: data.lista_medicamentos ?? null,
        esta_embarazada: data.esta_embarazada,
        semana_embarazo: data.semana_embarazo ?? null,
        embarazo_alto_riesgo: data.embarazo_alto_riesgo,
        embarazo_detalles: data.embarazo_detalles ?? null,
        tuvo_cirugias_lesiones: data.tuvo_cirugias_lesiones,
        lista_cirugias_lesiones: data.lista_cirugias_lesiones ?? null,
        ha_recibido_reflexologia: data.ha_recibido_reflexologia,
        motivo_consulta: data.motivo_consulta ?? null,
        objetivos_sesion: data.objetivos_sesion ?? null,
        condicion_cancer: data.condicion_cancer,
        condicion_dolor_cabeza: data.condicion_dolor_cabeza,
        condicion_artritis: data.condicion_artritis,
        condicion_diabetes: data.condicion_diabetes,
        condicion_presion_alterada: data.condicion_presion_alterada,
        condicion_neuropatia: data.condicion_neuropatia,
        condicion_fibromialgia: data.condicion_fibromialgia,
        condicion_infarto: data.condicion_infarto,
        condicion_enfermedad_renal: data.condicion_enfermedad_renal,
        condicion_trombosis: data.condicion_trombosis,
        condicion_entumecimiento: data.condicion_entumecimiento,
        condicion_esguinces: data.condicion_esguinces,
        condicion_explicacion: data.condicion_explicacion ?? null,
        mapa_corporal_url: data.mapa_corporal_url ?? null,
        escala_sueno: data.escala_sueno ?? null,
        escala_energia: data.escala_energia ?? null,
        escala_estres: data.escala_estres ?? null,
        escala_nutricion: data.escala_nutricion ?? null,
        escala_ejercicio: data.escala_ejercicio ?? null,
        acepta_terminos: data.acepta_terminos,
        lugar_firma: data.lugar_firma ?? null,
      });

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    // 4. Devolver la entidad combinada recién creada
    const row = await this.anamnesisRepository.findById(newId);
    return mapAnamnesisRowToEntity(row!);
  }

  // ── UPDATE — Transacción: UPDATE paciente + UPDATE anamnesis ──

  async update(id: string, data: UpdateAnamnesisDTO): Promise<AnamnesisEntity> {
    // 1. Verificar que la anamnesis existe
    const existing = await this.anamnesisRepository.findById(id);
    if (!existing) throw new NotFoundError('Anamnesis');

    // 2. Ejecutar transacción
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 2a. Actualizar datos del paciente si vienen en el payload
      const pacienteData: Record<string, any> = {};
      if (data.correo !== undefined)         pacienteData.correo = data.correo ?? null;
      if (data.fecha_nacimiento !== undefined) pacienteData.fecha_nacimiento = data.fecha_nacimiento ?? null;
      if (data.codigoPostal !== undefined)   pacienteData.codigo_postal = data.codigoPostal ?? null;
      if (data.estado !== undefined)         pacienteData.estado = data.estado ?? null;
      if (data.municipio !== undefined)      pacienteData.municipio = data.municipio ?? null;
      if (data.ciudad !== undefined)         pacienteData.ciudad = data.ciudad ?? null;
      if (data.colonia !== undefined)        pacienteData.colonia = data.colonia ?? null;
      if (data.calleYNumero !== undefined)   pacienteData.calle_y_numero = data.calleYNumero ?? null;

      if (Object.keys(pacienteData).length > 0) {
        await this.anamnesisRepository.updatePacienteWithTransaction(
          connection, existing.paciente_id, pacienteData
        );
      }

      // 2b. Actualizar datos de anamnesis
      const anamnesisData: Record<string, any> = {};
      const anamnesisFields = [
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
      ] as const;

      for (const field of anamnesisFields) {
        if ((data as any)[field] !== undefined) {
          anamnesisData[field] = (data as any)[field];
        }
      }

      if (Object.keys(anamnesisData).length > 0) {
        await this.anamnesisRepository.updateWithTransaction(connection, id, anamnesisData);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    // 3. Devolver la entidad actualizada
    const row = await this.anamnesisRepository.findById(id);
    return mapAnamnesisRowToEntity(row!);
  }
}
