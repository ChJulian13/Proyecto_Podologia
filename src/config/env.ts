import { z } from 'zod';
import 'dotenv/config';

// Definimos el esquema estricto de nuestras variables de entorno
const envSchema = z.object({
  PORT: z.string().default('3000'),
  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string(),
  JWT_SECRET: z.string().min(10, "El secreto debe tener al menos 10 caracteres"),
  // Zod se encarga de transformar el texto del .env a un número real
  JWT_EXPIRES_IN: z.coerce.number().default(86400),
});

// Parseamos process.env. Si falta algo, Zod lanzará un error y el servidor se detendrá.
export const env = envSchema.parse(process.env);