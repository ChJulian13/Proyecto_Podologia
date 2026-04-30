import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../auth/auth.middleware.js';
import { ClinicaRepository } from '../../repositories/clinica/clinica.repository.js';

const clinicaRepository = new ClinicaRepository();

export const verificarSuscripcionActiva = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicaId = req.usuario?.clinicaId;

    if (!clinicaId) {
      res.status(400).json({ success: false, message: 'No se pudo identificar la clínica.' });
      return;
    }

    const clinica = await clinicaRepository.findById(clinicaId);

    if (!clinica) {
      res.status(404).json({ success: false, message: 'Clínica no encontrada.' });
      return;
    }

    // Bloqueo por suspensión administrativa
    if (clinica.esta_activa === 0) {
      res.status(403).json({
        success: false,
        message: 'El acceso a esta clínica está suspendido por la administración de la plataforma.',
        codigo_error: 'CLINICA_SUSPENDIDA'
      });
      return;
    }

    // Bloqueo por vencimiento de suscripción
    if (clinica.fecha_vencimiento_suscripcion) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const vencimiento = new Date(clinica.fecha_vencimiento_suscripcion);
      vencimiento.setHours(0, 0, 0, 0);

      if (hoy > vencimiento) {
        res.status(402).json({
          success: false,
          message: 'Tu plan ha vencido. Renueva tu suscripción para continuar.',
          codigo_error: 'SUSCRIPCION_VENCIDA'
        });
        return;
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al verificar la suscripción.' });
  }
};