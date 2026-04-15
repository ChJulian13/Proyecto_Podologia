import { pool } from '../../config/database.js';
import type { CitaProximaRow, ResumenHoyRow, AlertaNotaRow, IngresoRow, ServicioPopularRow, TasaAsistenciaRow, CrecimientoPacientesRow } from '../../domain/dashboard/dashboard.damain.js';

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

  async getIngresos(clinicaId: string, fechaInicio: string, fechaFin: string): Promise<IngresoRow[]> {
    const query = `
      SELECT 
        fecha_emision,
        COALESCE(SUM(CASE WHEN estado_pago = 'PAGADO' THEN monto ELSE 0 END), 0) AS totalPagado,
        COALESCE(SUM(CASE WHEN estado_pago = 'PENDIENTE' THEN monto ELSE 0 END), 0) AS totalPendiente
      FROM facturas
      WHERE clinica_id = ? AND fecha_emision BETWEEN ? AND ?
      GROUP BY fecha_emision
      ORDER BY fecha_emision ASC
    `;
    const [rows] = await pool.execute<any[]>(query, [clinicaId, fechaInicio, fechaFin]);
    return rows;
  }

  async getServiciosPopulares(clinicaId: string, fechaInicio: string, fechaFin: string): Promise<ServicioPopularRow[]> {
    const query = `
      SELECT 
        s.nombre AS nombre_servicio, 
        COUNT(c.id) AS cantidad_realizada
      FROM citas c
      JOIN servicios s ON c.servicio_id = s.id
      WHERE c.clinica_id = ? 
        AND c.fecha_programada BETWEEN ? AND ?
        AND c.estado = 'COMPLETADA'
      GROUP BY s.id, s.nombre
      ORDER BY cantidad_realizada DESC
      LIMIT 10
    `;
    const [rows] = await pool.execute<any[]>(query, [clinicaId, fechaInicio, fechaFin]);
    return rows;
  }

  async getTasaAsistencia(clinicaId: string, fechaInicio: string, fechaFin: string): Promise<TasaAsistenciaRow[]> {
    const query = `
      SELECT estado, COUNT(id) AS cantidad
      FROM citas
      WHERE clinica_id = ? AND fecha_programada BETWEEN ? AND ?
      GROUP BY estado
    `;
    const [rows] = await pool.execute<any[]>(query, [clinicaId, fechaInicio, fechaFin]);
    return rows;
  }

  async getNuevosPacientes(clinicaId: string, fechaInicio: string, fechaFin: string): Promise<CrecimientoPacientesRow> {
    const query = `
      SELECT 
        (SELECT COUNT(id) FROM pacientes 
         WHERE clinica_id = ? AND fecha_creacion BETWEEN ? AND ?) as totalActual,
        (SELECT COUNT(id) FROM pacientes 
         WHERE clinica_id = ? AND fecha_creacion BETWEEN 
           DATE_SUB(?, INTERVAL DATEDIFF(?, ?) + 1 DAY) AND 
           DATE_SUB(?, INTERVAL 1 DAY)) as totalAnterior
    `;
    
    // El orden de parámetros es vital para que MySQL calcule bien los intervalos
    const params = [
      clinicaId, fechaInicio, fechaFin, // Para totalActual
      clinicaId, fechaInicio, fechaFin, fechaInicio, fechaInicio // Para totalAnterior
    ];

    const [rows] = await pool.execute<any[]>(query, params);
    return rows[0];
  }
}