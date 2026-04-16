import type { Request, Response } from 'express';
import { UsuarioService } from '../../services/usuario/usuario.services.js';
import { CreateUsuarioSchema, UpdateUsuarioSchema, UpdatePasswordSchema } from '../../domain/usuario/usuario.domain.js';

export class UsuarioController {
  private usuarioService = new UsuarioService();

  // Obtenemos los usuarios filtrando por la clínica a la que pertenecen
  getAllByClinica = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clinicaId } = req.params;

      // Validación estricta para TypeScript
      if (!clinicaId || typeof clinicaId !== 'string') {
        res.status(400).json({ success: false, message: 'El ID de la clínica en la URL es inválido' });
        return;
      }

      const usuarios = await this.usuarioService.getAllByClinica(clinicaId);
      res.status(200).json({ success: true, data: usuarios });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = CreateUsuarioSchema.parse(req.body);
      const nuevoUsuario = await this.usuarioService.create(validatedData);
      
      res.status(201).json({ success: true, message: 'Usuario registrado exitosamente', data: nuevoUsuario });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      if (error.message === 'CLINICA_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'La clínica asignada no existe' });
        return;
      }
      if (error.message === 'CORREO_DUPLICADO') {
        // 409 Conflict: Es el código HTTP correcto cuando un recurso ya existe
        res.status(409).json({ success: false, message: 'Este correo ya está registrado en esta clínica' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al registrar el usuario' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'El ID proporcionado es inválido' });
        return;
      }

      const validatedData = UpdateUsuarioSchema.parse(req.body);
      
      if (Object.keys(validatedData).length === 0) {
        res.status(400).json({ success: false, message: 'No hay datos para actualizar' });
        return;
      }

      const usuarioActualizado = await this.usuarioService.update(id, validatedData);
      res.status(200).json({ success: true, message: 'Usuario actualizado', data: usuarioActualizado });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      if (error.message === 'USUARIO_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        return;
      }
      if (error.message === 'CORREO_DUPLICADO') {
        res.status(409).json({ success: false, message: 'El correo ya está en uso por otro usuario' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al actualizar el usuario' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'El ID proporcionado es inválido' });
        return;
      }

      await this.usuarioService.delete(id);
      res.status(200).json({ success: true, message: 'Usuario desactivado exitosamente' });
    } catch (error: any) {
      if (error.message === 'USUARIO_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al eliminar el usuario' });
    }
  };

  updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'El ID proporcionado es inválido' });
        return;
      }

      const validatedData = UpdatePasswordSchema.parse(req.body);
      
      await this.usuarioService.updatePassword(id, validatedData);
      res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      if (error.message === 'USUARIO_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        return;
      }
      if (error.message === 'CONTRASENA_INCORRECTA') {
        res.status(401).json({ success: false, message: 'La contraseña actual es incorrecta' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al actualizar la contraseña' });
    }
  };
}