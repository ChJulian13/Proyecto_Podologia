import { pool } from '../../config/database.js';
import type { CitaHoyRow, CitaProximaRow } from '../../domain/dashboard/dashboard.damain.js';

export class DashboardRepository {
  
  async getCitasHoy(): Promise<CitaHoyRow[]> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM v_citas_hoy'
    );
    return rows;
  }

  async getCitasProximas(): Promise<CitaProximaRow[]> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM v_citas_proximas'
    );
    return rows;
  }
}