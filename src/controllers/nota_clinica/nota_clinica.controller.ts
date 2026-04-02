import type { Request, Response } from 'express';
import { NotaClinicaService } from '../../services/nota_clinica/nota_clinica.services.js';
import { CreateNotaClinicaSchema, UpdateNotaClinicaSchema } from '../../domain/nota_clinica/nota_clinica.domain.js';

export class NotaClinicaController {
  private notaService = new NotaClinicaService();

  getHistorial = async (req: Request, res: Response): Promise<void> => {
    try {
      const { pacienteId } = req.params;

      if (!pacienteId || typeof pacienteId !== 'string') {
        res.status(400).json({ success: false, message: 'El ID del paciente es inválido' });
        return;
      }

      const historial = await this.notaService.getHistorialByPaciente(pacienteId);
      res.status(200).json({ success: true, data: historial });
    } catch (error: any) {
      if (error.message === 'PACIENTE_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Paciente no encontrado' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error interno al obtener el historial clínico' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = CreateNotaClinicaSchema.parse(req.body);
      const nuevaNota = await this.notaService.create(validatedData);
      
      res.status(201).json({ success: true, message: 'Nota clínica guardada exitosamente', data: nuevaNota });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      
      // Manejo de reglas de negocio cruzadas
      switch (error.message) {
        case 'PACIENTE_INVALIDO':
          res.status(400).json({ success: false, message: 'El paciente no existe o no pertenece a esta clínica' });
          return;
        case 'PODOLOGO_INVALIDO':
          res.status(400).json({ success: false, message: 'El podólogo no existe o no pertenece a esta clínica' });
          return;
        case 'CITA_INVALIDA':
          res.status(400).json({ success: false, message: 'La cita no coincide con este paciente o clínica' });
          return;
      }

      res.status(500).json({ success: false, message: 'Error al guardar la nota clínica' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'El ID de la nota es inválido' });
        return;
      }

      const validatedData = UpdateNotaClinicaSchema.parse(req.body);
      
      if (Object.keys(validatedData).length === 0) {
        res.status(400).json({ success: false, message: 'No hay datos para actualizar' });
        return;
      }

      const notaActualizada = await this.notaService.update(id, validatedData);
      res.status(200).json({ success: true, message: 'Nota clínica actualizada', data: notaActualizada });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      if (error.message === 'NOTA_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Nota clínica no encontrada' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al actualizar la nota clínica' });
    }
  };
}