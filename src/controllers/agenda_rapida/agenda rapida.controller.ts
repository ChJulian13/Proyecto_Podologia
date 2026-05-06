import type { Request, Response, NextFunction } from 'express';
import { AgendaRapidaService } from '../../services/agenda_rapida/agenda_rapida.service.js';
import { CreateCitaRapidaSchema } from '../../domain/cita/cita.domain.js';

export class AgendaRapidaController {
    private agendaRapidaService = new AgendaRapidaService();

    ejecutar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const validatedData = CreateCitaRapidaSchema.parse(req.body);
            const resultado = await this.agendaRapidaService.ejecutar(validatedData);

            res.status(201).json({
                success: true,
                message: 'Paciente registrado y cita agendada exitosamente',
                data: resultado,
            });
        } catch (error) {
            next(error);
        }
    };
}