import type { Request, Response, NextFunction } from 'express';
import { ConsultaService } from '../../services/consulta/consulta.service.js';
import {
  CreateConsultaSchema,
  UpdateConsultaSchema,
  CreateConsultaRecetaSchema,
} from '../../domain/consulta/consulta.domain.js';

export class ConsultaController {
  private consultaService = new ConsultaService();

  // ── POST /api/consultas ────────────────────────────────────────────────────

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = CreateConsultaSchema.parse(req.body);
      const consultaId = await this.consultaService.create(validatedData);
      res.status(201).json({
        success: true,
        message: 'Consulta creada exitosamente',
        data: { id: consultaId },
      });
    } catch (error) {
      next(error);
    }
  };

  // ── GET /api/consultas/:id ─────────────────────────────────────────────────

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const consulta = await this.consultaService.getById(id!);
      res.status(200).json({ success: true, data: consulta });
    } catch (error) {
      next(error);
    }
  };

  // ── GET /api/consultas/paciente/:pacienteId ────────────────────────────────

  getByPaciente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pacienteId } = req.params as Record<string, string>;
      const consultas = await this.consultaService.getByPaciente(pacienteId!);
      res.status(200).json({ success: true, data: consultas });
    } catch (error) {
      next(error);
    }
  };

  // ── GET /api/consultas/cita/:citaId ───────────────────────────────────────

  getByCita = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { citaId } = req.params as Record<string, string>;
      const consulta = await this.consultaService.getByCita(citaId!);

      if (!consulta) {
        res.status(404).json({
          success: false,
          message: 'No existe una consulta registrada para esta cita',
          data: null,
        });
        return;
      }

      res.status(200).json({ success: true, data: consulta });
    } catch (error) {
      next(error);
    }
  };

  // ── PATCH /api/consultas/:id ───────────────────────────────────────────────

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const validatedData = UpdateConsultaSchema.parse(req.body);
      const updatedConsulta = await this.consultaService.update(id!, validatedData);
      res.status(200).json({
        success: true,
        message: 'Consulta actualizada exitosamente',
        data: updatedConsulta,
      });
    } catch (error) {
      next(error);
    }
  };

  // ── POST /api/consultas/:consultaId/recetas ────────────────────────────────

  addReceta = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { consultaId } = req.params as Record<string, string>;
      const validatedData = CreateConsultaRecetaSchema.parse(req.body);
      const receta = await this.consultaService.addReceta(consultaId!, validatedData);
      res.status(201).json({
        success: true,
        message: 'Producto agregado a la receta exitosamente',
        data: receta,
      });
    } catch (error) {
      next(error);
    }
  };

  // ── DELETE /api/consultas/:consultaId/recetas/:recetaId ───────────────────

  deleteReceta = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { consultaId, recetaId } = req.params as Record<string, string>;
      await this.consultaService.deleteReceta(consultaId!, recetaId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
