import crypto from 'crypto';
import { InventarioRepository } from '../../repositories/inventario/inventario.repository.js';
import { ClinicaRepository } from '../../repositories/clinica/clinica.repository.js';
import { CategoriaInventarioRepository } from '../../repositories/categoria_inventario/categoria_inventario.repository.js';
import { NotFoundError, BadRequestError } from '../../common/errors/domain.errors.js';
import {
  mapInventarioRowToEntity,
  type CreateInventarioDTO,
  type UpdateInventarioDTO,
  type AjusteStockDTO,
  type InventarioEntity
} from '../../domain/inventario/inventario.domain.js';

export class InventarioService {
  private inventarioRepository = new InventarioRepository();
  private clinicaRepository = new ClinicaRepository();
  private categoriaRepository = new CategoriaInventarioRepository();

  async getAllByClinica(clinicaId: string): Promise<InventarioEntity[]> {
    const rows = await this.inventarioRepository.findAllByClinica(clinicaId);
    return rows.map(mapInventarioRowToEntity);
  }

  async getById(id: string): Promise<InventarioEntity> {
    const row = await this.inventarioRepository.findById(id);
    if (!row) throw new NotFoundError('Artículo de inventario');
    return mapInventarioRowToEntity(row);
  }

  async create(data: CreateInventarioDTO): Promise<InventarioEntity> {
    // Verificar que la clínica exista
    const clinica = await this.clinicaRepository.findById(data.clinica_id);
    if (!clinica) throw new NotFoundError('Clínica');

    // Verificar que la categoría exista y esté activa
    const categoria = await this.categoriaRepository.findById(data.categoria_id);
    if (!categoria) throw new NotFoundError('Categoría de inventario');
    if (categoria.esta_activo !== 1) {
      throw new BadRequestError('La categoría seleccionada no está activa');
    }

    const newId = crypto.randomUUID();

    await this.inventarioRepository.create(
      newId,
      data.clinica_id,
      data.categoria_id,
      data.nombre,
      data.descripcion ?? null,
      data.stock_cantidad ?? 0,
      data.precio_compra ?? null,
      data.precio_venta ?? null,
      data.fecha_caducidad ?? null,
      data.ubicacion ?? null
    );

    return await this.getById(newId);
  }

  async update(id: string, data: UpdateInventarioDTO): Promise<InventarioEntity> {
    const existingRow = await this.inventarioRepository.findById(id);
    if (!existingRow) throw new NotFoundError('Artículo de inventario');

    // Si se cambia la categoría, verificar que exista y esté activa
    if (data.categoria_id) {
      const categoria = await this.categoriaRepository.findById(data.categoria_id);
      if (!categoria) throw new NotFoundError('Categoría de inventario');
      if (categoria.esta_activo !== 1) {
        throw new BadRequestError('La categoría seleccionada no está activa');
      }
    }

    // Construir objeto de update dinámico
    const updateData: Record<string, any> = {};
    if (data.categoria_id !== undefined) updateData.categoria_id = data.categoria_id;
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion ?? null;
    if (data.precio_compra !== undefined) updateData.precio_compra = data.precio_compra ?? null;
    if (data.precio_venta !== undefined) updateData.precio_venta = data.precio_venta ?? null;
    if (data.fecha_caducidad !== undefined) updateData.fecha_caducidad = data.fecha_caducidad ?? null;
    if (data.ubicacion !== undefined) updateData.ubicacion = data.ubicacion ?? null;

    await this.inventarioRepository.update(id, updateData);
    return await this.getById(id);
  }

  async ajustarStock(id: string, data: AjusteStockDTO): Promise<InventarioEntity> {
    const existingRow = await this.inventarioRepository.findById(id);
    if (!existingRow) throw new NotFoundError('Artículo de inventario');

    const stockActual = existingRow.stock_cantidad;
    let nuevoStock: number;

    if (data.tipo === 'ENTRADA') {
      nuevoStock = stockActual + data.cantidad;
    } else {
      nuevoStock = stockActual - data.cantidad;
      if (nuevoStock < 0) {
        throw new BadRequestError(
          `Stock insuficiente. Stock actual: ${stockActual}, cantidad solicitada: ${data.cantidad}`
        );
      }
    }

    await this.inventarioRepository.updateStock(id, nuevoStock);
    return await this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.inventarioRepository.findById(id);
    if (!existing) throw new NotFoundError('Artículo de inventario');

    await this.inventarioRepository.softDelete(id);
  }
}
