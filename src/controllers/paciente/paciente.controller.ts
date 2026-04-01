import type { Request, Response } from 'express';
import { PacienteService } from '../../services/paciente/paciente.services.js';
import { CreatePacienteSchema, UpdatePacienteSchema } from '../../domain/paciente/paciente.domain.js';

export class PacienteController {
  private pacienteService = new PacienteService();

  getAllByClinica = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clinicaId } = req.params;

      if (!clinicaId || typeof clinicaId !== 'string') {
        res.status(400).json({ success: false, message: 'El ID de la clínica es inválido' });
        return;
      }

      const pacientes = await this.pacienteService.getAllByClinica(clinicaId);
      res.status(200).json({ success: true, data: pacientes });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error interno al obtener los pacientes' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = CreatePacienteSchema.parse(req.body);
      const nuevoPaciente = await this.pacienteService.create(validatedData);
      
      res.status(201).json({ success: true, message: 'Paciente registrado exitosamente', data: nuevoPaciente });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      if (error.message === 'CLINICA_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'La clínica asignada no existe' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al registrar el paciente' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'El ID del paciente es inválido' });
        return;
      }

      const validatedData = UpdatePacienteSchema.parse(req.body);
      
      if (Object.keys(validatedData).length === 0) {
        res.status(400).json({ success: false, message: 'No hay datos para actualizar' });
        return;
      }

      const pacienteActualizado = await this.pacienteService.update(id, validatedData);
      res.status(200).json({ success: true, message: 'Paciente actualizado', data: pacienteActualizado });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      if (error.message === 'PACIENTE_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Paciente no encontrado' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al actualizar el paciente' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'El ID del paciente es inválido' });
        return;
      }

      await this.pacienteService.delete(id);
      res.status(200).json({ success: true, message: 'Paciente archivado exitosamente' });
    } catch (error: any) {
      if (error.message === 'PACIENTE_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Paciente no encontrado' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al eliminar el paciente' });
    }
  };
}