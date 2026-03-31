import { type Request, type Response } from 'express';
import { ClinicaService } from '../../services/clinica/clinica.services.js';
import { CreateClinicaSchema, UpdateClinicaSchema } from '../../domain/clinica/clinica.domain.js';

export class ClinicaController {
  private clinicaService = new ClinicaService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const clinicas = await this.clinicaService.getAll();
      res.status(200).json({ success: true, data: clinicas });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = CreateClinicaSchema.parse(req.body);
      const nuevaClinica = await this.clinicaService.create(validatedData);
      res.status(201).json({ success: true, message: 'Clínica creada', data: nuevaClinica });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al crear la clínica' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'El ID proporcionado en la URL es inválido' });
        return;
      }

      const validatedData = UpdateClinicaSchema.parse(req.body);
      
      if (Object.keys(validatedData).length === 0) {
        res.status(400).json({ success: false, message: 'No hay datos para actualizar' });
        return;
      }

      const clinicaActualizada = await this.clinicaService.update(id, validatedData);
      res.status(200).json({ success: true, message: 'Clínica actualizada', data: clinicaActualizada });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      if (error.message === 'CLINICA_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Clínica no encontrada' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al actualizar' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'El ID proporcionado en la URL es inválido' });
        return;
      }
      
      await this.clinicaService.delete(id);
      res.status(200).json({ success: true, message: 'Clínica desactivada exitosamente' });
    } catch (error: any) {
      if (error.message === 'CLINICA_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Clínica no encontrada' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al eliminar' });
    }
  };
}