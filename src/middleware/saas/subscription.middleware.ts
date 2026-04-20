import type { Response, NextFunction } from 'express';
import  { pool } from '../../config/database.js'; // Ajusta la ruta a tu base de datos
import type { AuthRequest } from '../auth/auth.middleware.js'; // Importamos tu interfaz tipada

export const verificarSuscripcionActiva = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicaId = req.usuario?.clinicaId; 

    if (!clinicaId) {
      res.status(400).json({ 
        success: false, 
        message: 'No se pudo identificar la clínica en la petición.' 
      });
      return;
    }

    // Consultamos el estado de la suscripción de la clínica en tiempo real
    const query = `
      SELECT esta_activa, fecha_vencimiento_suscripcion 
      FROM clinicas 
      WHERE id = ?
    `;
    const [rows] = await pool.execute<any[]>(query, [clinicaId]);

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Clínica no encontrada en el sistema.' });
      return;
    }

    const clinica = rows[0];

    // 1. Verificamos el "Switch Maestro" (Bloqueo manual por el SuperAdmin)
    if (clinica.esta_activa === 0 || clinica.esta_activa === false) {
      res.status(403).json({ 
        success: false, 
        message: 'El acceso a esta clínica ha sido suspendido por la administración.' 
      });
      return;
    }

    // 2. Verificamos la Fecha de Vencimiento del Plan SaaS
    if (clinica.fecha_vencimiento_suscripcion) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Reseteamos horas para comparar solo fechas puras
      
      const fechaVencimiento = new Date(clinica.fecha_vencimiento_suscripcion);
      fechaVencimiento.setHours(0, 0, 0, 0);

      if (hoy > fechaVencimiento) {
        // Código 402 Payment Required: El estándar de la industria para SaaS
        res.status(402).json({
          success: false,
          message: 'El plan de suscripción ha vencido. Por favor, regularice su pago para continuar operando.',
          codigo_error: 'SUSCRIPCION_VENCIDA'
        });
        return;
      }
    }

    // Si la clínica está activa y al corriente con sus pagos, la dejamos pasar
    next();

  } catch (error) {
    console.error('Error en middleware de suscripción:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno al verificar el estado de la clínica.' 
    });
  }
};