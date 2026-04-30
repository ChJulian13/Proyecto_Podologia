import type { Request, Response, NextFunction } from 'express';
import { ClinicaService } from '../../services/clinica/clinica.service.js';
import { CreateClinicaSchema, UpdateClinicaSchema } from '../../domain/clinica/clinica.domain.js';
import { BadRequestError } from '../../common/errors/domain.errors.js';

export class ClinicaController {
  private clinicaService = new ClinicaService();

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clinicas = await this.clinicaService.getAll();
      res.status(200).json({ success: true, data: clinicas });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = CreateClinicaSchema.parse(req.body);
      const nuevaClinica = await this.clinicaService.create(validatedData);
      res.status(201).json({ success: true, message: 'Clínica creada exitosamente', data: nuevaClinica });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const validatedData = UpdateClinicaSchema.parse(req.body);
      const clinicaActualizada = await this.clinicaService.update(id!, validatedData);
      res.status(200).json({ success: true, message: 'Clínica actualizada', data: clinicaActualizada });
    } catch (error) {
      next(error);
    }
  };

  toggleStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const { activar } = req.body;

      if (typeof activar !== 'boolean') {
        throw new BadRequestError('Se requiere el campo booleano "activar" en el cuerpo de la petición');
      }

      await this.clinicaService.toggleStatus(id!, activar);

      const mensaje = activar 
        ? 'La clínica ha sido reactivada. El acceso ha sido restaurado.' 
        : 'La clínica ha sido suspendida. El acceso está bloqueado.';
        
      res.status(200).json({ success: true, message: mensaje });
    } catch (error) {
      next(error);
    }
  };
}