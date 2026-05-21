import { pool } from '../../config/database.js';
import type { ConsentimientoRow, EstadoFirmaType } from '../../domain/consentimiento/consentimiento.domain.js';

export class ConsentimientoRepository {
  async findById(id: string): Promise<ConsentimientoRow | null> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM consentimientos_informados WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async findByPacienteId(pacienteId: string): Promise<ConsentimientoRow[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM consentimientos_informados WHERE paciente_id = ? ORDER BY fecha_creacion DESC`,
      [pacienteId]
    );
    return rows;
  }

  async create(
    id: string, clinicaId: string, pacienteId: string, consultaId: string | null,
    tipoDocumento: string, estadoFirma: EstadoFirmaType, urlDocumento: string | null
  ): Promise<void> {
    await pool.execute(
      `INSERT INTO consentimientos_informados 
       (id, clinica_id, paciente_id, consulta_id, tipo_documento, estado_firma, url_documento) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, clinicaId, pacienteId, consultaId, tipoDocumento, estadoFirma, urlDocumento]
    );
  }

  async update(
    id: string, estadoFirma: EstadoFirmaType, urlDocumento: string | null,
    fechaFirma: Date | null, ipFirma: string | null
  ): Promise<void> {
    await pool.execute(
      `UPDATE consentimientos_informados 
       SET estado_firma = ?, url_documento = ?, fecha_firma = ?, ip_firma = ? 
       WHERE id = ?`,
      [estadoFirma, urlDocumento, fechaFirma, ipFirma, id]
    );
  }
}
