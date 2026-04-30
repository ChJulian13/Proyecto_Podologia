// src/middleware/error/error.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { 
  NotFoundError, 
  ConflictError, 
  ValidationError, 
  UnauthorizedError, 
  ForbiddenError,
  BadRequestError
} from '../../common/errors/domain.errors.js';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Errores de validación Zod (lanzados por schema.parse())
  if (error instanceof ZodError) {
    res.status(400).json({ success: false, errors: error.issues });
    return;
  }
  
  // Errores de Dominio Personalizados
  if (error instanceof ValidationError) {
    res.status(400).json({ success: false, errors: error.errors });
    return;
  }
  if (error instanceof BadRequestError) {
    res.status(400).json({ success: false, message: error.message });
    return;
  }
  if (error instanceof UnauthorizedError) {
    res.status(401).json({ success: false, message: error.message });
    return;
  }
  if (error instanceof ForbiddenError) {
    res.status(403).json({ success: false, message: error.message });
    return;
  }
  if (error instanceof NotFoundError) {
    res.status(404).json({ success: false, message: error.message });
    return;
  }
  if (error instanceof ConflictError) {
    res.status(409).json({ success: false, message: error.message });
    return;
  }

  // Error Crítico (Unhandled)
  console.error(`[${req.method}] ${req.path} >>`, error);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
};