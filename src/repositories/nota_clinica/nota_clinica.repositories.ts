import { pool } from '../../config/database.js';
import type { NotaClinicaRow } from '../../domain/nota_clinica/nota_clinica.domain.js';

export class NotaClinicaRepository {
  
  // Base query para enriquecer las notas
  private selectQuery = `
    SELECT 
      nc.*,
      cl.nombre AS clinica_nombre,
      p.nombre AS paciente_nombre, p.primer_apellido AS paciente_primer_apellido, p.segundo_apellido AS paciente_segundo_apellido,
      u.nombre AS podologo_nombre, u.primer_apellido AS podologo_primer_apellido, u.segundo_apellido AS podologo_segundo_apellido,
      c.fecha_programada AS cita_fecha_programada,
      s.nombre AS servicio_nombre
    FROM notas_clinicas nc
    INNER JOIN clinicas cl ON nc.clinica_id = cl.id
    INNER JOIN pacientes p ON nc.paciente_id = p.id
    INNER JOIN usuarios u ON nc.podologo_id = u.id
    LEFT JOIN citas c ON nc.cita_id = c.id
    LEFT JOIN servicios s ON c.servicio_id = s.id
  `;

  // REGLA DE NEGOCIO: Obtener el historial completo de un paciente
  async findByPacienteId(pacienteId: string): Promise<NotaClinicaRow[]> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} 
       WHERE nc.paciente_id = ? 
       ORDER BY nc.fecha_nota DESC, nc.fecha_creacion DESC`,
      [pacienteId]
    );
    return rows;
  }

  async findById(id: string): Promise<NotaClinicaRow | null> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} WHERE nc.id = ? LIMIT 1`,
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