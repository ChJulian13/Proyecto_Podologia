import type { Request, Response, NextFunction } from 'express';
import { UsuarioService } from '../../services/usuario/usuario.service.js';
import { CreateUsuarioSchema, UpdateUsuarioSchema, UpdatePasswordSchema } from '../../domain/usuario/usuario.domain.js';

export class UsuarioController {
  private usuarioService = new UsuarioService();

  getAllByClinica = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clinicaId } = req.params as Record<string, string>;
      const usuarios = await this.usuarioService.getAllByClinica(clinicaId!);
      res.status(200).json({ success: true, data: usuarios });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = CreateUsuarioSchema.parse(req.body);
      const nuevoUsuario = await this.usuarioService.create(validatedData);
      res.status(201).json({ success: true, message: 'Usuario registrado exitosamente', data: nuevoUsuario });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const validatedData = UpdateUsuarioSchema.parse(req.body);
      const usuarioActualizado = await this.usuarioService.update(id!, validatedData);
      res.status(200).json({ success: true, message: 'Usuario actualizado', data: usuarioActualizado });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      await this.usuarioService.delete(id!);
      res.status(200).json({ success: true, message: 'Usuario desactivado exitosamente' });
    } catch (error) {
      next(error);
    }
  };

  updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const validatedData = UpdatePasswordSchema.parse(req.body);
      await this.usuarioService.updatePassword(id!, validatedData);
      res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      next(error);
    }
  };
}