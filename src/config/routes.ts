import type { Application } from 'express';
import { Router } from 'express';
import { verificarToken } from '../middleware/auth/auth.middleware.js';
import { verificarSuscripcionActiva } from '../middleware/saas/subscription.middleware.js';

import authRoutes from '../routes/auth/auth.routes.js';
import clinicaRoutes from '../routes/clinica/clinica.routes.js';
import usuarioRoutes from '../routes/usuario/usuario.routes.js';
import pacienteRoutes from '../routes/paciente/paciente.routes.js';
import servicioRoutes from '../routes/servicio/servicio.routes.js';
import citaRoutes from '../routes/cita/cita.routes.js';
import notaClinicaRoutes from '../routes/nota_clinica/nota_clinica.routes.js';
import imagenRoutes from '../routes/imagen_paciente/imagen_paciente.routes.js';
import facturaRoutes from '../routes/factura/factura.routes.js';
import anamnesisRoutes from '../routes/anamnesis/anamnesis.routes.js';
import dashboardRoutes from '../routes/dashboard/dashboard.routes.js';
import platformAdminRoutes from '../routes/platform_admin/platform_admin.routes.js';
import sepomexRoutes from '../integrations/sepomex/sepomex.routes.js';
import categoriaInventarioRoutes from '../routes/categoria_inventario/categoria_inventario.routes.js';
import inventarioRoutes from '../routes/inventario/inventario.routes.js';
import ventaInventarioRoutes from '../routes/venta_inventario/venta_inventario.routes.js';

export const registerRoutes = (app: Application): void => {
  // Rutas públicas
  // app.use('/api/auth', authRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/platform-admin', platformAdminRoutes);
  app.use('/api/clinicas', clinicaRoutes);
  app.use('/api/direcciones', sepomexRoutes); // Ruta pública para consulta de códigos postales

  // Rutas protegidas
  const apiProtegida = Router();
  apiProtegida.use(verificarToken);
  apiProtegida.use(verificarSuscripcionActiva);

  apiProtegida.use('/pacientes', pacienteRoutes);
  apiProtegida.use('/servicios', servicioRoutes);
  apiProtegida.use('/citas', citaRoutes);
  apiProtegida.use('/notas-clinicas', notaClinicaRoutes);
  apiProtegida.use('/imagenes-paciente', imagenRoutes);
  apiProtegida.use('/facturas', facturaRoutes);
  apiProtegida.use('/anamnesis', anamnesisRoutes);
  apiProtegida.use('/dashboard', dashboardRoutes);
  apiProtegida.use('/usuarios', usuarioRoutes);
  apiProtegida.use('/categorias-inventario', categoriaInventarioRoutes);
  apiProtegida.use('/inventario', inventarioRoutes);
  apiProtegida.use('/ventas-inventario', ventaInventarioRoutes);

  app.use('/api', apiProtegida);

  // 404 — Ruta no encontrada
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `La ruta ${req.method} ${req.url} no existe en esta API.`
    });
  });
};