import { pool } from '../../config/database.js';
import type { FacturaRow } from '../../domain/factura/factura.domain.js';

export class FacturaRepository {
  async findById(id: string): Promise<FacturaRow | null> {
    const [rows] = await pool.execute<any[]>('SELECT * FROM facturas WHERE id = ? LIMIT 1', [id]);
    return rows[0] ?? null;
  }

  async findByNumeroFactura(clinicaId: string, numeroFactura: string): Promise<FacturaRow | null> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM facturas WHERE clinica_id = ? AND numero_factura = ? LIMIT 1',
      [clinicaId, numeroFactura]
    );
    return rows[0] ?? null;
  }

  async findByCitaId(citaId: string): Promise<FacturaRow[]> {
    const [rows] = await pool.execute<any[]>('SELECT * FROM facturas WHERE cita_id = ? ORDER BY fecha_emision DESC', [citaId]);
    return rows;
  }

  async create(
    id: string, clinicaId: string, pacienteId: string, citaId: string | null,
    numeroFactura: string, descripcion: string, monto: number
  ): Promise<void> {
    await pool.execute(
      `INSERT INTO facturas (id, clinica_id, paciente_id, cita_id, numero_factura, descripcion_servicio, monto) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, clinicaId, pacienteId, citaId, numeroFactura, descripcion, monto]
    );
  }

  async marcarComoPagada(id: string, metodoPago: string): Promise<void> {
    await pool.execute(
      'UPDATE facturas SET estado_pago = "PAGADO", metodo_pago = ?, fecha_pago = curdate() WHERE id = ?',
      [metodoPago, id]
    );
  }
}