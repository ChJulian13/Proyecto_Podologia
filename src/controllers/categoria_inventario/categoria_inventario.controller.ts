import type { Request, Response, NextFunction } from 'express';
import { CategoriaInventarioService } from '../../services/categoria_inventario/categoria_inventario.service.js';
import { CreateCategoriaInventarioSchema, UpdateCategoriaInventarioSchema } from '../../domain/categoria_inventario/categoria_inventario.domain.js';

export class CategoriaInventarioController {
  private categoriaService = new CategoriaInventarioService();

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clinicaId = (req as any).usuario!.clinicaId;
      const categorias = await this.categoriaService.getAll(clinicaId);
      res.status(200).json({ success: true, data: categorias });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const categoria = await this.categoriaService.getById(id!);
      res.status(200).json({ success: true, data: categoria });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clinicaId = (req as any).usuario!.clinicaId;
      const validatedData = CreateCategoriaInventarioSchema.parse({
        ...req.body,
        clinica_id: req.body.clinica_id !== undefined ? req.body.clinica_id : clinicaId
      });
      const nuevaCategoria = await this.categoriaService.create(validatedData, clinicaId);
      res.status(201).json({ success: true, message: 'Categoría creada exitosamente', data: nuevaCategoria });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const clinicaId = (req as any).usuario!.clinicaId;
      const validatedData = UpdateCategoriaInventarioSchema.parse(req.body);
      const categoriaActualizada = await this.categoriaService.update(id!, validatedData, clinicaId);
      res.status(200).json({ success: true, message: 'Categoría actualizada', data: categoriaActualizada });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      await this.categoriaService.delete(id!);
      res.status(200).json({ success: true, message: 'Categoría desactivada exitosamente' });
    } catch (error) {
      next(error);
    }
  };
}
