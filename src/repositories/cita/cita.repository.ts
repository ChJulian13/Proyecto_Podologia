import { pool } from '../../config/database.js';
import type { CitaRow, EstadoCita } from '../../domain/cita/cita.domain.js';
import type { PoolConnection } from 'mysql2/promise';

export class CitaRepository {

  private selectQuery = `
    SELECT 
      c.*,
      p.nombre AS paciente_nombre, p.primer_apellido AS paciente_primer_apellido, p.segundo_apellido AS paciente_segundo_apellido,
      s.nombre AS servicio_nombre,
      u.nombre AS podologo_nombre, u.primer_apellido AS podologo_primer_apellido, u.segundo_apellido AS podologo_segundo_apellido
    FROM citas c
    INNER JOIN pacientes p ON c.paciente_id = p.id
    INNER JOIN usuarios u ON c.podologo_id = u.id
    LEFT JOIN servicios s ON c.servicio_id = s.id
  `;

  async findAllByClinica(clinicaId: string): Promise<CitaRow[]> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} 
       WHERE c.clinica_id = ? 
       ORDER BY c.fecha_programada DESC, c.hora_programada DESC`,
      [clinicaId]
    );
    return rows;
  }

  async findById(id: string): Promise<CitaRow | null> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} WHERE c.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  // Buscar choques de horario (Evalúa superposición de intervalos de tiempo)
  async findConflict(
    podologoId: string,
    fecha: string,
    hora: string,
    duracionMinutos: number,
    ignorarCitaId?: string
  ): Promise<CitaRow | null> {

    let query = `
      SELECT * FROM citas 
      WHERE podologo_id = ? 
        AND fecha_programada = ? 
        AND estado IN ('PROGRAMADA', 'CONFIRMADA')
        /* La hora de inicio en BD debe ser menor a la hora de FIN de la nueva cita */
        AND hora_programada < (CAST(? AS TIME) + INTERVAL ? MINUTE)
        /* La hora de FIN en BD debe ser mayor a la hora de INICIO de la nueva cita */
        AND (hora_programada + INTERVAL duracion_minutos MINUTE) > CAST(? AS TIME)
    `;

    // Pasamos la hora dos veces y los minutos para calcular los intervalos
    const params: any[] = [podologoId, fecha, hora, duracionMinutos, hora];

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

  async createWithTransaction(
    connection: PoolConnection,
    id: string,
    clinicaId: string,
    pacienteId: string,
    podologoId: string,
    servicioId: string | null,
    fechaProgramada: string,
    horaProgramada: string,
    duracionMinutos: number,
    notas: string | null
  ): Promise<void> {
    await connection.execute(
      `INSERT INTO citas 
      (id, clinica_id, paciente_id, podologo_id, servicio_id, fecha_programada, hora_programada, duracion_minutos, notas) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, clinicaId, pacienteId, podologoId, servicioId, fechaProgramada, horaProgramada, duracionMinutos, notas]
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

  // Obtener citas del día actual, con filtro opcional por podólogo
  async findToday(clinicaId: string, podologoId?: string): Promise<CitaRow[]> {
    // Usamos this.selectQuery para traer los nombres del paciente, podólogo y servicio
    let query = `
      ${this.selectQuery} 
      WHERE c.clinica_id = ? 
      AND c.fecha_programada = CURDATE()
    `;
    const params: any[] = [clinicaId];

    // Si pasamos el ID del podólogo, añadimos la condición a la consulta
    if (podologoId) {
      query += ` AND c.podologo_id = ?`;
      params.push(podologoId);
    }

    // Ordenamos por hora para que salgan en orden cronológico durante el día
    query += ` ORDER BY c.hora_programada ASC`;

    const [rows] = await pool.execute<any[]>(query, params);
    return rows;
  }
}