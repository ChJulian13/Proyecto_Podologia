import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { ImagenPacienteService } from '../../services/imagen_paciente/imagen_paciente.service.js';
import { CreateImagenSchema } from '../../domain/imagen_paciente/imagen_paciente.domain.js';
import { BadRequestError } from '../../common/errors/domain.errors.js';

export class ImagenPacienteController {
  private imagenService = new ImagenPacienteService();

  getByPaciente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pacienteId } = req.params as Record<string, string>;
      const imagenes = await this.imagenService.getByPaciente(pacienteId!);
      res.status(200).json({ success: true, data: imagenes });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new BadRequestError('Debe adjuntar una imagen válida (JPG, PNG, WebP)');
      }

      const validatedData = CreateImagenSchema.parse(req.body);
      const nuevaImagen = await this.imagenService.create(validatedData, req.file);
      res.status(201).json({ success: true, message: 'Imagen guardada exitosamente', data: nuevaImagen });
    } catch (error) {
      // Limpieza de emergencia: Si algo falla, borramos el archivo físico que Multer ya había guardado
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      await this.imagenService.delete(id!);
      res.status(200).json({ success: true, message: 'Imagen eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  };

  getByNotaClinica = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { notaClinicaId } = req.params as Record<string, string>;
      const imagenes = await this.imagenService.getByNotaClinica(notaClinicaId!);
      res.status(200).json({ success: true, data: imagenes });
    } catch (error) {
      next(error);
    }
  };
}