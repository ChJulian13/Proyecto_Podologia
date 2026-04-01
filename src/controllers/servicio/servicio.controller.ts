import type { Request, Response } from 'express';
import { ServicioService } from '../../services/servicio/servicio.services.js';
import { CreateServicioSchema, UpdateServicioSchema } from '../../domain/servicio/servicio.domain.js';

export class ServicioController {
  private servicioService = new ServicioService();

  getAllByClinica = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clinicaId } = req.params;

      if (!clinicaId || typeof clinicaId !== 'string') {
        res.status(400).json({ success: false, message: 'El ID de la clínica es inválido' });
        return;
      }

      const servicios = await this.servicioService.getAllByClinica(clinicaId);
      res.status(200).json({ success: true, data: servicios });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error interno al obtener los servicios' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = CreateServicioSchema.parse(req.body);
      const nuevoServicio = await this.servicioService.create(validatedData);
      
      res.status(201).json({ success: true, message: 'Servicio creado exitosamente', data: nuevoServicio });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      if (error.message === 'CLINICA_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'La clínica asignada no existe' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al crear el servicio' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'El ID del servicio es inválido' });
        return;
      }

      const validatedData = UpdateServicioSchema.parse(req.body);
      
      if (Object.keys(validatedData).length === 0) {
        res.status(400).json({ success: false, message: 'No hay datos para actualizar' });
        return;
      }

      const servicioActualizado = await this.servicioService.update(id, validatedData);
      res.status(200).json({ success: true, message: 'Servicio actualizado', data: servicioActualizado });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      if (error.message === 'SERVICIO_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Servicio no encontrado' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al actualizar el servicio' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'El ID del servicio es inválido' });
        return;
      }

      await this.servicioService.delete(id);
      res.status(200).json({ success: true, message: 'Servicio desactivado exitosamente' });
    } catch (error: any) {
      if (error.message === 'SERVICIO_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Servicio no encontrado' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al eliminar el servicio' });
    }
  };
}