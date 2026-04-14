import { pool } from '../../config/database.js';
import type { CitaProximaRow, ResumenHoyRow, AlertaNotaRow } from '../../domain/dashboard/dashboard.damain.js';

export class DashboardRepository {
  
  async getResumenHoy(clinicaId: string, usuarioId: string, rol: string): Promise<ResumenHoyRow> {
    let query = `
      SELECT 
        COUNT(c.id) AS totalCitasHoy,
        SUM(CASE WHEN c.estado = 'COMPLETADA' THEN 1 ELSE 0 END) AS citasCompletadas,
        SUM(CASE WHEN c.estado = 'CANCELADA' THEN 1 ELSE 0 END) AS citasCanceladas,
        COALESCE(SUM(s.precio), 0) AS ingresosEsperadosHoy
      FROM citas c
      LEFT JOIN servicios s ON c.servicio_id = s.id
      WHERE c.clinica_id = ? AND c.fecha_programada = CURDATE()
    `;
    const params: any[] = [clinicaId];

    if (rol === 'PODOLOGO') {
      query += ` AND c.podologo_id = ?`;
      params.push(usuarioId);
    }

    const [rows] = await pool.execute<any[]>(query, params);
    return rows[0];
  }

  async getCitasProximas(clinicaId: string, usuarioId: string, rol: string): Promise<CitaProximaRow[]> {
    let query = `
      SELECT 
        c.id, c.fecha_programada, c.hora_programada, c.estado,
        CONCAT_WS(' ', p.nombre, p.primer_apellido, p.segundo_apellido) AS nombre_paciente,
        CONCAT_WS(' ', u.nombre, u.primer_apellido, u.segundo_apellido) AS nombre_podologo,
        s.nombre AS nombre_servicio
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN usuarios u ON c.podologo_id = u.id
      LEFT JOIN servicios s ON c.servicio_id = s.id
      WHERE c.clinica_id = ? 
        AND c.estado IN ('PROGRAMADA', 'CONFIRMADA') 
        AND (c.fecha_programada > CURDATE() OR (c.fecha_programada = CURDATE() AND c.hora_programada >= CURTIME()))
    `;
    const params: any[] = [clinicaId];

    if (rol === 'PODOLOGO') {
      query += ` AND c.podologo_id = ?`;
      params.push(usuarioId);
    }

    query += ` ORDER BY c.fecha_programada ASC, c.hora_programada ASC LIMIT 10`;
    
    const [rows] = await pool.execute<any[]>(query, params);
    return rows;
  }

  async getAlertasNotas(clinicaId: string, usuarioId: string, rol: string): Promise<AlertaNotaRow[]> {
    let query = `
      SELECT 
        c.id AS cita_id,
        c.fecha_programada,
        CONCAT_WS(' ', p.nombre, p.primer_apellido, p.segundo_apellido) AS nombre_paciente
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      LEFT JOIN notas_clinicas nc ON c.id = nc.cita_id
      WHERE c.clinica_id = ? 
        AND c.estado = 'COMPLETADA' 
        AND nc.id IS NULL
    `;
    const params: any[] = [clinicaId];

    if (rol === 'PODOLOGO') {
      query += ` AND c.podologo_id = ?`;
      params.push(usuarioId);
    }

    query += ` ORDER BY c.fecha_programada DESC LIMIT 10`;

    const [rows] = await pool.execute<any[]>(query, params);
    return rows;
  }
}