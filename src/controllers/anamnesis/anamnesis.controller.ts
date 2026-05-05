import type { Request, Response, NextFunction } from 'express';
import { AnamnesisService } from '../../services/anamnesis/anamnesis.service.js';
import { CreateAnamnesisSchema, UpdateAnamnesisSchema } from '../../domain/anamnesis/anamnesis.domain.js';

export class AnamnesisController {
  private anamnesisService = new AnamnesisService();

  getByPaciente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pacienteId } = req.params as Record<string, string>;
      const anamnesis = await this.anamnesisService.getByPaciente(pacienteId!);
      res.status(200).json({ success: true, data: anamnesis });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = CreateAnamnesisSchema.parse(req.body);
      const nuevaAnamnesis = await this.anamnesisService.create(validatedData);
      res.status(201).json({ success: true, message: 'Anamnesis registrada exitosamente', data: nuevaAnamnesis });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const validatedData = UpdateAnamnesisSchema.parse(req.body);
      const anamnesisActualizada = await this.anamnesisService.update(id!, validatedData);
      res.status(200).json({ success: true, message: 'Anamnesis actualizada', data: anamnesisActualizada });
    } catch (error) {
      next(error);
    }
  };
}
