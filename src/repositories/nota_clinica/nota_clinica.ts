import { pool } from '../../config/database.js';
import type { NotaClinicaRow } from '../../domain/nota_clinica/nota_clinica.domain.js';

export class NotaClinicaRepository {
  
  // REGLA DE NEGOCIO: Obtener el historial completo de un paciente
  async findByPacienteId(pacienteId: string): Promise<NotaClinicaRow[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM notas_clinicas 
       WHERE paciente_id = ? 
       ORDER BY fecha_nota DESC, fecha_creacion DESC`,
      [pacienteId]
    );
    return rows;
  }

  async findById(id: string): Promise<NotaClinicaRow | null> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM notas_clinicas WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] ?? null;
  }

  async create(
    id: string, clinicaId: string, pacienteId: string, citaId: string | null,
    podologoId: string, fechaNota: string | null, notas: string | null,
    diagnostico: string | null, tratamiento: string | null
  ): Promise<void> {
    
    // Si el frontend envía la fecha, la insertamos. Si no, dejamos que MySQL use CURDATE()
    const query = fechaNota
      ? `INSERT INTO notas_clinicas (id, clinica_id, paciente_id, cita_id, podologo_id, fecha_nota, notas, diagnostico, tratamiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      : `INSERT INTO notas_clinicas (id, clinica_id, paciente_id, cita_id, podologo_id, notas, diagnostico, tratamiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = fechaNota
      ? [id, clinicaId, pacienteId, citaId, podologoId, fechaNota, notas, diagnostico, tratamiento]
      : [id, clinicaId, pacienteId, citaId, podologoId, notas, diagnostico, tratamiento];

    await pool.execute(query, params);
  }

  async update(
    id: string, notas: string | null, diagnostico: string | null, tratamiento: string | null
  ): Promise<void> {
    await pool.execute(
      `UPDATE notas_clinicas 
       SET notas = ?, diagnostico = ?, tratamiento = ? 
       WHERE id = ?`,
      [notas, diagnostico, tratamiento, id]
    );
  }
}