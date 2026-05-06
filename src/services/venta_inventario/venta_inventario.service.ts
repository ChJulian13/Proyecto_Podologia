import crypto from 'crypto';
import { pool } from '../../config/database.js';
import { VentaInventarioRepository } from '../../repositories/venta_inventario/venta_inventario.repository.js';
import { InventarioRepository } from '../../repositories/inventario/inventario.repository.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors/domain.errors.js';
import {
  mapVentaInventarioRowToEntity,
  type CreateVentaInventarioDTO,
  type VentaInventarioEntity
} from '../../domain/venta_inventario/venta_inventario.domain.js';

export class VentaInventarioService {
  private ventaRepository = new VentaInventarioRepository();
  private inventarioRepository = new InventarioRepository();

  async getByFactura(facturaId: string): Promise<VentaInventarioEntity[]> {
    const rows = await this.ventaRepository.findByFactura(facturaId);
    return rows.map(mapVentaInventarioRowToEntity);
  }

  async getByClinica(clinicaId: string): Promise<VentaInventarioEntity[]> {
    const rows = await this.ventaRepository.findByClinica(clinicaId);
    return rows.map(mapVentaInventarioRowToEntity);
  }

  // ── CREATE VENTA — Operación Transaccional ──

  async create(data: CreateVentaInventarioDTO): Promise<VentaInventarioEntity[]> {
    const connection = await pool.getConnection();
    const ventasCreadasIds: string[] = [];

    try {
      await connection.beginTransaction();

      // Iteramos sobre el "carrito de compras"
      for (const prod of data.productos) {
        // 1. Validar que el artículo existe y está activo
        const item = await this.inventarioRepository.findById(prod.inventario_item_id);
        if (!item) {
          throw new NotFoundError(`Artículo de inventario no encontrado: ${prod.inventario_item_id}`);
        }
        if (item.esta_activo !== 1) {
          throw new BadRequestError(`El artículo "${item.nombre}" no está activo para la venta`);
        }

        // 2. Verificar stock suficiente
        if (item.stock_cantidad < prod.cantidad) {
          throw new BadRequestError(
            `Stock insuficiente para "${item.nombre}". Disponible: ${item.stock_cantidad}, Solicitado: ${prod.cantidad}`
          );
        }

        // 3. Calcular nuevo stock y generar ID
        const newId = crypto.randomUUID();
        const nuevoStock = item.stock_cantidad - prod.cantidad;

        // 4. Insertar registro de esta línea de venta
        await this.ventaRepository.createWithTransaction(
          connection,
          newId,
          data.clinica_id,
          data.paciente_id ?? null,
          data.factura_id ?? null,
          prod.inventario_item_id,
          prod.cantidad,
          prod.precio_venta
        );

        // 5. Descontar stock del inventario
        await this.inventarioRepository.updateStockWithTransaction(
          connection,
          prod.inventario_item_id,
          nuevoStock
        );

        ventasCreadasIds.push(newId);
      }

      // Si todo el ciclo terminó sin errores, consolidamos todo en la base de datos
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    // 6. Devolver el arreglo de entidades creadas ya mapeadas
    const ventasEntities: VentaInventarioEntity[] = [];
    for (const id of ventasCreadasIds) {
      const row = await this.ventaRepository.findById(id);
      if (row) ventasEntities.push(mapVentaInventarioRowToEntity(row));
    }

    return ventasEntities;
  }

  // ── CANCELAR VENTA — Operación Transaccional ──

  async cancelar(id: string): Promise<VentaInventarioEntity> {
    // 1. Buscar la venta
    const venta = await this.ventaRepository.findById(id);
    if (!venta) throw new NotFoundError('Venta de inventario');

    // 2. Verificar que no esté ya cancelada
    if (venta.esta_cancelada === 1) {
      throw new ConflictError('Esta venta ya fue cancelada anteriormente');
    }

    // 3. Obtener el item de inventario para calcular stock restaurado
    const item = await this.inventarioRepository.findById(venta.inventario_item_id);
    if (!item) throw new NotFoundError('Artículo de inventario asociado');

    const stockRestaurado = item.stock_cantidad + venta.cantidad;

    // 4. Transacción: CANCEL venta + RESTORE stock
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 4a. Marcar venta como cancelada
      await this.ventaRepository.cancelWithTransaction(connection, id);

      // 4b. Regresar stock al inventario
      await this.inventarioRepository.updateStockWithTransaction(
        connection,
        venta.inventario_item_id,
        stockRestaurado
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    // 5. Devolver la entidad actualizada
    const row = await this.ventaRepository.findById(id);
    return mapVentaInventarioRowToEntity(row!);
  }
}
