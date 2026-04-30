import type { Request, Response, NextFunction } from 'express';
import { PacienteService } from '../../services/paciente/paciente.service.js';
import { CreatePacienteSchema, UpdatePacienteSchema } from '../../domain/paciente/paciente.domain.js';

export class PacienteController {
  private pacienteService = new PacienteService();

  getAllByClinica = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clinicaId } = req.params as Record<string, string>;
      const pacientes = await this.pacienteService.getAllByClinica(clinicaId!);
      res.status(200).json({ success: true, data: pacientes });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = CreatePacienteSchema.parse(req.body);
      const nuevoPaciente = await this.pacienteService.create(validatedData);
      res.status(201).json({ success: true, message: 'Paciente registrado exitosamente', data: nuevoPaciente });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const validatedData = UpdatePacienteSchema.parse(req.body);
      const pacienteActualizado = await this.pacienteService.update(id!, validatedData);
      res.status(200).json({ success: true, message: 'Paciente actualizado', data: pacienteActualizado });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      await this.pacienteService.delete(id!);
      res.status(200).json({ success: true, message: 'Paciente archivado exitosamente' });
    } catch (error) {
      next(error);
    }
  };
}