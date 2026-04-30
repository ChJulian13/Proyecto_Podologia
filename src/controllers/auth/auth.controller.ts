import type { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env.js';
import { AuthService } from '../../services/auth/auth.service.js';
import { LoginSchema } from '../../domain/auth/auth.domain.js';

export class AuthController {
  private authService = new AuthService();

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = LoginSchema.parse(req.body);
      const { token, usuario } = await this.authService.login(validatedData);

      const cookieMaxAge = env.JWT_EXPIRES_IN * 1000;

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
    } catch (error) {
      next(error);
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