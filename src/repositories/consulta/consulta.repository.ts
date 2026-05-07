import { pool } from '../../config/database.js';
import type { PoolConnection } from 'mysql2/promise';
import type {
  ConsultaRow,
  ConsultaRecetaRow,
  CreateConsultaDTO,
  CreateConsultaRecetaDTO,
  UpdateConsultaDTO,
} from '../../domain/consulta/consulta.domain.js';

export class ConsultaRepository {

  // ────────────────────────────────────────────────────────────────────────────
  // SELECT helpers
  // ────────────────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<ConsultaRow | null> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM consultas WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async findRecetasByConsultaId(consultaId: string): Promise<ConsultaRecetaRow[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM consulta_recetas WHERE consulta_id = ?`,
      [consultaId]
    );
    return rows as ConsultaRecetaRow[];
  }

  async findByCitaId(citaId: string): Promise<ConsultaRow | null> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM consultas WHERE cita_id = ? LIMIT 1`,
      [citaId]
    );
    return rows[0] ?? null;
  }

  async findByPacienteId(pacienteId: string): Promise<ConsultaRow[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM consultas WHERE paciente_id = ? ORDER BY fecha_registro DESC`,
      [pacienteId]
    );
    return rows as ConsultaRow[];
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Transactional CREATE  (consulta + recetas en una sola transacción)
  // ────────────────────────────────────────────────────────────────────────────

  async createWithTransaction(
    data: CreateConsultaDTO,
    newId: string
  ): Promise<void> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Insertar consulta principal
      await this._insertConsulta(connection, newId, data);

      // 2. Insertar cada receta (si las hay)
      if (data.recetas && data.recetas.length > 0) {
        for (const receta of data.recetas) {
          const recetaId = crypto.randomUUID();
          await this._insertReceta(connection, recetaId, newId, receta);
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private async _insertConsulta(
    connection: PoolConnection,
    id: string,
    data: CreateConsultaDTO
  ): Promise<void> {
    await connection.execute(
      `INSERT INTO consultas (
        id, cita_id, paciente_id, podologo_id, servicio_id,
        diagnostico, procedimiento_detallado, indicaciones_cuidado,
        fecha_proxima_consulta,
        requiere_consentimiento, consentimiento_firmado,
        monto_procedimiento
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?,
        ?, ?,
        ?
      )`,
      [
        id,
        data.cita_id,
        data.paciente_id,
        data.podologo_id,
        data.servicio_id ?? null,
        data.diagnostico ?? null,
        data.procedimiento_detallado ?? null,
        data.indicaciones_cuidado ?? null,
        data.fecha_proxima_consulta ?? null,
        data.requiere_consentimiento ? 1 : 0,
        data.consentimiento_firmado ? 1 : 0,
        data.monto_procedimiento ?? null,
      ]
    );
  }

  private async _insertReceta(
    connection: PoolConnection,
    recetaId: string,
    consultaId: string,
    receta: CreateConsultaRecetaDTO
  ): Promise<void> {
    await connection.execute(
      `INSERT INTO consulta_recetas (
        id, consulta_id, producto_id, cantidad, precio_unitario_venta, indicaciones_uso
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        recetaId,
        consultaId,
        receta.producto_id,
        receta.cantidad,
        receta.precio_unitario_venta,
        receta.indicaciones_uso ?? null,
      ]
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // UPDATE parcial de consulta (sin tocar FKs principales)
  // ────────────────────────────────────────────────────────────────────────────

  async update(id: string, data: UpdateConsultaDTO): Promise<void> {
    const allowedFields: (keyof UpdateConsultaDTO)[] = [
      'diagnostico',
      'procedimiento_detallado',
      'indicaciones_cuidado',
      'fecha_proxima_consulta',
      'requiere_consentimiento',
      'consentimiento_firmado',
      'monto_procedimiento',
    ];

    const booleanFields = new Set<string>(['requiere_consentimiento', 'consentimiento_firmado']);

    const fields: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        const val = data[field];
        values.push(booleanFields.has(field) ? (val ? 1 : 0) : (val ?? null));
      }
    }

    if (fields.length === 0) return;

    values.push(id);
    await pool.execute(
      `UPDATE consultas SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Gestión de recetas individuales (sub-recursos)
  // ────────────────────────────────────────────────────────────────────────────

  async addReceta(
    consultaId: string,
    recetaId: string,
    receta: CreateConsultaRecetaDTO
  ): Promise<void> {
    await pool.execute(
      `INSERT INTO consulta_recetas (
        id, consulta_id, producto_id, cantidad, precio_unitario_venta, indicaciones_uso
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        recetaId,
        consultaId,
        receta.producto_id,
        receta.cantidad,
        receta.precio_unitario_venta,
        receta.indicaciones_uso ?? null,
      ]
    );
  }

  async findRecetaById(recetaId: string): Promise<ConsultaRecetaRow | null> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM consulta_recetas WHERE id = ? LIMIT 1`,
      [recetaId]
    );
    return rows[0] ?? null;
  }

  async deleteReceta(recetaId: string): Promise<void> {
    await pool.execute(
      `DELETE FROM consulta_recetas WHERE id = ?`,
      [recetaId]
    );
  }
}
