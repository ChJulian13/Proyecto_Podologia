import type { Request, Response } from 'express';
import { AuthService } from '../../services/auth/auth.services.js';
import { LoginSchema } from '../../domain/auth/auth.domain.js';

export class AuthController {
  private authService = new AuthService();

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = LoginSchema.parse(req.body);
      
      const { token, usuario } = await this.authService.login(validatedData);

      res.status(200).json({ 
        success: true, 
        message: 'Inicio de sesión exitoso',
        token, 
        data: usuario 
      });
      
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      if (error.message === 'CREDENCIALES_INVALIDAS') {
        // Siempre respondemos 401 Unauthorized y con un mensaje genérico por seguridad 
        // para no darle pistas a atacantes si el fallo fue el correo o la contraseña.
        res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error interno en el inicio de sesión' });
    }
  };
}