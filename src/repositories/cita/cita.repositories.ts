import { pool } from '../../config/database.js';
import type { CitaRow, EstadoCita } from '../../domain/cita/cita.domain.js';

export class CitaRepository {
  
  async findAllByClinica(clinicaId: string): Promise<CitaRow[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM citas 
       WHERE clinica_id = ? 
       ORDER BY fecha_programada DESC, hora_programada DESC`,
      [clinicaId]
    );
    return rows;
  }

  async findById(id: string): Promise<CitaRow | null> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM citas WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] ?? null;
  }

  // Buscar choques de horario
  async findConflict(podologoId: string, fecha: string, hora: string, ignorarCitaId?: string): Promise<CitaRow | null> {
    let query = `
      SELECT * FROM citas 
      WHERE podologo_id = ? 
        AND fecha_programada = ? 
        AND hora_programada = ? 
        AND estado IN ('PROGRAMADA', 'CONFIRMADA')
    `;
    const params: any[] = [podologoId, fecha, hora];

    // Si estamos actualizando una cita, ignoramos su propio ID para que no marque conflicto consigo misma
    if (ignorarCitaId) {
      query += ` AND id != ?`;
      params.push(ignorarCitaId);
    }

    const [rows] = await pool.execute<any[]>(query, params);
    return rows[0] ?? null;
  }

  async create(
    id: string, clinicaId: string, pacienteId: string, podologoId: string, 
    servicioId: string | null, fecha: string, hora: string, 
    duracion: number, notas: string | null
  ): Promise<void> {
    await pool.execute(
      `INSERT INTO citas 
       (id, clinica_id, paciente_id, podologo_id, servicio_id, fecha_programada, hora_programada, duracion_minutos, notas) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, clinicaId, pacienteId, podologoId, servicioId, fecha, hora, duracion, notas]
    );
  }

  async update(
    id: string, pacienteId: string, podologoId: string, servicioId: string | null, 
    fecha: string, hora: string, duracion: number, estado: EstadoCita, notas: string | null
  ): Promise<void> {
    await pool.execute(
      `UPDATE citas 
       SET paciente_id = ?, podologo_id = ?, servicio_id = ?, fecha_programada = ?, 
           hora_programada = ?, duracion_minutos = ?, estado = ?, notas = ? 
       WHERE id = ?`,
      [pacienteId, podologoId, servicioId, fecha, hora, duracion, estado, notas, id]
    );
  }

  // En lugar de borrar, cambiamos el estado
  async cancelar(id: string): Promise<void> {
    await pool.execute(
      `UPDATE citas SET estado = 'CANCELADA' WHERE id = ?`,
      [id]
    );
  }
}