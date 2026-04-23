import type { Request, Response } from 'express';
import { AuthService } from '../../services/auth/auth.services.js';
import { LoginSchema } from '../../domain/auth/auth.domain.js';

export class AuthController {
  private authService = new AuthService();

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = LoginSchema.parse(req.body);
      
      const { token, usuario } = await this.authService.login(validatedData);

      const expiracionSegundos = parseInt(process.env.JWT_EXPIRES_IN || '43200', 10);
      const cookieMaxAge = expiracionSegundos * 1000;

      // Inyectamos la cookie HttpOnly
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: cookieMaxAge
      });

      res.status(200).json({ 
        success: true, 
        message: 'Inicio de sesión exitoso',
        data: usuario 
      });
      
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      if (error.message === 'CREDENCIALES_INVALIDAS') {
        res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
        return;
      }
      
      // --- NUEVA CAPTURA DE ERROR ---
      if (error.message === 'CLINICA_INACTIVA') {
        res.status(403).json({ 
          success: false, 
          message: 'El acceso está suspendido. La clínica a la que perteneces se encuentra inactiva por falta de pago o suspensión.' 
        });
        return;
      }
      // ------------------------------

      res.status(500).json({ success: false, message: 'Error interno en el inicio de sesión' });
    }
  };

  logout = (req: Request, res: Response): void => {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.status(200).json({ 
      success: true, 
      message: 'Sesión cerrada exitosamente' 
    });
  };
}