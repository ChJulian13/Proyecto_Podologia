import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import 'dotenv/config';
import { swaggerDocs } from './config/swagger.js';
import { registerRoutes } from './config/routes.js';
import { errorHandler } from './middleware/error/error.middleware.js';

const app = express();

// 1. Configuraciones Globales
app.use(cors({
  origin: ['http://localhost:4100', 'http://localhost:4200'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 2. Documentación
swaggerDocs(app, process.env.PORT || 3000);

// 3. Registro de Rutas (públicas y protegidas)
registerRoutes(app);

// 4. Manejo centralizado de errores
app.use(errorHandler);

export default app;