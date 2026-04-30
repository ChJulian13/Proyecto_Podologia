import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { type Application } from 'express';

// Cargamos el archivo físico swagger.yaml desde la raíz del proyecto
// process.cwd() asegura que siempre busque en la raíz, sin importar si estás en desarrollo o producción
const swaggerFilePath = path.join(process.cwd(), 'swagger.yaml');
const swaggerDocument = YAML.load(swaggerFilePath);

export const swaggerDocs = (app: Application, port: string | number) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};