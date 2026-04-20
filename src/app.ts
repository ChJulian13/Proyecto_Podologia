import path from 'path';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { swaggerDocs } from './config/swagger.js'; 

// Middlewares
import { verificarToken } from './middleware/auth/auth.middleware.js';
import { verificarSuscripcionActiva } from './middleware/saas/subscription.middleware.js';

// Rutas
import authRoutes from './routes/auth/auth.routes.js';
import clinicaRoutes from './routes/clinica/clinica.routes.js'
import usuarioRoutes from './routes/usuario/usuario.routes.js';
import pacienteRoutes from './routes/paciente/paciente.routes.js';
import servicioRoutes from './routes/servicio/servicio.routes.js';
import citaRoutes from './routes/cita/cita.routes.js';
import notaClinicaRoutes from './routes/nota_clinica/nota_clinica.routes.js';
import imagenRoutes from './routes/imagen_paciente/imagen_paciente.routes.js';
import facturaRoutes from './routes/factura/factura.routes.js';
import dashboardRoutes from './routes/dashboard/dashboard.routes.js';

const app = express();

// 1. Configuraciones Globales
app.use(cors({
  origin: 'http://localhost:4200', 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// =========================================================
// 2. RUTAS PÚBLICAS (No requieren token ni suscripción)
// =========================================================
app.use('/api/auth', authRoutes); 

const PORT = process.env.PORT || 3000;

swaggerDocs(app, PORT);


// (Opcional) Si el SuperAdmin usa /api/clinicas para registrarlas, ponlo aquí.
// Si las clínicas lo usan para ver su propia info, ponlo en las protegidas.
app.use('/api/clinicas', clinicaRoutes); 

// =========================================================
// 3. RUTAS PROTEGIDAS (Operación diaria del SaaS)
// =========================================================
// Creamos un sub-enrutador exclusivo para lo que requiere seguridad
const apiProtegida = express.Router();

apiProtegida.use(verificarToken, verificarSuscripcionActiva);

apiProtegida.use('/pacientes', pacienteRoutes);
apiProtegida.use('/servicios', servicioRoutes);
apiProtegida.use('/citas', citaRoutes); 
apiProtegida.use('/notas-clinicas', notaClinicaRoutes);
apiProtegida.use('/imagenes-paciente', imagenRoutes); 
apiProtegida.use('/facturas', facturaRoutes);
apiProtegida.use('/dashboard', dashboardRoutes);
apiProtegida.use('/usuarios', usuarioRoutes);

app.use('/api', apiProtegida);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `La ruta ${req.method} ${req.url} no existe en esta API.`
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});