import type { Request, Response } from 'express';
import { CitaService } from '../../services/cita/cita.services.js';
import { CreateCitaSchema, UpdateCitaSchema } from '../../domain/cita/cita.domain.js';

export class CitaController {
  private citaService = new CitaService();

  getAllByClinica = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clinicaId } = req.params;

      if (!clinicaId || typeof clinicaId !== 'string') {
        res.status(400).json({ success: false, message: 'El ID de la clínica es inválido' });
        return;
      }

      const citas = await this.citaService.getAllByClinica(clinicaId);
      res.status(200).json({ success: true, data: citas });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error interno al obtener las citas' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = CreateCitaSchema.parse(req.body);
      const nuevaCita = await this.citaService.create(validatedData);
      
      res.status(201).json({ success: true, message: 'Cita agendada exitosamente', data: nuevaCita });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      
      // Manejo de reglas de negocio
      switch (error.message) {
        case 'PACIENTE_INVALIDO':
          res.status(400).json({ success: false, message: 'El paciente no existe o no pertenece a esta clínica' });
          return;
        case 'PODOLOGO_INVALIDO':
          res.status(400).json({ success: false, message: 'El podólogo no existe o no pertenece a esta clínica' });
          return;
        case 'SERVICIO_INVALIDO':
          res.status(400).json({ success: false, message: 'El servicio no existe o no pertenece a esta clínica' });
          return;
        case 'HORARIO_NO_DISPONIBLE':
          res.status(409).json({ success: false, message: 'El podólogo ya tiene una cita asignada en ese horario' });
          return;
      }
      
      res.status(500).json({ success: false, message: 'Error al agendar la cita' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'El ID de la cita es inválido' });
        return;
      }

      const validatedData = UpdateCitaSchema.parse(req.body);
      
      if (Object.keys(validatedData).length === 0) {
        res.status(400).json({ success: false, message: 'No hay datos para actualizar' });
        return;
      }

      const citaActualizada = await this.citaService.update(id, validatedData);
      res.status(200).json({ success: true, message: 'Cita actualizada', data: citaActualizada });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      if (error.message === 'CITA_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Cita no encontrada' });
        return;
      }
      if (error.message === 'HORARIO_NO_DISPONIBLE') {
        res.status(409).json({ success: false, message: 'El nuevo horario entra en conflicto con otra cita' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al actualizar la cita' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'El ID de la cita es inválido' });
        return;
      }

      // Recordatorio: nuestro servicio llama a cancelar(), no borra el registro físicamente
      await this.citaService.cancelar(id);
      res.status(200).json({ success: true, message: 'Cita cancelada exitosamente' });
    } catch (error: any) {
      if (error.message === 'CITA_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Cita no encontrada' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al cancelar la cita' });
    }
  };

  getToday = async (req: Request, res: Response): Promise<void> => {
    try {
      // El middleware de autenticación inyecta la info del token en req.usuario
      const usuario = (req as any).usuario;

      if (!usuario || !usuario.clinicaId) {
        res.status(403).json({ success: false, message: 'Acceso denegado o clínica no identificada' });
        return;
      }

      // Pasamos los 3 datos clave: clínica, usuario y rol
      const citasHoy = await this.citaService.getTodayCitas(
        usuario.clinicaId, 
        usuario.id, 
        usuario.rol
      );

      res.status(200).json({ 
        success: true, 
        data: citasHoy,
        message: citasHoy.length === 0 ? 'No hay citas programadas para hoy' : 'Citas del día obtenidas'
      });

    } catch (error: any) {
      console.error('Error al obtener citas de hoy:', error);
      res.status(500).json({ success: false, message: 'Error interno al obtener las citas del día' });
    }
  };
}