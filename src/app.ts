import path from 'path';
import 'dotenv/config';
import express from 'express';
import clinicaRoutes from './routes/clinica/clinica.routes.js'
import usuarioRoutes from './routes/usuario/usuario.routes.js';
import authRoutes from './routes/auth/auth.routes.js';
import pacienteRoutes from './routes/paciente/paciente.routes.js';
import servicioRoutes from './routes/servicio/servicio.routes.js';
import citaRoutes from './routes/cita/cita.routes.js';
import notaClinicaRoutes from './routes/nota_clinica/nota_clinica.routes.js';
import imagenRoutes from './routes/imagen_paciente/imagen_paciente.routes.js';
import facturaRoutes from './routes/factura/factura.routes.js';
import cors from 'cors';
import dashboardRoutes from './routes/dashboard/dashboard.routes.js';

const app = express();

app.use(cors());

app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/clinicas', clinicaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/citas', citaRoutes); 
app.use('/api/notas-clinicas', notaClinicaRoutes);
app.use('/api/imagenes-paciente', imagenRoutes); 
app.use('/api/facturas', facturaRoutes);
app.use('/api/dashboard', dashboardRoutes); 

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `La ruta ${req.method} ${req.url} no existe en esta API.`
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});