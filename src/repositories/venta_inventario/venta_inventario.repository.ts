import { pool } from '../../config/database.js';
import type { PoolConnection } from 'mysql2/promise';
import type { VentaInventarioRow } from '../../domain/venta_inventario/venta_inventario.domain.js';

export class VentaInventarioRepository {

  // Base query con JOIN para traer el nombre del artículo vendido
  private selectQuery = `
    SELECT 
      v.*, 
      i.nombre AS item_nombre 
    FROM ventas_inventario v
    INNER JOIN inventario i ON v.inventario_item_id = i.id
  `;

  async findById(id: string): Promise<VentaInventarioRow | null> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} WHERE v.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async findByFactura(facturaId: string): Promise<VentaInventarioRow[]> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} 
       WHERE v.factura_id = ? AND v.esta_cancelada = 0 
       ORDER BY v.fecha_venta DESC`,
      [facturaId]
    );
    return rows;
  }

  async findByClinica(clinicaId: string): Promise<VentaInventarioRow[]> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} 
       WHERE v.clinica_id = ? 
       ORDER BY v.fecha_venta DESC`,
      [clinicaId]
    );
    return rows;
  }

  async createWithTransaction(
    connection: PoolConnection,
    id: string, clinicaId: string, pacienteId: string | null, facturaId: string | null,
    inventarioItemId: string, cantidad: number, precioVenta: number
  ): Promise<void> {
    await connection.execute(
      `INSERT INTO ventas_inventario 
       (id, clinica_id, paciente_id, factura_id, inventario_item_id, cantidad, precio_venta) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, clinicaId, pacienteId, facturaId, inventarioItemId, cantidad, precioVenta]
    );
  }

  async cancelWithTransaction(connection: PoolConnection, id: string): Promise<void> {
    await connection.execute(
      'UPDATE ventas_inventario SET esta_cancelada = 1 WHERE id = ?',
      [id]
    );
  }
}
