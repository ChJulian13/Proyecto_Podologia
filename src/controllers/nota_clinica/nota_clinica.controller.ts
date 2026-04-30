import type { Request, Response, NextFunction } from 'express';
import { NotaClinicaService } from '../../services/nota_clinica/nota_clinica.service.js';
import { CreateNotaClinicaSchema, UpdateNotaClinicaSchema } from '../../domain/nota_clinica/nota_clinica.domain.js';

export class NotaClinicaController {
  private notaService = new NotaClinicaService();

  getHistorial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pacienteId } = req.params as Record<string, string>;
      const historial = await this.notaService.getHistorialByPaciente(pacienteId!);
      res.status(200).json({ success: true, data: historial });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = CreateNotaClinicaSchema.parse(req.body);
      const nuevaNota = await this.notaService.create(validatedData);
      res.status(201).json({ success: true, message: 'Nota clínica guardada exitosamente', data: nuevaNota });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const validatedData = UpdateNotaClinicaSchema.parse(req.body);
      const notaActualizada = await this.notaService.update(id!, validatedData);
      res.status(200).json({ success: true, message: 'Nota clínica actualizada', data: notaActualizada });
    } catch (error) {
      next(error);
    }
  };

  getByCita = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { citaId } = req.params as Record<string, string>;
      const nota = await this.notaService.getByCitaId(citaId!);
      
      if (!nota) {
        // Un 404 limpio y esperado por el frontend para saber que debe crear una nueva
        res.status(404).json({ success: false, message: 'No hay nota clínica para esta cita' });
        return;
      }

      res.status(200).json({ success: true, data: nota });
    } catch (error) {
      next(error);
    }
  };
}