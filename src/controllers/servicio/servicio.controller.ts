import type { Request, Response, NextFunction } from 'express';
import { ServicioService } from '../../services/servicio/servicio.service.js';
import { CreateServicioSchema, UpdateServicioSchema } from '../../domain/servicio/servicio.domain.js';

export class ServicioController {
  private servicioService = new ServicioService();

  getAllByClinica = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clinicaId } = req.params as Record<string, string>;
      const servicios = await this.servicioService.getAllByClinica(clinicaId!);
      res.status(200).json({ success: true, data: servicios });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = CreateServicioSchema.parse(req.body);
      const nuevoServicio = await this.servicioService.create(validatedData);
      res.status(201).json({ success: true, message: 'Servicio creado exitosamente', data: nuevoServicio });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const validatedData = UpdateServicioSchema.parse(req.body);
      const servicioActualizado = await this.servicioService.update(id!, validatedData);
      res.status(200).json({ success: true, message: 'Servicio actualizado', data: servicioActualizado });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      await this.servicioService.delete(id!);
      res.status(200).json({ success: true, message: 'Servicio desactivado exitosamente' });
    } catch (error) {
      next(error);
    }
  };
}