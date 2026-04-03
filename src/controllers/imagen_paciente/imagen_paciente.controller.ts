import type { Request, Response } from 'express';
import fs from 'fs';
import { ImagenPacienteService } from '../../services/imagen_paciente/imagen_paciente.services.js';
import { CreateImagenSchema } from '../../domain/imagen_paciente/imagen_paciente.domain.js';

export class ImagenPacienteController {
  private imagenService = new ImagenPacienteService();

  getByPaciente = async (req: Request, res: Response): Promise<void> => {
    try {
      const { pacienteId } = req.params;

      if (!pacienteId || typeof pacienteId !== 'string') {
        res.status(400).json({ success: false, message: 'El ID del paciente es inválido' });
        return;
      }

      const imagenes = await this.imagenService.getByPaciente(pacienteId);
      res.status(200).json({ success: true, data: imagenes });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error interno al obtener las imágenes' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Verificar que Multer haya aceptado y guardado el archivo
      if (!req.file) {
        res.status(400).json({ success: false, message: 'Debe adjuntar una imagen válida (JPG, PNG, WebP)' });
        return;
      }

      // 2. Validar los textos del formulario con Zod
      const validatedData = CreateImagenSchema.parse(req.body);
      
      // 3. Enviar todo al Servicio
      const nuevaImagen = await this.imagenService.create(validatedData, req.file);
      
      res.status(201).json({ success: true, message: 'Imagen guardada exitosamente', data: nuevaImagen });
    } catch (error: any) {
      // Limpieza de emergencia: Si algo falla, borramos el archivo físico que Multer ya había guardado
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      
      switch (error.message) {
        case 'PACIENTE_INVALIDO':
          res.status(400).json({ success: false, message: 'El paciente no existe o no pertenece a esta clínica' });
          return;
        case 'NOTA_INVALIDA':
          res.status(400).json({ success: false, message: 'La nota clínica no coincide con este paciente' });
          return;
      }

      res.status(500).json({ success: false, message: 'Error al procesar y guardar la imagen' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'El ID de la imagen es inválido' });
        return;
      }

      await this.imagenService.delete(id);
      res.status(200).json({ success: true, message: 'Imagen eliminada exitosamente' });
    } catch (error: any) {
      if (error.message === 'IMAGEN_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Imagen no encontrada' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al eliminar la imagen' });
    }
  };
}