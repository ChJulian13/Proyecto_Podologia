import crypto from 'crypto';
import { CategoriaInventarioRepository } from '../../repositories/categoria_inventario/categoria_inventario.repository.js';
import { NotFoundError, ConflictError } from '../../common/errors/domain.errors.js';
import {
  mapCategoriaInventarioRowToEntity,
  type CreateCategoriaInventarioDTO,
  type UpdateCategoriaInventarioDTO,
  type CategoriaInventarioEntity
} from '../../domain/categoria_inventario/categoria_inventario.domain.js';

export class CategoriaInventarioService {
  private categoriaRepository = new CategoriaInventarioRepository();

  async getAll(): Promise<CategoriaInventarioEntity[]> {
    const rows = await this.categoriaRepository.findAll();
    return rows.map(mapCategoriaInventarioRowToEntity);
  }

  async getById(id: string): Promise<CategoriaInventarioEntity> {
    const row = await this.categoriaRepository.findById(id);
    if (!row) throw new NotFoundError('Categoría de inventario');
    return mapCategoriaInventarioRowToEntity(row);
  }

  async create(data: CreateCategoriaInventarioDTO): Promise<CategoriaInventarioEntity> {
    // Verificar nombre duplicado (UNIQUE KEY en BD)
    const existente = await this.categoriaRepository.findByNombre(data.nombre);
    if (existente) {
      throw new ConflictError(`Ya existe una categoría con el nombre "${data.nombre}"`);
    }

    const newId = crypto.randomUUID();
    await this.categoriaRepository.create(newId, data.nombre, data.descripcion ?? null);
    return await this.getById(newId);
  }

  async update(id: string, data: UpdateCategoriaInventarioDTO): Promise<CategoriaInventarioEntity> {
    const existingRow = await this.categoriaRepository.findById(id);
    if (!existingRow) throw new NotFoundError('Categoría de inventario');

    const newNombre = data.nombre ?? existingRow.nombre;
    const newDescripcion = data.descripcion !== undefined ? (data.descripcion ?? null) : existingRow.descripcion;

    // Si cambia el nombre, verificar que no duplique
    if (data.nombre && data.nombre !== existingRow.nombre) {
      const duplicada = await this.categoriaRepository.findByNombre(data.nombre);
      if (duplicada) {
        throw new ConflictError(`Ya existe una categoría con el nombre "${data.nombre}"`);
      }
    }

    await this.categoriaRepository.update(id, newNombre, newDescripcion);
    return await this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.categoriaRepository.findById(id);
    if (!existing) throw new NotFoundError('Categoría de inventario');

    // Verificar que no haya productos activos usando esta categoría
    const totalProductos = await this.categoriaRepository.countProductosByCategoria(id);
    if (totalProductos > 0) {
      throw new ConflictError(
        `No se puede desactivar: existen ${totalProductos} producto(s) activo(s) usando esta categoría`
      );
    }

    await this.categoriaRepository.softDelete(id);
  }
}
