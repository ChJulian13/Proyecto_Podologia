import 'dotenv/config';
import express, { type Application} from 'express';
import clinicaRoutes from './routes/clinica/clinica.routes.js'
import cors from 'cors';

const app: Application = express();

app.use(cors());

app.use(express.json());

app.use('/api/clinicas', clinicaRoutes);

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