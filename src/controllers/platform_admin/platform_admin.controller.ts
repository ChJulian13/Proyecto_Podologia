import { type Request, type Response } from 'express';
import { PlatformAdminService } from '../../services/platform_admin/platform_admin.service.js';
import { LoginSuperAdminSchema } from '../../domain/platform_admin/platform_admin.domain.js';

export class PlatformAdminController {
  private service = new PlatformAdminService();

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = LoginSuperAdminSchema.parse(req.body);
      const token = await this.service.login(validatedData);

      res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 12 * 60 * 60 * 1000 
      });

      res.status(200).json({ success: true, message: 'Bienvenido al panel de administración SaaS' });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      if (error.message === 'CREDENCIALES_INVALIDAS') {
        res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  };

  logout = (req: Request, res: Response): void => {
    res.clearCookie('access_token');
    res.status(200).json({ success: true, message: 'Sesión de administración cerrada' });
  };
}